import { Stars } from "@/components/ui/Stars";
import { timeAgo } from "@/lib/i18n/format";
import type { Translate } from "@/lib/i18n/translate";
import type { ReviewView } from "@/server/queries/provider";

export function ReviewItem({ r, t }: { r: ReviewView; t: Translate }) {
  return (
    <li className="border-b border-line py-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-body font-semibold">{r.authorName}</p>
        <p className="text-caption text-ink-2">{timeAgo(r.createdAt, t)}</p>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <Stars value={r.rating} />
        <span className="sr-only">{r.rating === 1 ? t("review.star", { n: 1 }) : t("review.stars", { n: r.rating })}</span>
        {r.tags.length > 0 && <span className="text-caption text-ink-2">{r.tags.join(" · ")}</span>}
      </div>
      {r.comment && <p className="mt-2 text-body">{r.comment}</p>}
    </li>
  );
}
