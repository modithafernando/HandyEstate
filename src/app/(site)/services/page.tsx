import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { getI18n } from "@/lib/i18n/server";
import { localizedName } from "@/lib/i18n/translate";
import { getCategories } from "@/server/queries/catalog";

export const metadata = { title: "All services" };

export default async function ServicesPage() {
  const [{ t, locale }, categories] = await Promise.all([getI18n(), getCategories()]);
  return (
    <div className="mx-auto max-w-2xl px-5 pt-8 sm:px-8">
      <h1 className="text-title font-extrabold">{t("services.title")}</h1>
      <ul className="mt-5 border-t border-line">
        {categories.map((c) => (
          <li key={c.id}>
            <Link href={`/search?cat=${c.slug}`} className="flex h-16 items-center gap-4 border-b border-line hover:bg-surface">
              <CategoryIcon icon={c.icon} size={26} className="text-brand" />
              <span className="flex-1 text-body font-semibold">{localizedName(c, locale)}</span>
              <CaretRight size={18} className="text-ink-3" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
