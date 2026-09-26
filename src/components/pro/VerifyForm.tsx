"use client";

import { IdentificationCard, LockSimple } from "@phosphor-icons/react";
import { useActionState, useState } from "react";
import { submitNic, type FormState } from "@/app/actions/pro";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { useI18n } from "@/lib/i18n/client";
import { shrinkFormImages } from "@/lib/shrink-image";
import { useFormError } from "./useFormError";

export function VerifyForm() {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<FormState, FormData>(submitNic, null);
  const [fileName, setFileName] = useState<string | null>(null);
  const error = useFormError(state?.error);
  if (state?.ok) return <p role="status" className="border-l-2 border-live bg-live-tint px-4 py-3 text-body">{t("verify.pending")}</p>;
  return (
    <form action={async (fd) => action(await shrinkFormImages(fd, "document", 2400))} className="space-y-6">
      <Field label={t("verify.nic")} htmlFor="nic" hint={t("verify.nicHint")} error={state?.error === "nic" || state?.error === "duplicate" ? error : null}>
        <input id="nic" name="nic" required autoComplete="off" autoCapitalize="characters" maxLength={14} className={inputClass + " uppercase tracking-wider"} />
      </Field>
      <div className="space-y-1.5">
        <p className="text-small font-semibold">{t("verify.photo")}</p>
        <label className="flex min-h-24 cursor-pointer items-center gap-4 rounded-md border border-dashed border-line-strong bg-surface px-4 py-4 hover:border-ink-3 focus-within:outline-2 focus-within:outline-brand">
          <IdentificationCard size={36} className="shrink-0 text-brand" aria-hidden />
          <span className="text-body font-semibold">{fileName ?? t("setup.photo.choose")}</span>
          <input type="file" name="document" accept="image/*" required className="sr-only" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
        </label>
        {error && state?.error !== "nic" && state?.error !== "duplicate" && (
          <p role="alert" className="text-caption font-medium text-danger">
            {error}
          </p>
        )}
      </div>
      <p className="flex gap-2.5 text-small text-ink-2">
        <LockSimple size={18} className="mt-0.5 shrink-0" aria-hidden />
        {t("verify.privacy")}
      </p>
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
        {t("verify.submit")}
      </Button>
    </form>
  );
}
