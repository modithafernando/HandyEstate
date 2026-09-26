import { z } from "zod";
import { resolveContact } from "@/server/services/contact";

const Body = z.object({
  providerId: z.uuid(),
  kind: z.enum(["call", "whatsapp", "reveal"]),
  source: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  // Same-origin only: this hands out phone numbers.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return new Response(null, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  const r = await resolveContact(parsed.data.providerId, parsed.data.kind, parsed.data.source ?? null);
  if ("error" in r) return Response.json({ error: r.error }, { status: r.error === "rate" ? 429 : 404 });
  return Response.json(r, { headers: { "cache-control": "no-store" } });
}
