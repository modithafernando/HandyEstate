import { SealCheck, Star } from "@phosphor-icons/react/dist/ssr";
import { averageRating } from "@/lib/rating";
import type { Translate } from "@/lib/i18n/translate";
import { cn } from "@/lib/cn";

/** "✓ Verified · ★ 4.8 · 37 reviews" */
export function TrustLine({
  verified,
  ratingSum,
  reviewCount,
  t,
  className,
}: {
  verified: boolean;
  ratingSum: number;
  reviewCount: number;
  t: Translate;
  className?: string;
}) {
  const avg = averageRating(ratingSum, reviewCount);
  return (
    <p className={cn("flex flex-wrap items-center gap-x-3 gap-y-0.5 text-small text-ink-2", className)}>
      {verified && (
        <span className="inline-flex items-center gap-1 font-semibold text-brand">
          <SealCheck size={17} weight="fill" aria-hidden />
          {t("provider.verified")}
        </span>
      )}
      {avg !== null ? (
        <span className="inline-flex items-center gap-1">
          <Star size={15} weight="fill" className="text-star" aria-hidden />
          <span className="sr-only">{t("provider.ratingLabel", { rating: avg.toFixed(1), n: reviewCount })}</span>
          <span aria-hidden>
            <span className="font-semibold text-ink">{avg.toFixed(1)}</span>
            <span className="text-line-strong"> · </span>
            {reviewCount === 1 ? t("provider.reviewsOne") : t("provider.reviews", { n: reviewCount })}
          </span>
        </span>
      ) : (
        <span>{t("provider.noReviews")}</span>
      )}
    </p>
  );
}
