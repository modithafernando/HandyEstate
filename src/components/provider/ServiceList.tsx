import type { Translate } from "@/lib/i18n/translate";
import type { MessageKey } from "@/lib/i18n/en";
import { formatNumber } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/config";

type Service = { id: number; name: string; priceFrom: number | null; priceUnit: string };

export function ServiceList({ services, t, locale }: { services: Service[]; t: Translate; locale: Locale }) {
  return (
    <ul className="border-t border-line">
      {services.map((s) => (
        <li key={s.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3.5">
          <span className="text-body">{s.name}</span>
          {s.priceFrom != null ? (
            <span className="shrink-0 text-right">
              <span className="block text-body font-semibold">{t("provider.priceFrom", { price: formatNumber(s.priceFrom, locale) })}</span>
              {s.priceUnit !== "job" && <span className="block text-caption text-ink-2">{t(`provider.unit.${s.priceUnit}` as MessageKey)}</span>}
            </span>
          ) : (
            <span className="shrink-0 text-small text-ink-3">{t("provider.priceAsk")}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
