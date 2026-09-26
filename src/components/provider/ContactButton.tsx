"use client";

import { useState } from "react";

type Kind = "call" | "whatsapp";

/**
 * Call / WhatsApp. The number isn't in the page: we ask the server (which records
 * the tap) and then hand off to the dialer. Without JS the link still works via /go.
 */
export function ContactButton({
  providerId,
  kind,
  source,
  className,
  children,
  "aria-label": ariaLabel,
}: {
  providerId: string;
  kind: Kind;
  source: string;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  const [busy, setBusy] = useState(false);
  const fallback = `/go/${kind}/${providerId}?s=${encodeURIComponent(source)}`;

  if (kind === "whatsapp") {
    return (
      <a href={fallback} target="_blank" rel="noopener" className={className} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  async function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ providerId, kind, source }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { href } = (await res.json()) as { href: string };
      window.location.href = href;
    } catch {
      // /go is a route handler that redirects to tel: — a full navigation is intended.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = fallback;
    } finally {
      setTimeout(() => setBusy(false), 1200);
    }
  }

  return (
    <a href={fallback} onClick={onClick} className={className} aria-label={ariaLabel} aria-busy={busy || undefined}>
      {children}
    </a>
  );
}
