/**
 * Sri Lankan phone helpers. Accepts 0771234567, 077 123 4567, +94771234567, 94771234567, 771234567.
 * Returns E.164 (+94XXXXXXXXX) or null.
 */
export function normalizeLkPhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "").replace(/^\+/, "");
  let national: string;
  if (digits.startsWith("94") && digits.length === 11) national = digits.slice(2);
  else if (digits.startsWith("0") && digits.length === 10) national = digits.slice(1);
  else if (digits.length === 9) national = digits;
  else return null;
  // National significant numbers are 9 digits and never start with 0.
  if (!/^[1-9]\d{8}$/.test(national)) return null;
  return `+94${national}`;
}

export function isLkMobile(e164: string): boolean {
  return /^\+947\d{8}$/.test(e164);
}

/** +94771234567 → 077 123 4567 */
export function formatLkPhone(e164: string): string {
  const n = e164.replace(/^\+94/, "0");
  if (n.length !== 10) return e164;
  return `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

/** wa.me wants digits only, with country code. */
export function whatsappDigits(e164: string): string {
  return e164.replace(/\D/g, "");
}
