import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, schema as s } from "../db";
import { env } from "../env";
import { randomToken, sha256 } from "./crypto";

export const SESSION_COOKIE = "he_session";
const SESSION_DAYS = 60;

export type CurrentUser = {
  id: string;
  phone: string;
  name: string | null;
  isAdmin: boolean;
  providerId: string | null;
};

export async function createSession(userId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  const ua = (await headers()).get("user-agent")?.slice(0, 300) ?? null;
  await db.insert(s.sessions).values({ id: sha256(token), userId, expiresAt, userAgent: ua });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(s.sessions).where(eq(s.sessions.id, sha256(token)));
  jar.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      id: s.users.id,
      phone: s.users.phone,
      name: s.users.name,
      isAdmin: s.users.isAdmin,
      providerId: s.providers.id,
    })
    .from(s.sessions)
    .innerJoin(s.users, eq(s.users.id, s.sessions.userId))
    .leftJoin(s.providers, eq(s.providers.userId, s.users.id))
    .where(and(eq(s.sessions.id, sha256(token)), gt(s.sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
});

/** Only allow same-site relative paths as post-login destinations. */
export function safeNext(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

export async function requireUser(next = "/"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser("/admin");
  if (!user.isAdmin) redirect("/");
  return user;
}

export async function requireProvider(): Promise<CurrentUser & { providerId: string }> {
  const user = await requireUser("/pro");
  if (!user.providerId) redirect("/join");
  return user as CurrentUser & { providerId: string };
}
