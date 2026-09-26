/** Sri Lanka is UTC+05:30 all year (no DST). */
const COLOMBO_OFFSET_MIN = 330;

/** The next midnight in Asia/Colombo, as a UTC Date. "Taking work today" expires then. */
export function endOfTodayColombo(now: Date = new Date()): Date {
  const local = new Date(now.getTime() + COLOMBO_OFFSET_MIN * 60_000);
  const nextLocalMidnight = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + 1);
  return new Date(nextLocalMidnight - COLOMBO_OFFSET_MIN * 60_000);
}

export function isAvailable(availableUntil: Date | string | null | undefined, now: Date = new Date()): boolean {
  if (!availableUntil) return false;
  return new Date(availableUntil).getTime() > now.getTime();
}
