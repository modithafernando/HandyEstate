"use client";

import { useActionState } from "react";
import { saveName, type FormState } from "@/app/actions/pro";
import { Field, inputClass } from "@/components/ui/Field";
import { useI18n } from "@/lib/i18n/client";
import { SubmitRow } from "./SubmitRow";
import { useFormError } from "./useFormError";

export function NameForm({ displayName, businessName, next }: { displayName?: string; businessName?: string | null; next?: string }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<FormState, FormData>(saveName, null);
  const error = useFormError(state?.error);
  return (
    <form action={action} className="space-y-6">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label={t("setup.name.name")} htmlFor="displayName" error={error}>
        <input id="displayName" name="displayName" required minLength={2} maxLength={40} defaultValue={displayName} autoComplete="given-name" className={inputClass} aria-invalid={!!error} />
      </Field>
      <Field label={t("setup.name.business")} htmlFor="businessName" hint={t("setup.name.businessHint")}>
        <input id="businessName" name="businessName" maxLength={60} defaultValue={businessName ?? ""} autoComplete="organization" className={inputClass} />
      </Field>
      <SubmitRow pending={pending} editing={!!next} />
    </form>
  );
}
