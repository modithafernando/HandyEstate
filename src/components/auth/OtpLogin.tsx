"use client";

import { useState, useTransition } from "react";
import { requestCode, verifyCode } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { useI18n } from "@/lib/i18n/client";
import { formatLkPhone } from "@/lib/phone";

export function OtpLogin({ next, intro, title }: { next: string; intro?: string; title?: string }) {
  const { t } = useI18n();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [rawPhone, setRawPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function send(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    start(async () => {
      const r = await requestCode(rawPhone);
      if (!r.ok) return setError(r.error === "rate" ? t("auth.err.rate") : t("auth.err.phone"));
      setPhone(r.phone);
      setDevCode(r.devCode);
      setCode("");
      setStep("code");
    });
  }

  function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await verifyCode(phone, code, next);
      // On success the action redirects; we only get here on failure.
      if (r?.error) setError(r.error === "expired" ? t("auth.err.expired") : t("auth.err.code"));
    });
  }

  if (step === "phone") {
    return (
      <form onSubmit={send} noValidate>
        <h1 className="text-title font-extrabold">{title ?? t("auth.title")}</h1>
        {intro && <p className="mt-2 text-body text-ink-2">{intro}</p>}
        <Field label={t("auth.phone")} htmlFor="phone" hint={t("auth.phoneHint")} error={error} className="mt-6">
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="077 123 4567"
            value={rawPhone}
            onChange={(e) => setRawPhone(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "phone-error" : "phone-hint"}
            className={inputClass + " text-lead tracking-wide"}
            autoFocus
          />
        </Field>
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending || rawPhone.replace(/\D/g, "").length < 9}>
          {t("auth.sendCode")}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} noValidate>
      <h1 className="text-title font-extrabold">{t("auth.codeTitle")}</h1>
      <p className="mt-2 text-body text-ink-2">{t("auth.codeSent", { phone: formatLkPhone(phone) })}</p>
      {devCode && (
        <p className="mt-3 border-l-2 border-accent bg-surface px-3 py-2 text-small">
          {t("auth.devCode", { code: devCode })}
        </p>
      )}
      <Field label={t("auth.code")} htmlFor="code" error={error} className="mt-6">
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          aria-invalid={!!error}
          aria-describedby={error ? "code-error" : undefined}
          className={inputClass + " text-center text-title font-bold tracking-[0.4em]"}
          autoFocus
        />
      </Field>
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending || code.length !== 6}>
        {t("auth.verify")}
      </Button>
      <div className="mt-4 flex justify-between text-small">
        <button type="button" className="py-2 font-semibold text-brand" onClick={() => setStep("phone")}>
          {t("auth.changeNumber")}
        </button>
        <button type="button" className="py-2 font-semibold text-brand" onClick={() => send()} disabled={pending}>
          {t("auth.resend")}
        </button>
      </div>
    </form>
  );
}
