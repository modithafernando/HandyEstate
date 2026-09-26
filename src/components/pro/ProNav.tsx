"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star, ToggleRight, UserCircle, type Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";

export function ProNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const items: { href: string; label: string; icon: Icon; active: boolean }[] = [
    { href: "/pro", label: t("nav.today"), icon: ToggleRight, active: pathname === "/pro" },
    { href: "/pro/profile", label: t("nav.profile"), icon: UserCircle, active: ["/pro/profile", "/pro/photos", "/pro/verify"].some((p) => pathname.startsWith(p)) },
    { href: "/pro/reviews", label: t("nav.reviews"), icon: Star, active: pathname.startsWith("/pro/reviews") },
  ];
  return (
    <>
      {/* Tablet/desktop: tabs under the header */}
      <nav aria-label={t("nav.main")} className="hidden border-b border-line sm:block">
        <ul className="mx-auto flex max-w-3xl gap-6 px-8">
          {items.map((i) => (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={i.active ? "page" : undefined}
                className={cn("-mb-px flex h-12 items-center border-b-2 text-small", i.active ? "border-brand font-semibold" : "border-transparent text-ink-2 hover:text-ink")}
              >
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {/* Phone: bottom bar */}
      <nav aria-label={t("nav.main")} className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-sm pb-safe sm:hidden">
        <ul className="grid h-16 grid-cols-3">
          {items.map(({ href, label, icon: I, active }) => (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex h-full flex-col items-center justify-center gap-0.5 text-caption", active ? "font-semibold text-brand" : "text-ink-2")}>
                <I size={24} weight={active ? "bold" : "regular"} aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
