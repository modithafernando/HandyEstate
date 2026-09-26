"use client";

import { X } from "@phosphor-icons/react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export type SheetHandle = { open: () => void; close: () => void };

/**
 * Bottom sheet on phones, centred dialog on larger screens.
 * Built on <dialog>: focus trapping, Escape and inert background come from the browser.
 * Portalled to <body> so it can be opened from inside text (e.g. a <p>).
 */
export const Sheet = forwardRef<SheetHandle, { title: string; closeLabel: string; children: React.ReactNode; className?: string }>(
  function Sheet({ title, closeLabel, children, className }, ref) {
    const dialog = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    useImperativeHandle(ref, () => ({
      open: () => dialog.current?.showModal(),
      close: () => dialog.current?.close(),
    }));
    if (!mounted) return null;
    return createPortal(
      <dialog
        ref={dialog}
        aria-labelledby="sheet-title"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className={cn(
          "fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none max-h-[88dvh] rounded-t-lg bg-surface p-0 text-ink shadow-sheet",
          "sm:inset-0 sm:m-auto sm:max-w-md sm:rounded-lg",
          "backdrop:bg-ink/45 open:flex open:flex-col",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 id="sheet-title" className="text-lead font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="-mr-2 grid size-11 place-items-center rounded-md text-ink-2 hover:bg-paper"
            aria-label={closeLabel}
          >
            <X size={22} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </dialog>,
      document.body,
    );
  },
);
