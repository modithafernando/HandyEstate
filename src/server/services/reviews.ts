import "server-only";
import { and, eq, inArray, or, sql } from "drizzle-orm";
import { db, schema as s } from "../db";

/** Recompute the denormalised rating on providers from published reviews. */
export async function recalcRating(providerId: string) {
  await db.execute(sql`
    update providers set
      rating_sum = coalesce((select sum(rating) from reviews where provider_id = ${providerId} and status = 'published'), 0),
      review_count = (select count(*) from reviews where provider_id = ${providerId} and status = 'published')
    where id = ${providerId}
  `);
}

/** Did this person tap Call / WhatsApp / Show number for this provider? Stored now, enforced later. */
export async function hadContact(providerId: string, userId: string, visitorId: string | null) {
  const who = visitorId ? or(eq(s.events.userId, userId), eq(s.events.visitorId, visitorId)) : eq(s.events.userId, userId);
  const [row] = await db
    .select({ id: s.events.id })
    .from(s.events)
    .where(and(eq(s.events.providerId, providerId), inArray(s.events.type, ["CALL_CLICKED", "WHATSAPP_CLICKED", "PHONE_REVEALED"]), who))
    .limit(1);
  return !!row;
}
