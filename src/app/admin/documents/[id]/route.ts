import { eq } from "drizzle-orm";
import { db, schema as s } from "@/server/db";
import { getCurrentUser } from "@/server/services/auth";
import { track } from "@/server/services/events";
import { storage } from "@/server/services/storage";

/** Private NIC photos — admins only, never cached. */
export async function GET(_req: Request, ctx: RouteContext<"/admin/documents/[id]">) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return new Response("Not found", { status: 404 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
  const [v] = await db.select().from(s.verifications).where(eq(s.verifications.id, id));
  if (!v?.documentKey) return new Response("Not found", { status: 404 });
  const obj = await storage.get(v.documentKey);
  if (!obj) return new Response("Not found", { status: 404 });
  await track("ADMIN_ACTION", { providerId: v.providerId, props: { action: "document_viewed", verificationId: v.id } });
  return new Response(new Uint8Array(obj.data), {
    headers: { "content-type": obj.contentType, "cache-control": "private, no-store", "x-content-type-options": "nosniff", "x-robots-tag": "noindex" },
  });
}
