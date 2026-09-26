import "server-only";
import { cookies, headers } from "next/headers";

export const VISITOR_COOKIE = "he_vid";

export async function getVisitorId(): Promise<string | null> {
  return (await cookies()).get(VISITOR_COOKIE)?.value ?? null;
}

export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}

const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse|headless|curl|wget|python-requests/i;

export async function isBotRequest(): Promise<boolean> {
  const ua = (await headers()).get("user-agent") ?? "";
  return ua === "" || BOT_RE.test(ua);
}
