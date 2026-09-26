"use client";

import { useOptimistic, useTransition } from "react";
import { setAvailability } from "@/app/actions/pro";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";

/** The one control that matters. The whole row is the switch. */
export function AvailabilitySwitch({ on, disabled }: { on: boolean; disabled?: boolean }) {
  const { t } = useI18n();
  const [optimistic, setOptimistic] = useOptimistic(on);
  const [pending, start] = useTransition();

  return (
    <div className={cn("rounded-lg border-2 transition-colors", optimistic ? "border-live bg-live-tint" : "border-line-strong bg-surface")}>
      <button
        type="button"
        role="switch"
        aria-checked={optimistic}
        aria-describedby="availability-desc"
        disabled={disabled}
        onClick={() =>
          start(async () => {
            setOptimistic(!optimistic);
            await setAvailability(!optimistic);
          })
        }
        className="flex w-full items-center justify-between gap-4 rounded-lg px-5 py-5 text-left disabled:opacity-50"
      >
        <span className="text-lead font-bold">{t("pro.takingWork")}</span>
        <span className={cn("relative inline-flex h-10 w-[4.5rem] shrink-0 items-center rounded-full transition-colors", optimistic ? "bg-live" : "bg-line-strong")}>
          <span className={cn("absolute left-1 size-8 rounded-full bg-white shadow-sm transition-transform", optimistic && "translate-x-8")} />
          <span className={cn("absolute text-caption font-bold text-white", optimistic ? "left-2.5" : "right-2.5 text-ink-2")} aria-hidden>
            {optimistic ? "ON" : "OFF"}
          </span>
        </span>
      </button>
      <p id="availability-desc" aria-live="polite" className={cn("px-5 pb-5 -mt-1 text-small", optimistic ? "text-ink" : "text-ink-2", pending && "opacity-70")}>
        {optimistic ? t("pro.takingWorkOn") : t("pro.takingWorkOff")}
      </p>
    </div>
  );
}
