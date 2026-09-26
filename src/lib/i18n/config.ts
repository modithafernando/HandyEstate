export const LOCALES = ["en", "si", "ta"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "he_locale";

/**
 * Locales switched on in the UI. Sinhala and Tamil stay off until a native
 * speaker has written the copy — machine translation is not good enough here.
 */
export const ENABLED_LOCALES: Locale[] = ["en"];

export const LOCALE_LABELS: Record<Locale, string> = { en: "English", si: "සිංහල", ta: "தமிழ்" };

/** BCP-47 tag used for number/date formatting and the html lang attribute. */
export const LOCALE_TAGS: Record<Locale, string> = { en: "en-LK", si: "si-LK", ta: "ta-LK" };

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}
