import Link from "next/link";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { Category } from "@/server/queries/catalog";
import type { Translate } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/config";
import { localizedName } from "@/lib/i18n/translate";

const HOME_COUNT = 7;

/** Hairline grid: separation by 1px lines, not cards. */
export function CategoryGrid({ categories, t, locale }: { categories: Category[]; t: Translate; locale: Locale }) {
  const shown = categories.slice(0, HOME_COUNT);
  const cell =
    "group flex min-h-24 flex-col justify-between gap-3 bg-surface p-4 hover:bg-brand-tint/60 focus-visible:z-10 sm:min-h-28";
  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
      {shown.map((c) => (
        <li key={c.id} className="contents">
          <Link href={`/search?cat=${c.slug}`} className={cell}>
            <CategoryIcon icon={c.icon} size={30} className="text-brand" />
            <span className="text-body font-semibold leading-tight">{localizedName(c, locale)}</span>
          </Link>
        </li>
      ))}
      <li className="contents">
        <Link href="/services" className={cell}>
          <CategoryIcon icon="more" size={30} className="text-ink-2" />
          <span className="text-body font-semibold leading-tight text-ink-2">{t("home.more")}</span>
        </Link>
      </li>
    </ul>
  );
}
