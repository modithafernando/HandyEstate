import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { LinkButton } from "@/components/ui/Button";
import { getI18n } from "@/lib/i18n/server";
import { requireProvider } from "@/server/services/auth";

export default async function SetupDone() {
  await requireProvider();
  const { t } = await getI18n();
  return (
    <main id="main" className="mx-auto max-w-xl px-5 pt-14 sm:px-8">
      <CheckCircle size={56} weight="fill" className="text-live" aria-hidden />
      <h1 className="mt-5 text-title font-extrabold">{t("setup.done.title")}</h1>
      <p className="mt-3 text-body text-ink-2">{t("setup.done.body")}</p>
      <LinkButton href="/pro" size="lg" className="mt-8 w-full sm:w-auto">
        {t("setup.done.cta")}
      </LinkButton>
    </main>
  );
}
