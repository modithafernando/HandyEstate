import type { Metadata } from "next";
import { ProviderRow } from "@/components/provider/ProviderRow";
import { AreaPicker } from "@/components/search/AreaPicker";
import { CategoryTabs } from "@/components/search/CategoryTabs";
import { SearchBox } from "@/components/search/SearchBox";
import { ImpressionTracker } from "@/components/track/ImpressionTracker";
import { TrackOnMount } from "@/components/track/TrackOnMount";
import { getI18n } from "@/lib/i18n/server";
import { localizedName } from "@/lib/i18n/translate";
import { matchCategory } from "@/lib/search-match";
import { getCategories } from "@/server/queries/catalog";
import { WIDEN_KM, searchProviders } from "@/server/queries/search";
import { getArea, location } from "@/server/services/location";
import Link from "next/link";

type Props = { searchParams: Promise<{ q?: string; cat?: string; today?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, cat } = await searchParams;
  const [categories, area] = await Promise.all([getCategories(), getArea()]);
  const c = cat ? categories.find((x) => x.slug === cat) : q ? matchCategory(q, categories) : null;
  return { title: c ? `${c.name} in ${area.name}` : q ? `“${q}” in ${area.name}` : `Near ${area.name}`, robots: { index: !q } };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q: rawQ, cat, today } = await searchParams;
  const q = rawQ?.trim().slice(0, 100) || null;
  const [{ t, locale }, area, categories, towns] = await Promise.all([getI18n(), getArea(), getCategories(), location.listTowns()]);

  const category = cat ? categories.find((c) => c.slug === cat) ?? null : q ? matchCategory(q, categories) : null;
  // A query that maps to a category searches the category; anything else searches names and services.
  const text = q && !category ? q : null;
  const { providers, widened } = await searchProviders({ area, categoryId: category?.id, text, availableOnly: today === "1" });
  const availableCount = providers.filter((p) => p.available).length;

  const heading = category ? localizedName(category, locale) : q ? t("search.resultsFor", { q }) : t("provider.availableToday");
  const townOptions = towns.map(({ slug, name, district }) => ({ slug, name, district }));

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <TrackOnMount
        event={{
          type: "SEARCH_PERFORMED",
          query: q,
          categoryId: category?.id ?? null,
          townId: area.id,
          source: cat ? "category" : q ? "text" : "browse",
          props: { results: providers.length, available: availableCount, widened, today: today === "1" },
        }}
      />
      <div className="lg:grid lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-8">
          <SearchBox t={t} defaultValue={q ?? ""} size="md" className="mt-4 lg:mt-8" />

          <header className="mt-6">
            {q && category && <p className="text-small text-ink-2">{t("search.resultsFor", { q })}</p>}
            <h1 className="text-title font-extrabold">{heading}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-small text-ink-2">
              <AreaPicker current={{ slug: area.slug, name: area.name, district: area.district }} towns={townOptions} variant="inline" />
              {providers.length > 0 && (
                <>
                  <span aria-hidden className="text-line-strong">·</span>
                  <span>{providers.length === 1 ? t("search.countOne") : t("search.count", { n: providers.length })}</span>
                </>
              )}
              {availableCount > 0 && (
                <>
                  <span aria-hidden className="text-line-strong">·</span>
                  <span className="font-semibold text-live">{t("search.countAvailable", { n: availableCount })}</span>
                </>
              )}
            </p>
          </header>

          <div className="mt-4 lg:hidden">
            <CategoryTabs categories={categories} activeId={category?.id} locale={locale} label={t("search.otherServices")} />
          </div>

          {widened && (
            <p role="status" className="mt-4 border-l-2 border-accent bg-surface px-4 py-3 text-small text-ink">
              {t("search.widened", { area: area.name, km: WIDEN_KM })}
            </p>
          )}

          {providers.length ? (
            <ImpressionTracker source="search" categoryId={category?.id} townId={area.id}>
              <ul>
                {providers.map((p, i) => (
                  <ProviderRow key={p.id} p={p} t={t} position={i} source="search" />
                ))}
              </ul>
            </ImpressionTracker>
          ) : (
            <div className="py-12">
              <p className="text-lead font-bold">{t("search.noResults")}</p>
              <p className="mt-2 max-w-md text-body text-ink-2">{t("search.noResultsBody")}</p>
            </div>
          )}
        </div>

        <aside className="hidden lg:col-span-4 lg:block">
          <nav aria-label={t("search.otherServices")} className="sticky top-8 mt-8">
            <h2 className="border-b border-ink pb-3 text-small font-semibold text-ink-2">{t("search.otherServices")}</h2>
            <ul>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/search?cat=${c.slug}`}
                    aria-current={c.id === category?.id ? "page" : undefined}
                    className="flex h-11 items-center border-b border-line text-body hover:text-brand aria-[current=page]:font-semibold aria-[current=page]:text-brand"
                  >
                    {localizedName(c, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}
