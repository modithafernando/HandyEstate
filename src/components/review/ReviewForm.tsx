"use client";

import { Check, Star } from "@phosphor-icons/react";
import { useActionState, useState } from "react";
import { submitReview, type ReviewState } from "@/app/actions/reviews";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/cn";

export function ReviewForm({ providerId, tags, needsName }: { providerId: string; tags: { id: number; name: string }[]; needsName: boolean }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || rating;

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="providerId" value={providerId} />

      <fieldset>
        <legend className="text-lead font-bold">{t("review.rating")}</legend>
        <div className="mt-3 flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
              <input type="radio" name="rating" value={n} className="peer sr-only" checked={rating === n} onChange={() => setRating(n)} />
              <span className="sr-only">{n === 1 ? t("review.star", { n }) : t("review.stars", { n })}</span>
              <span className="grid size-13 place-items-center rounded-md peer-focus-visible:outline-2 peer-focus-visible:outline-brand">
                <Star size={40} weight={n <= shown ? "fill" : "regular"} className={n <= shown ? "text-star" : "text-line-strong"} aria-hidden />
              </span>
            </label>
          ))}
        </div>
        {state?.error === "rating" && (
          <p role="alert" className="mt-2 text-caption font-medium text-danger">
            {t("review.pickRating")}
          </p>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-lead font-bold">{t("review.tags")}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <label key={tag.id} className="cursor-pointer">
              <input type="checkbox" name="tags" value={tag.id} className="peer sr-only" />
              <span
                className={cn(
                  "inline-flex h-11 items-center gap-1.5 rounded-md border border-line-strong bg-surface px-3.5 text-small font-medium",
                  "peer-checked:border-brand peer-checked:bg-brand-tint peer-checked:text-brand peer-focus-visible:outline-2 peer-focus-visible:outline-brand",
                  "[&>svg]:hidden peer-checked:[&>svg]:block",
                )}
              >
                <Check size={16} weight="bold" aria-hidden />
                {tag.name}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field label={t("review.comment")} htmlFor="comment" hint={t("review.commentHint")}>
        <textarea id="comment" name="comment" rows={3} maxLength={400} className={inputClass + " h-auto py-3"} />
      </Field>

      {needsName && (
        <Field label={t("auth.yourName")} htmlFor="name" hint={t("auth.nameHint")} error={state?.error === "name" ? t("auth.err.name") : null}>
          <input id="name" name="name" autoComplete="given-name" maxLength={60} className={inputClass} aria-invalid={state?.error === "name"} />
        </Field>
      )}

      {state?.error === "generic" && (
        <p role="alert" className="text-small font-medium text-danger">
          {t("form.error")}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
        {t("review.submit")}
      </Button>
    </form>
  );
}
