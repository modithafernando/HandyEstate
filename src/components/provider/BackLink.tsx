"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

/** Goes back within the site if we came from it; otherwise to a sensible page. */
export function BackLink({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  return (
    <a
      href={href}
      onClick={(e) => {
        if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) {
          e.preventDefault();
          router.back();
        }
      }}
      className="-ml-2 inline-flex h-11 items-center gap-1.5 rounded-md px-2 text-small font-semibold text-ink-2 hover:text-ink"
    >
      <ArrowLeft size={18} weight="bold" aria-hidden />
      {label}
    </a>
  );
}
