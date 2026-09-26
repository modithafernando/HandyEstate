import { cn } from "@/lib/cn";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Square photo with restrained radius; initials when there's no photo. */
export function Avatar({ src, name, size = 56, className }: { src?: string | null; name: string; size?: number; className?: string }) {
  const style = { width: size, height: size };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} style={style} className={cn("shrink-0 rounded-lg object-cover bg-line", className)} />;
  }
  return (
    <span
      aria-hidden
      style={{ ...style, fontSize: Math.round(size * 0.36) }}
      className={cn("shrink-0 rounded-lg bg-brand-tint text-brand font-extrabold tracking-[-0.03em] grid place-items-center", className)}
    >
      {initials(name)}
    </span>
  );
}
