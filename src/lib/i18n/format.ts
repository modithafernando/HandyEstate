import { LOCALE_TAGS, type Locale } from "./config";
import type { Translate } from "./translate";

export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAGS[locale]).format(n);
}

export function formatKm(km: number): string {
  if (km < 1) return "< 1";
  return km < 10 ? km.toFixed(1) : String(Math.round(km));
}

export function timeAgo(date: Date | string, t: Translate, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - new Date(date).getTime()) / 86400_000);
  if (days <= 0) return t("common.timeAgo.today");
  if (days === 1) return t("common.timeAgo.yesterday");
  if (days < 14) return t("common.timeAgo.days", { n: days });
  if (days < 60) return t("common.timeAgo.weeks", { n: Math.floor(days / 7) });
  if (days < 365) return t("common.timeAgo.months", { n: Math.floor(days / 30) });
  return t("common.timeAgo.years", { n: Math.floor(days / 365) });
}
