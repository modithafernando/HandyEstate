import { RecentList } from "@/components/provider/RecentList";
import { getI18n } from "@/lib/i18n/server";

export const metadata = { title: "Recently viewed", robots: { index: false } };

export default async function RecentPage() {
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-2xl px-5 pt-8 sm:px-8">
      <h1 className="text-title font-extrabold">{t("recent.title")}</h1>
      <RecentList />
    </div>
  );
}
