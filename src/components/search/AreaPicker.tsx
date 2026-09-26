"use client";

import { CaretDown, CrosshairSimple, MapPin, Check } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { setArea, setAreaFromPosition } from "@/app/actions/area";
import { Sheet, type SheetHandle } from "@/components/ui/Sheet";
import { useI18n } from "@/lib/i18n/client";
import { coarsen } from "@/lib/geo";
import { cn } from "@/lib/cn";

export type TownOption = { slug: string; name: string; district: string };

export function AreaPicker({
  current,
  towns,
  variant = "chip",
}: {
  current: TownOption;
  towns: TownOption[];
  variant?: "chip" | "inline";
}) {
  const { t } = useI18n();
  const sheet = useRef<SheetHandle>(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const grouped = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const list = towns.filter((x) => !f || x.name.toLowerCase().includes(f));
    const m = new Map<string, TownOption[]>();
    for (const x of list) m.set(x.district, [...(m.get(x.district) ?? []), x]);
    return [...m.entries()];
  }, [towns, filter]);

  function done() {
    sheet.current?.close();
    // An explicit ?area= in a shared link shouldn't override the new choice.
    if (params.has("area")) {
      const next = new URLSearchParams(params);
      next.delete("area");
      router.replace(`${pathname}${next.size ? `?${next}` : ""}`);
    }
    router.refresh();
  }

  function choose(slug: string) {
    start(async () => {
      const r = await setArea(slug);
      if (r.ok) done();
    });
  }

  function locate() {
    if (!("geolocation" in navigator)) return setStatus(t("area.locationDenied"));
    setStatus(t("area.locating"));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        start(async () => {
          const r = await setAreaFromPosition(coarsen({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
          if (r.ok) {
            setStatus(null);
            done();
          } else setStatus(t("area.locationDenied"));
        });
      },
      () => setStatus(t("area.locationDenied")),
      { enableHighAccuracy: false, maximumAge: 10 * 60_000, timeout: 10_000 },
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => sheet.current?.open()}
        aria-haspopup="dialog"
        aria-label={`${t("area.change")}: ${current.name}`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md font-semibold text-ink hover:bg-ink/5",
          variant === "chip" ? "h-11 px-2.5 -mr-2.5 text-small" : "h-9 px-1.5 -mx-1.5 text-small text-ink underline decoration-line-strong underline-offset-4",
        )}
      >
        {variant === "chip" && <MapPin size={18} weight="fill" className="text-accent" aria-hidden />}
        {current.name}
        <CaretDown size={14} weight="bold" className="text-ink-2" aria-hidden />
      </button>

      <Sheet ref={sheet} title={t("area.title")} closeLabel={t("area.close")}>
        <div className="px-5 pb-2 pt-4">
          <button
            type="button"
            onClick={locate}
            disabled={pending}
            className="flex h-12 w-full items-center gap-3 rounded-md border border-line-strong px-3.5 text-left font-semibold text-brand hover:bg-brand-tint"
          >
            <CrosshairSimple size={22} aria-hidden />
            {t("area.useLocation")}
          </button>
          <p aria-live="polite" className="min-h-6 pt-2 text-caption text-ink-2">
            {status}
          </p>
          <label htmlFor="town-filter" className="sr-only">
            {t("area.searchTowns")}
          </label>
          <input
            id="town-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t("area.searchTowns")}
            autoComplete="off"
            className="h-11 w-full rounded-md border border-line bg-paper px-3.5 text-body placeholder:text-ink-3 focus:border-brand focus:outline-none"
          />
        </div>
        {grouped.map(([district, list]) => (
          <section key={district} aria-label={t("area.district", { district })} className="pb-2">
            <h3 className="px-5 pb-1 pt-4 text-caption font-semibold text-ink-2">{t("area.district", { district })}</h3>
            <ul>
              {list.map((town) => {
                const active = town.slug === current.slug;
                return (
                  <li key={town.slug}>
                    <button
                      type="button"
                      onClick={() => choose(town.slug)}
                      disabled={pending}
                      aria-current={active || undefined}
                      className={cn(
                        "flex h-12 w-full items-center justify-between border-b border-line px-5 text-left hover:bg-paper",
                        active && "font-semibold text-brand",
                      )}
                    >
                      {town.name}
                      {active && <Check size={18} weight="bold" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <div className="h-6 pb-safe" />
      </Sheet>
    </>
  );
}
