import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentUser } from "@/server/services/auth";
import { getArea, location } from "@/server/services/location";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ t }, area, towns, user] = await Promise.all([getI18n(), getArea(), location.listTowns(), getCurrentUser()]);
  // Signed-in only for now (the proxy sends visitors without a session to /login).
  if (!user) redirect("/login");
  const opts = towns.map(({ slug, name, district }) => ({ slug, name, district }));
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:font-semibold">
        {t("nav.skip")}
      </a>
      <AppHeader t={t} area={{ slug: area.slug, name: area.name, district: area.district }} towns={opts} isProvider={!!user?.providerId} />
      <main id="main">{children}</main>
      <SiteFooter t={t} signedIn />
      <BottomNav isProvider={!!user?.providerId} />
    </>
  );
}
