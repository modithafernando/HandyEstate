import { notFound } from "next/navigation";
import { BackLink } from "@/components/provider/BackLink";
import { ReportForm } from "@/components/review/ReportForm";
import { getI18n } from "@/lib/i18n/server";
import { getProviderBySlug } from "@/server/queries/provider";

export const metadata = { title: "Report a profile", robots: { index: false } };

export default async function ReportPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await getProviderBySlug(slug);
  if (!row || row.p.status !== "approved") notFound();
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-xl px-5 sm:px-8">
      <div className="pt-2">
        <BackLink href={`/p/${slug}`} label={t("nav.back")} />
      </div>
      <h1 className="mt-2 text-title font-extrabold">{t("report.title")}</h1>
      <p className="mt-1 text-body text-ink-2">{row.p.businessName || row.p.displayName}</p>
      <div className="mt-6">
        <ReportForm providerId={row.p.id} />
      </div>
    </div>
  );
}
