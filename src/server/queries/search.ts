import "server-only";
import { asc, inArray, sql, type SQL } from "drizzle-orm";
import { db, schema as s } from "../db";
import { PRIOR_MEAN, PRIOR_WEIGHT } from "@/lib/rating";
import type { Town } from "../services/location";

export const WIDEN_KM = 25;
const MIN_RESULTS = 3;
/** Town centroids are approximate; give a little slack when checking service radius. */
const RADIUS_SLACK_KM = 2;

export type ProviderSummary = {
  id: string;
  slug: string;
  displayName: string;
  businessName: string | null;
  photoKey: string | null;
  townName: string;
  distanceKm: number;
  serviceRadiusKm: number;
  isVerified: boolean;
  available: boolean;
  ratingSum: number;
  reviewCount: number;
  hasWhatsapp: boolean;
  services: string[];
};

type Row = {
  id: string;
  slug: string;
  display_name: string;
  business_name: string | null;
  photo_key: string | null;
  town_name: string;
  distance_km: number;
  service_radius_km: number;
  is_verified: boolean;
  available: boolean;
  rating_sum: number;
  review_count: number;
  has_whatsapp: boolean;
};

export type SearchParams = {
  area: Town;
  categoryId?: number | null;
  text?: string | null;
  limit?: number;
  /** Only providers taking work today (home page list). */
  availableOnly?: boolean;
};

function distanceSql(area: Town) {
  return sql`(6371 * 2 * asin(sqrt(
    power(sin(radians(t.lat - ${area.lat}) / 2), 2) +
    cos(radians(${area.lat})) * cos(radians(t.lat)) * power(sin(radians(t.lng - ${area.lng}) / 2), 2)
  )))`;
}

async function run(p: SearchParams, reach: "radius" | "widened"): Promise<Row[]> {
  const dist = distanceSql(p.area);
  const filters: SQL[] = [sql`p.status = 'approved'`];
  if (p.categoryId) {
    filters.push(sql`exists (select 1 from provider_categories pc where pc.provider_id = p.id and pc.category_id = ${p.categoryId})`);
  }
  if (p.text) {
    const like = `%${p.text.replace(/[%_\\]/g, (m) => `\\${m}`)}%`;
    filters.push(sql`(
      p.display_name ilike ${like} or p.business_name ilike ${like} or p.bio ilike ${like}
      or exists (select 1 from provider_services ps where ps.provider_id = p.id and ps.name ilike ${like})
    )`);
  }
  if (p.availableOnly) filters.push(sql`p.available_until > now()`);
  filters.push(
    reach === "radius"
      ? sql`${dist} <= p.service_radius_km + ${RADIUS_SLACK_KM}`
      : sql`${dist} <= ${WIDEN_KM}`,
  );

  // Ranking: available today → distance band → verified → Bayesian rating → recently active.
  const rows = await db.execute<Row>(sql`
    select p.id, p.slug, p.display_name, p.business_name, p.photo_key, t.name as town_name,
           ${dist} as distance_km, p.service_radius_km, p.is_verified,
           coalesce(p.available_until > now(), false) as available,
           p.rating_sum, p.review_count, (p.whatsapp is not null) as has_whatsapp
    from providers p
    join towns t on t.id = p.town_id
    where ${sql.join(filters, sql` and `)}
    order by
      coalesce(p.available_until > now(), false) desc,
      case when ${dist} <= 3 then 0 when ${dist} <= 8 then 1 when ${dist} <= 15 then 2 else 3 end,
      p.is_verified desc,
      (p.rating_sum + ${PRIOR_MEAN * PRIOR_WEIGHT}) / (p.review_count + ${PRIOR_WEIGHT}) desc,
      p.last_active_at desc nulls last
    limit ${p.limit ?? 50}
  `);
  return rows as unknown as Row[];
}

export async function searchProviders(p: SearchParams): Promise<{ providers: ProviderSummary[]; widened: boolean }> {
  let rows = await run(p, "radius");
  let widened = false;
  if (rows.length < MIN_RESULTS && !p.availableOnly) {
    const wide = await run(p, "widened");
    if (wide.length > rows.length) {
      rows = wide;
      widened = true;
    }
  }
  return { providers: await withServices(rows), widened };
}

async function withServices(rows: Row[]): Promise<ProviderSummary[]> {
  if (!rows.length) return [];
  const services = await db
    .select({ providerId: s.providerServices.providerId, name: s.providerServices.name })
    .from(s.providerServices)
    .where(inArray(s.providerServices.providerId, rows.map((r) => r.id)))
    .orderBy(asc(s.providerServices.sort));
  const byProvider = new Map<string, string[]>();
  for (const sv of services) byProvider.set(sv.providerId, [...(byProvider.get(sv.providerId) ?? []), sv.name]);

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    displayName: r.display_name,
    businessName: r.business_name,
    photoKey: r.photo_key,
    townName: r.town_name,
    distanceKm: Number(r.distance_km),
    serviceRadiusKm: r.service_radius_km,
    isVerified: r.is_verified,
    available: r.available,
    ratingSum: r.rating_sum,
    reviewCount: r.review_count,
    hasWhatsapp: r.has_whatsapp,
    services: (byProvider.get(r.id) ?? []).slice(0, 3),
  }));
}
