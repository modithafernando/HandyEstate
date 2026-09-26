import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Category } from "@/server/queries/catalog";
import { localizedName } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/config";

/** Scrollable text tabs to switch service without going back. */
export function CategoryTabs({ categories, activeId, locale, label }: { categories: Category[]; activeId?: number | null; locale: Locale; label: string }) {
  return (
    <nav aria-label={label} className="-mx-5 border-b border-line sm:mx-0">
      <ul className="no-scrollbar flex gap-5 overflow-x-auto px-5 sm:px-0">
        {categories.map((c) => {
          const active = c.id === activeId;
          return (
            <li key={c.id} className="shrink-0">
              <Link
                href={`/search?cat=${c.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px flex h-11 items-center border-b-2 text-small whitespace-nowrap",
                  active ? "border-brand font-semibold text-ink" : "border-transparent text-ink-2 hover:text-ink",
                )}
              >
                {localizedName(c, locale)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
