import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-colors select-none disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-strong active:bg-brand-strong",
  secondary: "bg-surface text-ink border border-line-strong hover:border-ink-3 active:bg-paper",
  ghost: "text-brand hover:bg-brand-tint",
  danger: "bg-danger text-white hover:opacity-90",
};
const sizes: Record<Size, string> = {
  sm: "h-10 px-3.5 text-small",
  md: "h-12 px-5 text-body",
  lg: "h-14 px-6 text-body",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
