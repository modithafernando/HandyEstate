"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

/** For people on a laptop: shows the number instead of opening a dialer. */
export function RevealNumber({ providerId, source }: { providerId: string; source: string }) {
  const { t } = useI18n();
  const [phone, setPhone] = useState<{ display: string; href: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (phone) {
    return (
      <a href={phone.href} className="text-lead font-bold text-ink underline decoration-line-strong underline-offset-4">
        {phone.display}
      </a>
    );
  }
  return (
    <button
      type="button"
      disabled={busy}
      className="text-small font-semibold text-brand underline underline-offset-4 decoration-brand/30 hover:decoration-brand py-2"
      onClick={async () => {
        setBusy(true);
        try {
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ providerId, kind: "reveal", source }),
          });
          if (res.ok) setPhone(await res.json());
        } finally {
          setBusy(false);
        }
      }}
    >
      {t("provider.showNumber")}
    </button>
  );
}
