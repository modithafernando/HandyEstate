import { cn } from "@/lib/cn";

/**
 * Typographic wordmark. "Handy" in deep green, "Estate" in the accent orange —
 * the same split as the full logo, but crisp at header size.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline font-extrabold tracking-[-0.035em] leading-none select-none", className)}>
      <span className="text-brand">Handy</span>
      <span className="text-accent">Estate</span>
    </span>
  );
}
