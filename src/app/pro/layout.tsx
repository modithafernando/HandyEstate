import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { Wordmark } from "@/components/brand/Wordmark";
import { getI18n } from "@/lib/i18n/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/services/auth";

export const metadata: Metadata = { title: "My work", robots: { index: false } };

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  if (!(await getCurrentUser())) redirect("/login?as=handyman&next=/pro");
  const { t } = await getI18n();
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label={t("brand.name")} className="-ml-1 rounded-sm px-1 py-2">
            <Wordmark className="text-[1.25rem]" />
          </Link>
          <form action={signOut}>
            <button type="submit" className="h-11 rounded-md px-2 text-small font-semibold text-ink-2 hover:text-ink">
              {t("nav.signOut")}
            </button>
          </form>
        </div>
      </header>
      {children}
    </>
  );
}
