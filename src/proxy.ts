import { NextResponse, type NextRequest } from "next/server";

const VISITOR_COOKIE = "he_vid";
const SESSION_COOKIE = "he_session";
/** Reachable without signing in. Everything else starts at the login page. */
const PUBLIC_PATHS = [/^\/login$/, /^\/api\//, /^\/go\//];
const AREA_COOKIE = "he_area";
const YEAR = 60 * 60 * 24 * 365;

/**
 * - Gives every browser an anonymous visitor id (for "returning users" and
 *   de-duplicating counts). No personal data.
 * - A shared link with ?area=galle sets the visitor's area so header and page agree.
 * - No session cookie → the login page (the session itself is validated by the pages).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!request.cookies.get(SESSION_COOKIE) && !PUBLIC_PATHS.some((re) => re.test(pathname))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    if (pathname.startsWith("/pro")) url.searchParams.set("as", "handyman");
    return NextResponse.redirect(url);
  }

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
