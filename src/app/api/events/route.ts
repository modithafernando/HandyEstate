import { z } from "zod";
import { trackMany } from "@/server/services/events";

const Event = z.object({
  type: z.enum(["SEARCH_PERFORMED", "PROVIDER_IMPRESSION", "PROVIDER_PROFILE_OPENED"]),
  providerId: z.uuid().optional(),
  categoryId: z.number().int().positive().nullish(),
  townId: z.number().int().positive().nullish(),
  query: z.string().max(200).nullish(),
  source: z.string().max(40).optional(),
  props: z.record(z.string(), z.union([z.string().max(100), z.number(), z.boolean(), z.null()])).optional(),
});
const Body = z.object({ events: z.array(Event).max(50) });

/** Beacon endpoint for client-side views (impressions, profile opens, searches). */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  await trackMany(parsed.data.events);
  return new Response(null, { status: 204 });
}
