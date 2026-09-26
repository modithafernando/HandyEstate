import Link from "next/link";
import { Phone } from "@phosphor-icons/react/dist/ssr";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClass } from "@/components/ui/Button";
import { formatKm } from "@/lib/i18n/format";
import type { Translate } from "@/lib/i18n/translate";
import type { ProviderSummary } from "@/server/queries/search";
import { mediaUrl } from "@/lib/media";
import { AvailableLabel } from "./Availability";
import { ContactButton } from "./ContactButton";
import { TrustLine } from "./TrustLine";

export function providerTitle(p: { businessName: string | null; displayName: string }) {
  return p.businessName || p.displayName;
}

export function ProviderRow({
  p,
  t,
  position,
  source,
  compact = false,
}: {
  p: ProviderSummary;
  t: Translate;
  position: number;
  source: string;
  compact?: boolean;
}) {
  const href = `/p/${p.slug}?from=${source}`;
  const title = providerTitle(p);
  return (
    <li data-provider-id={p.id} data-position={position} className="border-b border-line py-5 first:pt-4">
      <div className={compact ? "flex items-center gap-4" : "flex flex-col gap-4 md:flex-row md:items-center md:gap-6"}>
        <div className="flex min-w-0 flex-1 gap-3.5">
          <Link href={href} tabIndex={-1} aria-hidden className="shrink-0">
            <Avatar src={mediaUrl(p.photoKey)} name={p.displayName} size={compact ? 48 : 60} />
          </Link>
          <div className="min-w-0 flex-1">
            <h3 className="text-lead font-bold leading-tight tracking-[-0.015em]">
              <Link href={href} className="hover:underline decoration-line-strong underline-offset-4">
                {title}
              </Link>
            </h3>
            <TrustLine verified={p.isVerified} ratingSum={p.ratingSum} reviewCount={p.reviewCount} t={t} className="mt-1" />
            <p className="text-small text-ink-2">
              {p.townName}
              <span className="text-line-strong"> · </span>
              {t("provider.kmAway", { km: formatKm(p.distanceKm) })}
            </p>
            {!compact && p.services.length > 0 && <p className="mt-1 truncate text-small text-ink">{p.services.join(" · ")}</p>}
            {p.available && <AvailableLabel t={t} className="mt-2" />}
          </div>
        </div>
        {compact ? (
          <ContactButton providerId={p.id} kind="call" source={source} className={buttonClass("secondary", "sm", "shrink-0")} aria-label={t("provider.callName", { name: p.displayName })}>
            <Phone size={18} weight="fill" className="text-brand" aria-hidden />
            {t("provider.call")}
          </ContactButton>
        ) : (
          <div className="grid grid-cols-[1fr_1.35fr] gap-2.5 md:w-72 md:shrink-0">
            <Link href={href} className={buttonClass("secondary", "md", "px-3")}>
              {t("provider.viewProfile")}
            </Link>
            <ContactButton providerId={p.id} kind="call" source={source} className={buttonClass("primary", "md", "px-3")} aria-label={t("provider.callName", { name: p.displayName })}>
              <Phone size={20} weight="fill" aria-hidden />
              {t("provider.call")}
            </ContactButton>
          </div>
        )}
      </div>
    </li>
  );
}
