/** "Recently viewed" lives only on this device — no account needed. */
export type RecentItem = { id: string; slug: string; title: string; name: string; sub: string; photo: string | null; hasWhatsapp: boolean };

export const RECENT_KEY = "he_recent";
const MAX = 20;
const EVENT = "he-recent-change";

export function parseRecent(raw: string): RecentItem[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function read(): RecentItem[] {
  try {
    return parseRecent(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(items: RecentItem[] | null) {
  try {
    if (items) localStorage.setItem(RECENT_KEY, JSON.stringify(items));
    else localStorage.removeItem(RECENT_KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage unavailable (private mode) — fine */
  }
}

export function rememberRecent(item: RecentItem) {
  write([item, ...read().filter((x) => x.id !== item.id)].slice(0, MAX));
}

export function clearRecent() {
  write(null);
}

export function subscribeRecent(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
