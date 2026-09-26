"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema as s } from "@/server/db";
import { createSession, destroySession, safeNext } from "@/server/services/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { isLkMobile, normalizeLkPhone } from "@/lib/phone";

export type Role = "customer" | "handyman";
export type AuthState = { error?: "phone" | "password" | "wrong" | "rate" | "taken" | "name" } | null;

/**
 * Simple phone + password sign-in for the beta.
 * (The OTP services in src/server/services/otp.ts are ready for when SMS is connected.)
 */

// Slow down password guessing: 5 failures per phone per 15 minutes (per server instance).
const failures = new Map<string, number[]>();
const WINDOW_MS = 15 * 60_000;
const MAX_FAILURES = 5;

function tooManyFailures(phone: string) {
  const recent = (failures.get(phone) ?? []).filter((t) => Date.now() - t < WINDOW_MS);
  failures.set(phone, recent);
  return recent.length >= MAX_FAILURES;
}

/** Handymen land on their dashboard; customers on the search home. */
async function destination(userId: string, role: Role, next: string | null) {
  if (next) return safeNext(next);
  if (role === "handyman") {
    const [p] = await db.select({ id: s.providers.id }).from(s.providers).where(eq(s.providers.userId, userId)).limit(1);
    return p ? "/pro" : "/pro/setup/1";
  }
  return "/";
}

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const phone = normalizeLkPhone(String(form.get("phone") ?? ""));
  const password = String(form.get("password") ?? "");
  const role: Role = form.get("role") === "handyman" ? "handyman" : "customer";
  if (!phone) return { error: "phone" };
  if (!password) return { error: "password" };
  if (tooManyFailures(phone)) return { error: "rate" };

  const [user] = await db.select().from(s.users).where(eq(s.users.phone, phone)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    failures.get(phone)!.push(Date.now());
    return { error: "wrong" };
  }
  failures.delete(phone);
  await db.update(s.users).set({ lastSeenAt: new Date() }).where(eq(s.users.id, user.id));
  await createSession(user.id);
  redirect(await destination(user.id, role, (form.get("next") as string) || null));
}

const Register = z.object({
  name: z.string().trim().min(2).max(40),
  password: z.string().min(6).max(100),
});

export async function register(_prev: AuthState, form: FormData): Promise<AuthState> {
  const phone = normalizeLkPhone(String(form.get("phone") ?? ""));
  const role: Role = form.get("role") === "handyman" ? "handyman" : "customer";
  if (!phone || !isLkMobile(phone)) return { error: "phone" };
  const parsed = Register.safeParse({ name: form.get("name"), password: form.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].path[0] === "name" ? "name" : "password" };

  const [existing] = await db.select({ id: s.users.id }).from(s.users).where(eq(s.users.phone, phone)).limit(1);
  if (existing) return { error: "taken" };

  const [user] = await db
    .insert(s.users)
    .values({ phone, name: parsed.data.name, passwordHash: hashPassword(parsed.data.password), lastSeenAt: new Date() })
    .returning({ id: s.users.id });
  await createSession(user.id);
  redirect(await destination(user.id, role, (form.get("next") as string) || null));
}

export async function signOut() {
  await destroySession();
  redirect("/login");
}
