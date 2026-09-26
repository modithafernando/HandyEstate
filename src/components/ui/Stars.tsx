import { Star } from "@phosphor-icons/react/dist/ssr";

/** Read-only star row. Always pair with text for screen readers. */
export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-px text-star" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} weight={i <= Math.round(value) ? "fill" : "regular"} className={i <= Math.round(value) ? "" : "text-line-strong"} />
      ))}
    </span>
  );
}
