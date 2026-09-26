import { NextResponse, type NextRequest } from "next/server";

const VISITOR_COOKIE = "he_vid";
const AREA_COOKIE = "he_area";
const YEAR = 60 * 60 * 24 * 365;

/**
 * - Gives every browser an anonymous visitor id (for "returning users" and
 *   de-duplicating counts). No personal data.
 * - A shared link with ?area=galle sets the visitor's area so header and page agree.
 */
export function proxy(request: NextRequest) {
  const set: { name: string; value: string }[] = [];
  if (!request.cookies.get(VISITOR_COOKIE)) set.push({ name: VISITOR_COOKIE, value: crypto.randomUUID() });
  const area = request.nextUrl.searchParams.get("area");
  if (area && /^[a-z-]{2,40}$/.test(area) && request.cookies.get(AREA_COOKIE)?.value !== area) set.push({ name: AREA_COOKIE, value: area });

  if (!set.length) return NextResponse.next();
  for (const c of set) request.cookies.set(c.name, c.value);
  const res = NextResponse.next({ request: { headers: request.headers } });
  for (const c of set) {
    res.cookies.set(c.name, c.value, { path: "/", maxAge: YEAR, sameSite: "lax", httpOnly: c.name === VISITOR_COOKIE, secure: process.env.NODE_ENV === "production" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/|media/|favicon|icon|brand/|robots.txt|sitemap.xml).*)"],
};
