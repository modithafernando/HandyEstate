"use client";

import { createContext, useContext, useMemo } from "react";
import type { Messages } from "./en";
import type { Locale } from "./config";
import { createTranslator, type Translate } from "./translate";

type Ctx = { locale: Locale; t: Translate };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, t: createTranslator(messages) }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
