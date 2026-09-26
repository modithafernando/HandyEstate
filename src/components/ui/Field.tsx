import { cn } from "@/lib/cn";

export const inputClass =
  "w-full h-12 rounded-md border border-line-strong bg-surface px-3.5 text-body text-ink placeholder:text-ink-3 focus:outline-2 focus:outline-brand focus:outline-offset-0 focus:border-brand aria-[invalid=true]:border-danger";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  optional,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  htmlFor: string;
  optional?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-small font-semibold text-ink">
        {label}
        {optional && <span className="font-normal text-ink-2"> ({optional})</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="text-caption text-ink-2">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
