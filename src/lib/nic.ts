/**
 * Sri Lankan NIC formats:
 *  - old: 9 digits + V or X (e.g. 853400937V)
 *  - new: 12 digits (e.g. 198534000937)
 */
export function normalizeNic(raw: string): string | null {
  const v = raw.replace(/\s+/g, "").toUpperCase();
  if (/^\d{9}[VX]$/.test(v)) return v;
  if (/^\d{12}$/.test(v)) return v;
  return null;
}

export function nicLast4(nic: string): string {
  return nic.slice(-4);
}
