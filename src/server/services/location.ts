import "server-only";
import { asc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { db, schema as s } from "../db";
import { haversineKm, type LatLng } from "@/lib/geo";

export const AREA_COOKIE = "he_area";
export const DEFAULT_AREA = "matara";

export type Town = typeof s.towns.$inferSelect;

/**
 * Location is behind this small interface so a geocoding service can replace
 * the static town table later without touching callers.
 */
export interface LocationProvider {
  listTowns(): Promise<Town[]>;
  nearestTown(p: LatLng): Promise<Town | null>;
}

class StaticTownLocationProvider implements LocationProvider {
  listTowns = cache(async () =>
    db.select().from(s.towns).where(eq(s.towns.isActive, true)).orderBy(asc(s.towns.sort), asc(s.towns.name)),
  );

  async nearestTown(p: LatLng) {
    const towns = await this.listTowns();
    let best: Town | null = null;
    let bestKm = Infinity;
    for (const t of towns) {
      const km = haversineKm(p, t);
      if (km < bestKm) {
        best = t;
        bestKm = km;
      }
    }
    // Outside the launch area: still return the nearest town, the UI shows distance.
    return best;
  }
}

export const location: LocationProvider = new StaticTownLocationProvider();

/** The customer's current area: explicit param > cookie > launch default. */
export const getArea = cache(async (param?: string | null): Promise<Town> => {
  const towns = await location.listTowns();
  const bySlug = (slug?: string | null) => (slug ? towns.find((t) => t.slug === slug) : undefined);
  const fromCookie = (await cookies()).get(AREA_COOKIE)?.value;
  return bySlug(param) ?? bySlug(fromCookie) ?? bySlug(DEFAULT_AREA) ?? towns[0];
});
