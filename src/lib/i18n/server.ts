import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { DEFAULT_LOCALE, ENABLED_LOCALES, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { createTranslator, getMessages } from "./translate";

export const getLocale = cache(async (): Promise<Locale> => {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(v) && ENABLED_LOCALES.includes(v) ? v : DEFAULT_LOCALE;
});

export const getI18n = cache(async () => {
  const locale = await getLocale();
  const messages = getMessages(locale);
  return { locale, messages, t: createTranslator(messages) };
});
