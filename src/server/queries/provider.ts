import "server-only";
import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { cache } from "react";
import { db, schema as s } from "../db";
import { haversineKm } from "@/lib/geo";
import { isAvailable } from "@/lib/time";
import type { Town } from "../services/location";

export const getProviderBySlug = cache(async (slug: string) => {
  const [row] = await db
    .select({ p: s.providers, town: s.towns })
    .from(s.providers)
    .leftJoin(s.towns, eq(s.towns.id, s.providers.townId))
    .where(eq(s.providers.slug, slug))
    .limit(1);
  return row ?? null;
});

export type ReviewView = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  authorName: string;
  tags: string[];
};

export async function getProviderReviews(providerId: string, limit?: number): Promise<ReviewView[]> {
  const q = db
    .select({
      id: s.reviews.id,
      rating: s.reviews.rating,
      comment: s.reviews.comment,
      createdAt: s.reviews.createdAt,
      name: s.users.name,
    })
    .from(s.reviews)
    .innerJoin(s.users, eq(s.users.id, s.reviews.userId))
    .where(and(eq(s.reviews.providerId, providerId), eq(s.reviews.status, "published")))
    .orderBy(desc(s.reviews.createdAt));
  const rows = limit ? await q.limit(limit) : await q;
  if (!rows.length) return [];
  const links = await db
    .select({ reviewId: s.reviewTagLinks.reviewId, name: s.reviewTags.name, sort: s.reviewTags.sort })
    .from(s.reviewTagLinks)
    .innerJoin(s.reviewTags, eq(s.reviewTags.id, s.reviewTagLinks.tagId))
    .where(inArray(s.reviewTagLinks.reviewId, rows.map((r) => r.id)))
    .orderBy(asc(s.reviewTags.sort));
  const tags = new Map<string, string[]>();
  for (const l of links) tags.set(l.reviewId, [...(tags.get(l.reviewId) ?? []), l.name]);
  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    // First name only, for privacy.
    authorName: (r.name ?? "Customer").split(" ")[0],
    tags: tags.get(r.id) ?? [],
  }));
}

export async function getTagSummary(providerId: string) {
  return db
    .select({ name: s.reviewTags.name, n: count() })
    .from(s.reviewTagLinks)
    .innerJoin(s.reviews, eq(s.reviews.id, s.reviewTagLinks.reviewId))
    .innerJoin(s.reviewTags, eq(s.reviewTags.id, s.reviewTagLinks.tagId))
    .where(and(eq(s.reviews.providerId, providerId), eq(s.reviews.status, "published")))
    .groupBy(s.reviewTags.name, s.reviewTags.sort)
    .orderBy(desc(count()), asc(s.reviewTags.sort));
}

export async function getProviderProfile(slug: string, area: Town) {
  const row = await getProviderBySlug(slug);
  if (!row) return null;
  const { p, town } = row;
  const [categories, services, photos, tagSummary, reviews] = await Promise.all([
    db
      .select({ id: s.serviceCategories.id, slug: s.serviceCategories.slug, name: s.serviceCategories.name })
      .from(s.providerCategories)
      .innerJoin(s.serviceCategories, eq(s.serviceCategories.id, s.providerCategories.categoryId))
      .where(eq(s.providerCategories.providerId, p.id))
      .orderBy(asc(s.serviceCategories.sort)),
    db.select().from(s.providerServices).where(eq(s.providerServices.providerId, p.id)).orderBy(asc(s.providerServices.sort)),
    db.select().from(s.providerPhotos).where(eq(s.providerPhotos.providerId, p.id)).orderBy(asc(s.providerPhotos.sort), asc(s.providerPhotos.id)),
    getTagSummary(p.id),
    getProviderReviews(p.id),
  ]);
  return {
    provider: p,
    town,
    distanceKm: town ? haversineKm(area, town) : null,
    available: isAvailable(p.availableUntil),
    categories,
    services,
    photos,
    tagSummary,
    reviews,
  };
}

export type ProviderProfile = NonNullable<Awaited<ReturnType<typeof getProviderProfile>>>;

/** Distinct people per event type over the last `days` days — for the provider dashboard. */
export async function getProviderStats(providerId: string, days = 7) {
  const rows = await db.execute<{ type: string; people: number }>(sql`
    select type, count(distinct coalesce(visitor_id, id::text))::int as people
    from events
    where provider_id = ${providerId}
      and occurred_at > now() - make_interval(days => ${days})
      and type in ('PROVIDER_IMPRESSION', 'PROVIDER_PROFILE_OPENED', 'CALL_CLICKED', 'WHATSAPP_CLICKED', 'PHONE_REVEALED')
    group by type
  `);
  const m = new Map((rows as unknown as { type: string; people: number }[]).map((r) => [r.type, r.people]));
  return {
    impressions: m.get("PROVIDER_IMPRESSION") ?? 0,
    views: m.get("PROVIDER_PROFILE_OPENED") ?? 0,
    calls: (m.get("CALL_CLICKED") ?? 0) + (m.get("PHONE_REVEALED") ?? 0),
    whatsapp: m.get("WHATSAPP_CLICKED") ?? 0,
  };
}
