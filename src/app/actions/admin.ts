"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema as s } from "@/server/db";
import { requireAdmin } from "@/server/services/auth";
import { track } from "@/server/services/events";
import { recalcRating } from "@/server/services/reviews";
import { storage } from "@/server/services/storage";
import { slugify } from "@/lib/slug";

async function audit(action: string, props: Record<string, unknown>, providerId?: string) {
  await track("ADMIN_ACTION", { providerId, props: { action, ...props } });
}

// ─── Providers ───────────────────────────────────────────────────────────────

export async function setProviderStatus(form: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(form.get("id"));
  const status = z.enum(["approved", "suspended", "pending"]).parse(form.get("status"));
  const reason = String(form.get("reason") ?? "").trim().slice(0, 300) || null;
  await db
    .update(s.providers)
    .set({
      status,
      suspendedReason: status === "suspended" ? reason : null,
      ...(status === "approved" ? { approvedAt: new Date() } : {}),
      ...(status !== "approved" ? { availableUntil: null } : {}),
    })
    .where(eq(s.providers.id, id));
  await audit("provider_status", { status, reason }, id);
  revalidatePath("/admin", "layout");
}

// ─── Verification ────────────────────────────────────────────────────────────

export async function decideVerification(form: FormData) {
  const admin = await requireAdmin();
  const id = z.uuid().parse(form.get("id"));
  const decision = z.enum(["approved", "rejected"]).parse(form.get("decision"));
  const note = String(form.get("note") ?? "").trim().slice(0, 300) || null;
  const [v] = await db.select().from(s.verifications).where(eq(s.verifications.id, id));
  if (!v || v.status !== "pending") return;

  await db
    .update(s.verifications)
    .set({ status: decision, note, reviewerId: admin.id, reviewedAt: new Date(), documentKey: null })
    .where(eq(s.verifications.id, id));
  // The NIC photo is only needed for the decision — delete it now.
  if (v.documentKey) await storage.delete(v.documentKey);
  if (decision === "approved") await db.update(s.providers).set({ isVerified: true }).where(eq(s.providers.id, v.providerId));
  await audit("verification", { decision }, v.providerId);
  revalidatePath("/admin", "layout");
}

export async function revokeVerified(form: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(form.get("id"));
  await db.update(s.providers).set({ isVerified: false }).where(eq(s.providers.id, id));
  await audit("verification_revoked", {}, id);
  revalidatePath("/admin", "layout");
}

// ─── Categories ──────────────────────────────────────────────────────────────

const Category = z.object({
  id: z.coerce.number().int().optional(),
  name: z.string().trim().min(2).max(40),
  icon: z.string().trim().min(1).max(40),
  sort: z.coerce.number().int().min(0).max(1000),
  isActive: z.boolean(),
  searchTerms: z.array(z.string()),
});

export async function saveCategory(form: FormData) {
  await requireAdmin();
  const d = Category.parse({
    id: form.get("id") || undefined,
    name: form.get("name"),
    icon: form.get("icon"),
    sort: form.get("sort") || 100,
    isActive: form.get("isActive") === "on",
    searchTerms: String(form.get("searchTerms") ?? "")
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 200),
  });
  const values = { name: d.name, icon: d.icon, sort: d.sort, isActive: d.isActive, searchTerms: d.searchTerms };
  if (d.id) await db.update(s.serviceCategories).set(values).where(eq(s.serviceCategories.id, d.id));
  else await db.insert(s.serviceCategories).values({ ...values, slug: slugify(d.name) });
  await audit("category_saved", { name: d.name });
  revalidatePath("/", "layout");
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export async function setReviewStatus(form: FormData) {
  await requireAdmin();
  const id = z.uuid().parse(form.get("id"));
  const status = z.enum(["published", "hidden"]).parse(form.get("status"));
  const [r] = await db.update(s.reviews).set({ status }).where(eq(s.reviews.id, id)).returning({ providerId: s.reviews.providerId });
  if (r) {
    await recalcRating(r.providerId);
    await audit("review_status", { status, reviewId: id }, r.providerId);
  }
  revalidatePath("/admin/reviews");
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function resolveReport(form: FormData) {
  const admin = await requireAdmin();
  const id = z.uuid().parse(form.get("id"));
  const status = z.enum(["resolved", "dismissed"]).parse(form.get("status"));
  await db.update(s.reports).set({ status, resolvedBy: admin.id, resolvedAt: new Date() }).where(eq(s.reports.id, id));
  await audit("report", { status, reportId: id });
  revalidatePath("/admin", "layout");
}
