import { en, type MessageKey, type Messages } from "./en";
import { si } from "./si";
import { ta } from "./ta";
import type { Locale } from "./config";

const dictionaries: Record<Locale, Partial<Messages>> = { en, si, ta };

export type Vars = Record<string, string | number>;
export type Translate = (key: MessageKey, vars?: Vars) => string;

export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export function getMessages(locale: Locale): Messages {
  return { ...en, ...dictionaries[locale] } as Messages;
}

export function createTranslator(messages: Messages): Translate {
  return (key, vars) => interpolate(messages[key] ?? key, vars);
}

/** Pick the localized name from a row with `name` + `names` jsonb. */
export function localizedName(row: { name: string; names?: { si?: string; ta?: string } | null }, locale: Locale): string {
  if (locale === "en") return row.name;
  return row.names?.[locale] || row.name;
}
