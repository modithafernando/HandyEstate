"use client";

import { useActionState } from "react";
import { submitReport } from "@/app/actions/reviews";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { useI18n } from "@/lib/i18n/client";

const REASONS = ["wrong_number", "not_real", "bad_behaviour", "other"] as const;

export function ReportForm({ providerId }: { providerId: string }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState(submitReport, null);
  if (state?.ok) return <p role="status" className="text-body">{t("report.thanks")}</p>;
  return (
    <form action={action} className="space-y-7">
      <input type="hidden" name="providerId" value={providerId} />
      <fieldset>
        <legend className="text-small font-semibold">{t("report.reason")}</legend>
        <div className="mt-2 border-t border-line">
          {REASONS.map((r, i) => (
            <label key={r} className="flex h-14 cursor-pointer items-center gap-3 border-b border-line">
              <input type="radio" name="reason" value={r} required defaultChecked={i === 0} className="size-5 accent-brand" />
              <span className="text-body">{t(`report.${r}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Field label={t("report.details")} htmlFor="details">
        <textarea id="details" name="details" rows={3} maxLength={1000} className={inputClass + " h-auto py-3"} />
      </Field>
      {state?.error && <p role="alert" className="text-small text-danger">{t("form.error")}</p>}
      <Button type="submit" disabled={pending}>
        {t("report.submit")}
      </Button>
    </form>
  );
}
