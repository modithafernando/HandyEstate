import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { requireAdmin } from "@/server/services/auth";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

const LINKS = [
  ["/admin", "Overview"],
  ["/admin/providers?status=pending", "Approvals"],
  ["/admin/providers", "Providers"],
  ["/admin/categories", "Categories"],
  ["/admin/reviews", "Reviews"],
  ["/admin/reports", "Reports"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-5 py-3">
          <Link href="/admin" className="flex items-baseline gap-2">
            <Wordmark className="text-lead" />
            <span className="text-small font-semibold text-ink-2">Admin</span>
          </Link>
          <nav className="no-scrollbar -mx-5 flex overflow-x-auto px-5 text-small font-semibold sm:mx-0 sm:px-0">
            {LINKS.map(([href, label]) => (
              <Link key={href} href={href} className="rounded-md px-3 py-2 text-ink-2 hover:bg-ink/5 hover:text-ink">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-6">{children}</main>
    </div>
  );
}
