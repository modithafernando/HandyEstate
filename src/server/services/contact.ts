import "server-only";
import { and, count, eq, gt, inArray } from "drizzle-orm";
import { db, schema as s } from "../db";
import { formatLkPhone, whatsappDigits } from "@/lib/phone";
import { interpolate } from "@/lib/i18n/translate";
import { en } from "@/lib/i18n/en";
import { track } from "./events";
import { getVisitorId } from "./request";

export type ContactKind = "call" | "whatsapp" | "reveal";

const LIMIT_PER_HOUR = 40;

/**
 * Resolves a contact tap to a tel:/wa.me link and records it.
 * Numbers are only handed out one at a time, per tap, with a per-visitor limit.
 */
export async function resolveContact(providerId: string, kind: ContactKind, source: string | null) {
  const [p] = await db
    .select({ id: s.providers.id, phone: s.providers.phone, whatsapp: s.providers.whatsapp, name: s.providers.displayName, townId: s.providers.townId })
    .from(s.providers)
    .where(and(eq(s.providers.id, providerId), eq(s.providers.status, "approved")))
    .limit(1);
  if (!p) return { error: "not_found" as const };
  if (kind === "whatsapp" && !p.whatsapp) return { error: "not_found" as const };

  const visitorId = await getVisitorId();
  if (visitorId) {
    const [{ n }] = await db
      .select({ n: count() })
      .from(s.events)
      .where(
        and(
          eq(s.events.visitorId, visitorId),
          inArray(s.events.type, ["CALL_CLICKED", "WHATSAPP_CLICKED", "PHONE_REVEALED"]),
          gt(s.events.occurredAt, new Date(Date.now() - 3600_000)),
        ),
      );
    if (n >= LIMIT_PER_HOUR) return { error: "rate" as const };
  }

  const type = kind === "call" ? "CALL_CLICKED" : kind === "whatsapp" ? "WHATSAPP_CLICKED" : "PHONE_REVEALED";
  await track(type, { providerId: p.id, townId: p.townId, source });

  if (kind === "whatsapp") {
    const text = encodeURIComponent(interpolate(en["provider.whatsappGreeting"], { name: p.name }));
    return { href: `https://wa.me/${whatsappDigits(p.whatsapp!)}?text=${text}` };
  }
  return { href: `tel:${p.phone}`, display: formatLkPhone(p.phone) };
}
