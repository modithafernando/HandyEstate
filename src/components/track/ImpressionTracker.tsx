"use client";

import { useEffect, useRef } from "react";
import { trackClient } from "@/lib/track-client";

/**
 * Records PROVIDER_IMPRESSION once per provider when at least half of its row
 * has been on screen. Rows mark themselves with data-provider-id.
 */
export function ImpressionTracker({
  source,
  categoryId,
  townId,
  children,
}: {
  source: string;
  categoryId?: number | null;
  townId?: number | null;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          const id = el.dataset.providerId;
          if (!e.isIntersecting || !id || seen.has(id)) continue;
          seen.add(id);
          io.unobserve(el);
          trackClient({ type: "PROVIDER_IMPRESSION", providerId: id, categoryId, townId, source, props: { position: Number(el.dataset.position) } });
        }
      },
      { threshold: 0.5 },
    );
    root.querySelectorAll<HTMLElement>("[data-provider-id]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [source, categoryId, townId]);
  return <div ref={ref}>{children}</div>;
}
