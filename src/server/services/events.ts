import "server-only";
import { db, schema as s } from "../db";
import type { EventType } from "../db/schema";
import { getCurrentUser } from "./auth";
import { getVisitorId, isBotRequest } from "./request";

export type EventContext = {
  providerId?: string | null;
  categoryId?: number | null;
  townId?: number | null;
  query?: string | null;
  source?: string | null;
  props?: Record<string, unknown>;
};

/** Record one analytics event. Never throws — analytics must not break the product. */
export async function track(type: EventType, ctx: EventContext = {}) {
  try {
    if (await isBotRequest()) return;
    const [visitorId, user] = await Promise.all([getVisitorId(), getCurrentUser()]);
    await db.insert(s.events).values({
      type,
      visitorId,
      userId: user?.id ?? null,
      providerId: ctx.providerId ?? null,
      categoryId: ctx.categoryId ?? null,
      townId: ctx.townId ?? null,
      query: ctx.query?.slice(0, 200) ?? null,
      source: ctx.source?.slice(0, 40) ?? null,
      props: ctx.props ?? null,
    });
  } catch (err) {
    console.error("[events] failed to record", type, err);
  }
}

export async function trackMany(rows: ({ type: EventType } & EventContext)[]) {
  if (!rows.length) return;
  try {
    if (await isBotRequest()) return;
    const [visitorId, user] = await Promise.all([getVisitorId(), getCurrentUser()]);
    await db.insert(s.events).values(
      rows.map((r) => ({
        type: r.type,
        visitorId,
        userId: user?.id ?? null,
        providerId: r.providerId ?? null,
        categoryId: r.categoryId ?? null,
        townId: r.townId ?? null,
        query: r.query?.slice(0, 200) ?? null,
        source: r.source?.slice(0, 40) ?? null,
        props: r.props ?? null,
      })),
    );
  } catch (err) {
    console.error("[events] failed to record batch", err);
  }
}
