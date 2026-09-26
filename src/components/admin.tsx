/** Plain building blocks for the internal admin — functional over pretty. */
export const table = "w-full border-collapse text-small [&_th]:border-b [&_th]:border-ink [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th.text-right]:text-right [&_th]:font-semibold [&_th]:text-ink-2 [&_td]:border-b [&_td]:border-line [&_td]:py-2.5 [&_td]:pr-4 [&_td]:align-top";
export const smallBtn = "h-9 rounded-md border border-line-strong bg-surface px-3 text-small font-semibold hover:border-ink-3";
export const smallBtnPrimary = "h-9 rounded-md bg-brand px-3 text-small font-semibold text-white hover:bg-brand-strong";
export const smallBtnDanger = "h-9 rounded-md bg-danger px-3 text-small font-semibold text-white hover:opacity-90";
export const smallInput = "h-9 rounded-md border border-line-strong bg-surface px-2.5 text-small";

export function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-title font-extrabold">{children}</h1>;
}

export function StatusTag({ status }: { status: string }) {
  const color: Record<string, string> = {
    approved: "text-live",
    published: "text-live",
    pending: "text-accent",
    open: "text-accent",
    draft: "text-ink-3",
    suspended: "text-danger",
    hidden: "text-danger",
    rejected: "text-danger",
    resolved: "text-ink-3",
    dismissed: "text-ink-3",
  };
  return <span className={`font-semibold ${color[status] ?? ""}`}>{status}</span>;
}
