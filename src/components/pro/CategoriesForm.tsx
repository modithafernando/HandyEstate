"use client";

import { Check } from "@phosphor-icons/react";
import { useActionState, useState } from "react";
import { saveCategories, type FormState } from "@/app/actions/pro";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";
import { SubmitRow } from "./SubmitRow";
import { useFormError } from "./useFormError";

const MAX = 3;

export function CategoriesForm({ categories, selected, next }: { categories: { id: number; name: string; icon: string }[]; selected: number[]; next?: string }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<FormState, FormData>(saveCategories, null);
  const [chosen, setChosen] = useState<number[]>(selected);
  const error = useFormError(state?.error);
  return (
    <form action={action}>
      {next && <input type="hidden" name="next" value={next} />}
      <fieldset>
        <legend className="sr-only">{t("setup.cats.title")}</legend>
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
          {categories.map((c) => {
            const on = chosen.includes(c.id);
            const disabled = !on && chosen.length >= MAX;
            return (
              <li key={c.id} className="contents">
                <label className={cn("relative flex min-h-20 cursor-pointer items-center gap-3 bg-surface p-4", on && "bg-brand-tint", disabled && "cursor-not-allowed opacity-45")}>
                  <input
                    type="checkbox"
                    name="categories"
                    value={c.id}
                    checked={on}
                    disabled={disabled}
                    onChange={() => setChosen((x) => (on ? x.filter((i) => i !== c.id) : [...x, c.id]))}
                    className="peer sr-only"
                  />
                  <CategoryIcon icon={c.icon} size={26} className="shrink-0 text-brand" />
                  <span className={cn("text-body leading-tight", on && "font-semibold")}>{c.name}</span>
                  {on && <Check size={18} weight="bold" className="absolute right-3 top-3 text-brand" aria-hidden />}
                  <span className="pointer-events-none absolute inset-0 peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-brand" />
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
      {error && (
        <p role="alert" className="mt-3 text-caption font-medium text-danger">
          {error}
        </p>
      )}
      <SubmitRow pending={pending} editing={!!next} />
    </form>
  );
}
