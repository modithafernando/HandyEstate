import "server-only";
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { env } from "../env";

export const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
export const hmac = (purpose: string, v: string) => createHmac("sha256", env.appSecret).update(`${purpose}:${v}`).digest("hex");
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");
export const randomCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
