import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { AreaPicker, type TownOption } from "@/components/search/AreaPicker";
import type { Translate } from "@/lib/i18n/translate";

export function AppHeader({
  t,
  area,
  towns,
  isProvider,
  showArea = true,
}: {
  t: Translate;
  area: TownOption;
  towns: TownOption[];
  isProvider: boolean;
  showArea?: boolean;
}) {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8 lg:h-16">
        <Link href="/" aria-label={t("brand.name")} className="-ml-1 rounded-sm px-1 py-2">
          <Wordmark className="text-[1.375rem] lg:text-[1.5rem]" />
        </Link>
        <nav aria-label={t("nav.main")} className="mr-auto hidden lg:block">
          <ul className="flex gap-1 text-small font-semibold text-ink-2">
            <li><Link className="rounded-md px-3 py-2 hover:bg-ink/5 hover:text-ink" href="/">{t("nav.find")}</Link></li>
            <li><Link className="rounded-md px-3 py-2 hover:bg-ink/5 hover:text-ink" href="/recent">{t("nav.recent")}</Link></li>
            <li>
              <Link className="rounded-md px-3 py-2 hover:bg-ink/5 hover:text-ink" href={isProvider ? "/pro" : "/join"}>
                {isProvider ? t("nav.myWork") : t("footer.forPros")}
              </Link>
            </li>
          </ul>
        </nav>
        {showArea && <AreaPicker current={area} towns={towns} />}
      </div>
    </header>
  );
}
