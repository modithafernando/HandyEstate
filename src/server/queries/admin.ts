import "server-only";
import { sql } from "drizzle-orm";
import { db } from "../db";

async function rows<T>(q: ReturnType<typeof sql>) {
  return (await db.execute(q)) as unknown as T[];
}

export async function getMarketplaceMetrics(days: number) {
  const since = sql`now() - make_interval(days => ${days})`;
  const [events, visitors, providers, queue, topCategories, topAreas, zeroResults, perDay] = await Promise.all([
    rows<{ type: string; n: number; people: number }>(sql`
      select type, count(*)::int as n, count(distinct visitor_id)::int as people
      from events where occurred_at > ${since} group by type`),
    rows<{ visitors: number; returning: number }>(sql`
      select count(*)::int as visitors, count(*) filter (where days > 1)::int as returning
      from (select visitor_id, count(distinct date(occurred_at at time zone 'Asia/Colombo')) as days
            from events where occurred_at > ${since} and visitor_id is not null group by visitor_id) v`),
    rows<{ status: string; n: number; available: number; verified: number }>(sql`
      select status, count(*)::int as n,
             count(*) filter (where available_until > now())::int as available,
             count(*) filter (where is_verified)::int as verified
      from providers group by status`),
    rows<{ verifications: number; reports: number }>(sql`
      select (select count(*) from verifications where status = 'pending')::int as verifications,
             (select count(*) from reports where status = 'open')::int as reports`),
    rows<{ name: string; searches: number }>(sql`
      select c.name, count(*)::int as searches from events e join service_categories c on c.id = e.category_id
      where e.type = 'SEARCH_PERFORMED' and e.occurred_at > ${since} group by c.name order by 2 desc limit 10`),
    rows<{ name: string; searches: number }>(sql`
      select t.name, count(*)::int as searches from events e join towns t on t.id = e.town_id
      where e.type = 'SEARCH_PERFORMED' and e.occurred_at > ${since} group by t.name order by 2 desc limit 10`),
    rows<{ query: string; area: string | null; n: number }>(sql`
      select coalesce(e.query, c.name, '(browse)') as query, t.name as area, count(*)::int as n
      from events e left join service_categories c on c.id = e.category_id left join towns t on t.id = e.town_id
      where e.type = 'SEARCH_PERFORMED' and e.occurred_at > ${since} and (e.props->>'results')::int = 0
      group by 1, 2 order by 3 desc limit 15`),
    rows<{ day: string; searches: number; calls: number }>(sql`
      select to_char(date(occurred_at at time zone 'Asia/Colombo'), 'Mon DD') as day,
             count(*) filter (where type = 'SEARCH_PERFORMED')::int as searches,
             count(*) filter (where type in ('CALL_CLICKED', 'WHATSAPP_CLICKED', 'PHONE_REVEALED'))::int as calls
      from events where occurred_at > ${since}
      group by date(occurred_at at time zone 'Asia/Colombo') order by date(occurred_at at time zone 'Asia/Colombo') desc limit 14`),
  ]);
  const ev = new Map(events.map((e) => [e.type, e]));
  return { ev, visitors: visitors[0], providers, queue: queue[0], topCategories, topAreas, zeroResults, perDay };
}
