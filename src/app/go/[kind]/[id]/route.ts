import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveContact } from "@/server/services/contact";

/** No-JS fallback for Call / WhatsApp: record the tap, then hand off. */
export async function GET(req: Request, ctx: RouteContext<"/go/[kind]/[id]">) {
  const { kind, id } = await ctx.params;
  const k = z.enum(["call", "whatsapp"]).safeParse(kind);
  if (!k.success || !z.uuid().safeParse(id).success) return new Response("Not found", { status: 404 });
  const source = new URL(req.url).searchParams.get("s")?.slice(0, 40) ?? "link";
  const r = await resolveContact(id, k.data, source);
  if ("error" in r) return new Response(r.error === "rate" ? "Too many requests" : "Not found", { status: r.error === "rate" ? 429 : 404 });
  return new NextResponse(null, { status: 302, headers: { location: r.href, "cache-control": "no-store" } });
}
