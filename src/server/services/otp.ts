import "server-only";
import { and, count, desc, eq, gt, isNull } from "drizzle-orm";
import { db, schema as s } from "../db";
import { env } from "../env";
import { hmac, randomCode, safeEqual } from "./crypto";
import { getSmsProvider } from "./sms";

const CODE_TTL_MS = 5 * 60_000;
const MAX_ATTEMPTS = 5;
const PER_PHONE_WINDOW_MS = 15 * 60_000;
const PER_PHONE_MAX = 3;
const PER_IP_WINDOW_MS = 60 * 60_000;
// Relaxed outside production so local testing from one IP isn't blocked.
const PER_IP_MAX = process.env.NODE_ENV === "production" ? 10 : 200;

export type SendResult = { ok: true; devCode?: string } | { ok: false; error: "rate" };

export async function sendOtp(phone: string, ip: string | null): Promise<SendResult> {
  const since = (ms: number) => new Date(Date.now() - ms);
  const [byPhone] = await db
    .select({ n: count() })
    .from(s.otpChallenges)
    .where(and(eq(s.otpChallenges.phone, phone), gt(s.otpChallenges.createdAt, since(PER_PHONE_WINDOW_MS))));
  if (byPhone.n >= PER_PHONE_MAX) return { ok: false, error: "rate" };
  if (ip) {
    const [byIp] = await db
      .select({ n: count() })
      .from(s.otpChallenges)
      .where(and(eq(s.otpChallenges.ip, ip), gt(s.otpChallenges.createdAt, since(PER_IP_WINDOW_MS))));
    if (byIp.n >= PER_IP_MAX) return { ok: false, error: "rate" };
  }

  const code = randomCode();
  await db.insert(s.otpChallenges).values({
    phone,
    codeHash: hmac("otp", `${phone}:${code}`),
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
    ip,
  });
  await getSmsProvider().send(phone, `${code} is your HandyEstate code. It expires in 5 minutes.`);
  return env.showDevCodes ? { ok: true, devCode: code } : { ok: true };
}

export type VerifyResult = { ok: true } | { ok: false; error: "code" | "expired" };

export async function verifyOtp(phone: string, code: string): Promise<VerifyResult> {
  const [challenge] = await db
    .select()
    .from(s.otpChallenges)
    .where(and(eq(s.otpChallenges.phone, phone), isNull(s.otpChallenges.consumedAt)))
    .orderBy(desc(s.otpChallenges.createdAt))
    .limit(1);
  if (!challenge || challenge.expiresAt < new Date() || challenge.attempts >= MAX_ATTEMPTS) return { ok: false, error: "expired" };

  const matches = safeEqual(challenge.codeHash, hmac("otp", `${phone}:${code}`));
  if (!matches) {
    await db.update(s.otpChallenges).set({ attempts: challenge.attempts + 1 }).where(eq(s.otpChallenges.id, challenge.id));
    return { ok: false, error: "code" };
  }
  await db.update(s.otpChallenges).set({ consumedAt: new Date() }).where(eq(s.otpChallenges.id, challenge.id));
  return { ok: true };
}
