import { storage } from "@/server/services/storage";

/** Serves public uploads (dev storage driver). Private keys are never reachable here. */
export async function GET(_req: Request, ctx: RouteContext<"/media/[...key]">) {
  const { key } = await ctx.params;
  if (key.some((part) => part === ".." || part.includes("\\"))) return new Response("Not found", { status: 404 });
  const obj = await storage.get(`public/${key.join("/")}`);
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(obj.data), {
    headers: { "content-type": obj.contentType, "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" },
  });
}
