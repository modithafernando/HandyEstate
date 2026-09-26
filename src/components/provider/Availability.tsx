import { cn } from "@/lib/cn";
import type { Translate } from "@/lib/i18n/translate";

export function AvailableDot({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("relative inline-flex size-2.5", className)}>
      <span className="absolute inset-0 rounded-full bg-live/25 scale-[1.9]" />
      <span className="relative size-2.5 rounded-full bg-live" />
    </span>
  );
}

export function AvailableLabel({ t, className }: { t: Translate; className?: string }) {
  return (
    <p className={cn("inline-flex items-center gap-2 text-small font-semibold text-live", className)}>
      <AvailableDot />
      {t("provider.availableToday")}
    </p>
  );
}
