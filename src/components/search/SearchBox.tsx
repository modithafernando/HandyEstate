import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/cn";
import type { Translate } from "@/lib/i18n/translate";

/** Plain GET form — works before JavaScript loads. */
export function SearchBox({ t, defaultValue, className, size = "lg" }: { t: Translate; defaultValue?: string; className?: string; size?: "md" | "lg" }) {
  return (
    <form action="/search" method="get" role="search" className={cn("relative", className)}>
      <label htmlFor="q" className="sr-only">
        {t("home.searchLabel")}
      </label>
      <MagnifyingGlass size={22} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-2" />
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={t("home.searchPlaceholder")}
        enterKeyHint="search"
        autoComplete="off"
        className={cn(
          "w-full rounded-md border border-line-strong bg-surface pl-11 pr-14 text-body text-ink placeholder:text-ink-3",
          "focus:border-brand focus:outline-2 focus:outline-offset-0 focus:outline-brand [&::-webkit-search-cancel-button]:hidden",
          size === "lg" ? "h-14" : "h-12",
        )}
      />
      <button
        type="submit"
        aria-label={t("home.search")}
        className={cn(
          "absolute right-1.5 top-1/2 grid -translate-y-1/2 place-items-center rounded-[4px] bg-brand text-white hover:bg-brand-strong",
          size === "lg" ? "size-11" : "size-9",
        )}
      >
        <ArrowRight size={20} weight="bold" aria-hidden />
      </button>
    </form>
  );
}
