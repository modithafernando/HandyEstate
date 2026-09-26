"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema as s } from "@/server/db";
import { getCurrentUser } from "@/server/services/auth";
import { track } from "@/server/services/events";
import { getVisitorId } from "@/server/services/request";
import { hadContact, recalcRating } from "@/server/services/reviews";

const Review = z.object({
  providerId: z.uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  tags: z.array(z.coerce.number().int().positive()).max(6),
  comment: z.string().trim().max(400).optional(),
  name: z.string().trim().max(60).optional(),
});

export type ReviewState = { error?: "rating" | "name" | "generic" } | null;

export async function submitReview(_prev: ReviewState, form: FormData): Promise<ReviewState> {
  const user = await getCurrentUser();
  if (!user) return { error: "generic" };
  const parsed = Review.safeParse({
    providerId: form.get("providerId"),
    rating: form.get("rating") ?? undefined,
    tags: form.getAll("tags"),
    comment: form.get("comment") || undefined,
    name: form.get("name") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues.some((i) => i.path[0] === "rating") ? "rating" : "generic" };
  const d = parsed.data;

  if (!user.name) {
    if (!d.name) return { error: "name" };
    await db.update(s.users).set({ name: d.name }).where(eq(s.users.id, user.id));
  }

  const [provider] = await db
    .select({ id: s.providers.id, slug: s.providers.slug, userId: s.providers.userId })
    .from(s.providers)
    .where(and(eq(s.providers.id, d.providerId), eq(s.providers.status, "approved")))
    .limit(1);
  if (!provider || provider.userId === user.id) return { error: "generic" };

  const contact = await hadContact(provider.id, user.id, await getVisitorId());
  await db.transaction(async (tx) => {
    // One review per person per provider — posting again replaces it.
    await tx.delete(s.reviews).where(and(eq(s.reviews.providerId, provider.id), eq(s.reviews.userId, user.id)));
    const [rev] = await tx
      .insert(s.reviews)
      .values({ providerId: provider.id, userId: user.id, rating: d.rating, comment: d.comment || null, hadContact: contact })
      .returning({ id: s.reviews.id });
    const tagIds = [...new Set(d.tags)];
    if (tagIds.length) await tx.insert(s.reviewTagLinks).values(tagIds.map((tagId) => ({ reviewId: rev.id, tagId })));
  });
  await recalcRating(provider.id);
  await track("REVIEW_SUBMITTED", { providerId: provider.id, props: { rating: d.rating, hadContact: contact } });
  redirect(`/p/${provider.slug}?reviewed=1#reviews`);
}

const Report = z.object({
  providerId: z.uuid(),
  reason: z.enum(["wrong_number", "not_real", "bad_behaviour", "other"]),
  details: z.string().trim().max(1000).optional(),
});

export async function submitReport(_prev: { ok?: boolean; error?: boolean } | null, form: FormData) {
  const parsed = Report.safeParse({ providerId: form.get("providerId"), reason: form.get("reason"), details: form.get("details") || undefined });
  if (!parsed.success) return { error: true };
  const user = await getCurrentUser();
  await db.insert(s.reports).values({ ...parsed.data, userId: user?.id ?? null, visitorId: await getVisitorId() });
  await track("REPORT_SUBMITTED", { providerId: parsed.data.providerId, props: { reason: parsed.data.reason } });
  return { ok: true };
}
