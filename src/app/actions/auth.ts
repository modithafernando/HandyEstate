"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema as s } from "@/server/db";
import { createSession, destroySession, safeNext } from "@/server/services/auth";
import { sendOtp, verifyOtp } from "@/server/services/otp";
import { getClientIp } from "@/server/services/request";
import { isLkMobile, normalizeLkPhone } from "@/lib/phone";

export type RequestCodeState = { ok: true; phone: string; devCode?: string } | { ok: false; error: "phone" | "rate" };

export async function requestCode(rawPhone: string): Promise<RequestCodeState> {
  const phone = normalizeLkPhone(rawPhone);
  if (!phone || !isLkMobile(phone)) return { ok: false, error: "phone" };
  const r = await sendOtp(phone, await getClientIp());
  if (!r.ok) return { ok: false, error: r.error };
  return { ok: true, phone, devCode: r.devCode };
}

export async function verifyCode(phone: string, code: string, next: string): Promise<{ error: "code" | "expired" | "phone" }> {
  if (!/^\+947\d{8}$/.test(phone)) return { error: "phone" };
  const r = await verifyOtp(phone, code.replace(/\D/g, ""));
  if (!r.ok) return { error: r.error };

  let [user] = await db.select().from(s.users).where(eq(s.users.phone, phone)).limit(1);
  if (!user) [user] = await db.insert(s.users).values({ phone }).returning();
  await db.update(s.users).set({ lastSeenAt: new Date() }).where(eq(s.users.id, user.id));
  await createSession(user.id);
  redirect(safeNext(next));
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
