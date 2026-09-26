import { LinkButton } from "@/components/ui/Button";
import { Wordmark } from "@/components/brand/Wordmark";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <Wordmark className="text-[1.375rem]" />
      <h1 className="mt-8 text-title font-extrabold">{t("error.notFound")}</h1>
      <LinkButton href="/" className="mt-6 self-start">
        {t("error.home")}
      </LinkButton>
    </main>
  );
}
