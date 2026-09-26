import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ProviderRow } from "@/components/provider/ProviderRow";
import { CategoryGrid } from "@/components/search/CategoryGrid";
import { SearchBox } from "@/components/search/SearchBox";
import { ImpressionTracker } from "@/components/track/ImpressionTracker";
import { buttonClass } from "@/components/ui/Button";
import { getI18n } from "@/lib/i18n/server";
import { getCategories } from "@/server/queries/catalog";
import { searchProviders } from "@/server/queries/search";
import { getArea } from "@/server/services/location";

export default async function HomePage() {
  const [{ t, locale }, area, categories] = await Promise.all([getI18n(), getArea(), getCategories()]);
  const { providers } = await searchProviders({ area, availableOnly: true, limit: 4 });

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <section className="pb-10 pt-8 lg:grid lg:grid-cols-12 lg:gap-14 lg:pb-16 lg:pt-16">
        <div className="lg:col-span-5 lg:pt-2">
          <h1 className="text-display font-extrabold lg:text-display-lg">{t("home.title")}</h1>
          <SearchBox t={t} className="mt-6 lg:mt-8" />
        </div>
        <div className="mt-6 lg:col-span-7 lg:mt-0">
          <CategoryGrid categories={categories} t={t} locale={locale} />
        </div>
      </section>

      <section aria-labelledby="available-today" className="lg:grid lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3 lg:border-none">
            <h2 id="available-today" className="text-lead font-bold">
              {t("home.availableNear", { area: area.name })}
            </h2>
            <Link href="/search?today=1" className="shrink-0 text-small font-semibold text-brand hover:underline lg:hidden">
              {t("home.seeAll")}
            </Link>
          </div>
          <p className="mt-2 hidden text-body text-ink-2 lg:block">{t("brand.tagline")}</p>
          <Link href="/search?today=1" className="mt-4 hidden items-center gap-1.5 font-semibold text-brand hover:underline lg:inline-flex">
            {t("home.seeAll")} <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
        </div>
        <div className="lg:col-span-7">
          {providers.length ? (
            <ImpressionTracker source="home" townId={area.id}>
              <ul className="lg:border-t lg:border-ink">
                {providers.map((p, i) => (
                  <ProviderRow key={p.id} p={p} t={t} position={i} source="home" compact />
                ))}
              </ul>
            </ImpressionTracker>
          ) : (
            <p className="py-6 text-body text-ink-2">{t("home.noneAvailable")}</p>
          )}
        </div>
      </section>

      <section aria-labelledby="for-pros" className="mt-14 border-t border-line pt-8 sm:flex sm:items-end sm:justify-between sm:gap-8">
        <div className="max-w-md">
          <h2 id="for-pros" className="text-lead font-bold">
            {t("home.proTitle")}
          </h2>
          <p className="mt-1.5 text-body text-ink-2">{t("home.proBody")}</p>
        </div>
        <Link href="/join" className={buttonClass("secondary", "md", "mt-5 w-full sm:mt-0 sm:w-auto")}>
          {t("home.proCta")}
        </Link>
      </section>
    </div>
  );
}
