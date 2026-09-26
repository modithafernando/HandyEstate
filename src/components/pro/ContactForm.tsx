"use client";

import { useActionState } from "react";
import { saveContact, type FormState } from "@/app/actions/pro";
import { Field, inputClass } from "@/components/ui/Field";
import { useI18n } from "@/lib/i18n/client";
import { formatLkPhone } from "@/lib/phone";
import { SubmitRow } from "./SubmitRow";
import { useFormError } from "./useFormError";

export function ContactForm({ phone, whatsapp }: { phone: string; whatsapp: string | null }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<FormState, FormData>(saveContact, null);
  const error = useFormError(state?.error);
  return (
    <form action={action} className="space-y-6">
      <div>
        <p className="text-small font-semibold">{t("proEdit.phone")}</p>
        <p className="mt-1 text-lead font-semibold">{formatLkPhone(phone)}</p>
      </div>
      <Field label={t("proEdit.whatsapp")} htmlFor="whatsapp" hint={t("proEdit.whatsappHint")} error={error}>
        <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" defaultValue={whatsapp ? formatLkPhone(whatsapp) : ""} className={inputClass} aria-invalid={!!error} />
      </Field>
      <SubmitRow pending={pending} editing saved={state?.ok} />
    </form>
  );
}
