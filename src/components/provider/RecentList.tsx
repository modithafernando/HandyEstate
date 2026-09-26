"use client";

import Link from "next/link";
import { Phone } from "@phosphor-icons/react";
import { useMemo, useSyncExternalStore } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClass } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/client";
import { clearRecent, parseRecent, subscribeRecent, RECENT_KEY } from "@/lib/recent";
import { ContactButton } from "./ContactButton";

export function RecentList() {
  const { t } = useI18n();
  // Server render and first paint show nothing; the list lives only on this device.
  const raw = useSyncExternalStore(subscribeRecent, () => safeGet(), () => null);
  const items = useMemo(() => (raw === null ? null : parseRecent(raw)), [raw]);

  if (items === null) return null;
  if (!items.length) return <p className="mt-4 max-w-sm text-body text-ink-2">{t("recent.empty")}</p>;

  return (
    <>
      <ul className="mt-4 border-t border-line">
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-3.5 border-b border-line py-4">
            <Avatar src={it.photo} name={it.name} size={48} />
            <div className="min-w-0 flex-1">
              <Link href={`/p/${it.slug}?from=recent`} className="block truncate text-body font-bold hover:underline">
                {it.title}
              </Link>
              <p className="truncate text-small text-ink-2">{it.sub}</p>
            </div>
            <ContactButton providerId={it.id} kind="call" source="recent" className={buttonClass("secondary", "sm", "shrink-0")} aria-label={t("provider.callName", { name: it.name })}>
              <Phone size={18} weight="fill" className="text-brand" aria-hidden />
              {t("provider.call")}
            </ContactButton>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-4 py-2 text-small font-semibold text-ink-2 hover:text-ink"
        onClick={() => {
          clearRecent();
        }}
      >
        {t("recent.clear")}
      </button>
    </>
  );
}

function safeGet(): string {
  try {
    return localStorage.getItem(RECENT_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}
