import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Password hashing with scrypt (built into Node — no extra dependency).
 * Stored as "scrypt$<salt>$<hash>". Server-side only.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, 64).toString("base64url");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}
