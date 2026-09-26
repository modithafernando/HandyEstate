import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema as s } from "../db";

export async function getOwnProvider(providerId: string) {
  const [p] = await db.select().from(s.providers).where(eq(s.providers.id, providerId)).limit(1);
  if (!p) return null;
  const [cats, services, photos, verifications, town] = await Promise.all([
    db.select({ id: s.providerCategories.categoryId }).from(s.providerCategories).where(eq(s.providerCategories.providerId, providerId)),
    db.select().from(s.providerServices).where(eq(s.providerServices.providerId, providerId)).orderBy(asc(s.providerServices.sort)),
    db.select().from(s.providerPhotos).where(eq(s.providerPhotos.providerId, providerId)).orderBy(asc(s.providerPhotos.sort), asc(s.providerPhotos.id)),
    db.select().from(s.verifications).where(eq(s.verifications.providerId, providerId)).orderBy(desc(s.verifications.createdAt)).limit(1),
    p.townId ? db.select().from(s.towns).where(eq(s.towns.id, p.townId)) : Promise.resolve([]),
  ]);
  return { p, categoryIds: cats.map((c) => c.id), services, photos, verification: verifications[0] ?? null, town: town[0] ?? null };
}

export type OwnProvider = NonNullable<Awaited<ReturnType<typeof getOwnProvider>>>;

export function completeness(o: OwnProvider) {
  return {
    photo: !!o.p.photoKey,
    bio: !!o.p.bio && o.p.bio.length >= 20,
    prices: o.services.some((sv) => sv.priceFrom != null),
    photos: o.photos.length >= 3,
    verify: o.p.isVerified,
    whatsapp: !!o.p.whatsapp,
  };
}
