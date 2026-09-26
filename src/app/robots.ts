import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/pro", "/login", "/api", "/go", "/recent"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
