"use client";

import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const { t } = useI18n();
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-md flex-col justify-center px-5">
      <h1 className="text-title font-extrabold">{t("error.generic")}</h1>
      <Button onClick={reset} className="mt-6 self-start">
        {t("error.retry")}
      </Button>
    </main>
  );
}
