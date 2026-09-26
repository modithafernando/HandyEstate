"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { register, signIn, type AuthState, type Role } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";
import { useI18n } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/en";

export function LoginForm({ role, mode, next }: { role: Role; mode: "signin" | "register"; next?: string }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "register" ? register : signIn, null);
  const [show, setShow] = useState(false);
  // Controlled so a wrong password doesn't wipe what was typed (forms reset after an action).
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const err = (code: NonNullable<AuthState>["error"]) => (state?.error === code ? t(`login.err.${code}` as MessageKey) : null);
  const switchHref = `/login?${new URLSearchParams({
    ...(role === "handyman" ? { as: "handyman" } : {}),
    ...(mode === "signin" ? { mode: "register" } : {}),
    ...(next ? { next } : {}),
  })}`;
  const phoneError = err("phone") ?? err("taken");
  const passwordError = err("password") ?? err("wrong") ?? err("rate");

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="role" value={role} />
      {next && <input type="hidden" name="next" value={next} />}

      {mode === "register" && (
        <Field label={t("login.name")} htmlFor="name" error={err("name")}>
          <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" maxLength={40} className={inputClass} aria-invalid={!!err("name")} />
        </Field>
      )}

      <Field label={t("login.phone")} htmlFor="phone" error={phoneError}>
        <input
          id="phone"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="077 123 4567"
          required
          className={inputClass + " text-lead"}
          aria-invalid={!!phoneError}
          aria-describedby={phoneError ? "phone-error" : undefined}
        />
      </Field>

      <Field label={t("login.password")} htmlFor="password" hint={mode === "register" ? t("login.passwordHint") : undefined} error={passwordError}>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            required
            minLength={mode === "register" ? 6 : undefined}
            className={inputClass + " pr-20"}
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "password-error" : mode === "register" ? "password-hint" : undefined}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-[4px] px-3 text-small font-semibold text-brand hover:bg-brand-tint"
            aria-pressed={show}
          >
            {show ? t("login.hide") : t("login.show")}
          </button>
        </div>
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {mode === "register" ? t("login.create") : t("login.signIn")}
      </Button>

      <p className="text-center text-small text-ink-2">
        {mode === "register" ? t("login.haveAccount") : t("login.noAccount")}{" "}
        <Link href={switchHref} replace className="font-semibold text-brand underline underline-offset-4">
          {mode === "register" ? t("login.signInLink") : t("login.createLink")}
        </Link>
      </p>
    </form>
  );
}
