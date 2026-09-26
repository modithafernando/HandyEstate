"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClockCounterClockwise, MagnifyingGlass, Toolbox, type Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";

export function BottomNav({ isProvider }: { isProvider: boolean }) {
  const { t } = useI18n();
  const pathname = usePathname();
  // Provider profiles have their own sticky Call bar.
  if (pathname.startsWith("/p/")) return null;

  const items: { href: string; label: string; icon: Icon; match: (p: string) => boolean }[] = [
    { href: "/", label: t("nav.find"), icon: MagnifyingGlass, match: (p) => p === "/" || p.startsWith("/search") || p.startsWith("/services") },
    { href: "/recent", label: t("nav.recent"), icon: ClockCounterClockwise, match: (p) => p.startsWith("/recent") },
    isProvider
      ? { href: "/pro", label: t("nav.myWork"), icon: Toolbox, match: (p) => p.startsWith("/pro") }
      : { href: "/join", label: t("nav.forPros"), icon: Toolbox, match: (p) => p.startsWith("/join") },
  ];

  return (
    <>
      <div aria-hidden className="h-16 lg:hidden" />
      <nav aria-label={t("nav.main")} className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-sm pb-safe lg:hidden">
        <ul className="mx-auto grid h-16 max-w-md grid-cols-3">
          {items.map(({ href, label, icon: I, match }) => {
            const active = match(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex h-full flex-col items-center justify-center gap-0.5 text-caption", active ? "font-semibold text-brand" : "text-ink-2")}
                >
                  <I size={24} weight={active ? "bold" : "regular"} aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
