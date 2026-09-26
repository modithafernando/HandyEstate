import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import type { Translate } from "@/lib/i18n/translate";

export function SiteFooter({ t }: { t: Translate }) {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-small text-ink-2 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <Wordmark className="text-body" />
          <span>{t("footer.beta")}</span>
        </div>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li><Link className="hover:text-ink" href="/join">{t("footer.forPros")}</Link></li>
          <li><Link className="hover:text-ink" href="/privacy">{t("footer.privacy")}</Link></li>
          <li><Link className="hover:text-ink" href="/terms">{t("footer.terms")}</Link></li>
        </ul>
      </div>
    </footer>
  );
}
