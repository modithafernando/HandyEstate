import type { MetadataRoute } from "next";
import { and, eq } from "drizzle-orm";
import { db, schema as s } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [cats, providers] = await Promise.all([
    db.select({ slug: s.serviceCategories.slug }).from(s.serviceCategories).where(eq(s.serviceCategories.isActive, true)),
    db.select({ slug: s.providers.slug }).from(s.providers).where(and(eq(s.providers.status, "approved"), eq(s.providers.isDemo, false))),
  ]);
  return [
    { url: base },
    { url: `${base}/join` },
    ...cats.map((c) => ({ url: `${base}/search?cat=${c.slug}` })),
    ...providers.map((p) => ({ url: `${base}/p/${p.slug}` })),
  ];
}
