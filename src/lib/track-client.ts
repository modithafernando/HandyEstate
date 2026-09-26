"use client";

/** Client-side analytics queue. Batches events and sends them with sendBeacon. */
export type ClientEvent = {
  type: "SEARCH_PERFORMED" | "PROVIDER_IMPRESSION" | "PROVIDER_PROFILE_OPENED";
  providerId?: string;
  categoryId?: number | null;
  townId?: number | null;
  query?: string | null;
  source?: string;
  props?: Record<string, unknown>;
};

const queue: ClientEvent[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;
let listening = false;

export function flush() {
  if (timer) clearTimeout(timer);
  timer = undefined;
  if (!queue.length) return;
  const body = JSON.stringify({ events: queue.splice(0, queue.length) });
  const sent = typeof navigator.sendBeacon === "function" && navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
  if (!sent) {
    fetch("/api/events", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
  }
}

export function trackClient(ev: ClientEvent) {
  queue.push(ev);
  if (!listening) {
    listening = true;
    addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
  }
  if (!timer) timer = setTimeout(flush, 1500);
}
