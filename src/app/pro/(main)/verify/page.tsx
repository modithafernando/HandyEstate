import { redirect } from "next/navigation";
import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import { VerifyForm } from "@/components/pro/VerifyForm";
import { getI18n } from "@/lib/i18n/server";
import { getOwnProvider } from "@/server/queries/pro";
import { requireProvider } from "@/server/services/auth";

export default async function ProVerify() {
  const user = await requireProvider();
  const own = await getOwnProvider(user.providerId);
  if (!own) redirect("/pro/setup/1");
  const { t } = await getI18n();
  const v = own.verification;
  return (
    <div className="max-w-xl">
      <h1 className="text-title font-extrabold">{t("verify.title")}</h1>
      <p className="mt-2 text-body text-ink-2">{t("verify.body")}</p>
      <div className="mt-8">
        {own.p.isVerified ? (
          <p className="flex items-center gap-2 text-body font-semibold text-brand">
            <SealCheck size={24} weight="fill" aria-hidden />
            {t("verify.done")}
          </p>
        ) : v?.status === "pending" ? (
          <p role="status" className="border-l-2 border-accent bg-surface px-4 py-3 text-body">
            {t("verify.pending")}
          </p>
        ) : (
          <>
            {v?.status === "rejected" && (
              <p role="alert" className="mb-6 border-l-2 border-danger bg-danger-tint px-4 py-3 text-small">
                {t("verify.rejected", { note: v.note ?? "—" })}
              </p>
            )}
            <VerifyForm />
          </>
        )}
      </div>
    </div>
  );
}
