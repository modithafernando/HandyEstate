import Link from "next/link";
import { redirect } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { AreaForm } from "@/components/pro/AreaForm";
import { CategoriesForm } from "@/components/pro/CategoriesForm";
import { ContactForm } from "@/components/pro/ContactForm";
import { NameForm } from "@/components/pro/NameForm";
import { PhotoForm } from "@/components/pro/PhotoForm";
import { ServicesForm } from "@/components/pro/ServicesForm";
import { getI18n } from "@/lib/i18n/server";
import { mediaUrl } from "@/lib/media";
import { getCategories } from "@/server/queries/catalog";
import { getOwnProvider } from "@/server/queries/pro";
import { requireProvider } from "@/server/services/auth";
import { location } from "@/server/services/location";

export default async function ProProfile() {
  const user = await requireProvider();
  const own = await getOwnProvider(user.providerId);
  if (!own) redirect("/pro/setup/1");
  const [{ t }, cats, towns] = await Promise.all([getI18n(), getCategories(), location.listTowns()]);
  const back = "/pro/profile?saved=1";

  return (
    <div>
      <h1 className="text-title font-extrabold">{t("proEdit.title")}</h1>
      <nav className="mt-4 border-t border-line">
        {[
          { href: "/pro/photos", label: t("photos.title"), meta: String(own.photos.length) },
          { href: "/pro/verify", label: t("verify.title"), meta: own.p.isVerified ? t("provider.verified") : "" },
          { href: `/p/${own.p.slug}`, label: t("pro.viewPublic"), meta: "" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="flex h-14 items-center gap-3 border-b border-line font-semibold hover:text-brand">
            <span className="flex-1">{l.label}</span>
            <span className="text-small font-normal text-ink-2">{l.meta}</span>
            <CaretRight size={18} className="text-ink-3" aria-hidden />
          </Link>
        ))}
      </nav>

      <Section id="basics" title={t("proEdit.sectionBasics")}>
        <PhotoForm current={mediaUrl(own.p.photoKey)} name={own.p.displayName} next={back + "#basics"} />
        <div className="mt-10">
          <NameForm displayName={own.p.displayName} businessName={own.p.businessName} next={back + "#basics"} />
        </div>
      </Section>

      <Section id="jobs" title={t("proEdit.sectionJobs")}>
        <ServicesForm services={own.services} bio={own.p.bio} next={back + "#jobs"} />
      </Section>

      <Section id="work" title={t("proEdit.sectionWork")}>
        <CategoriesForm categories={cats.map(({ id, name, icon }) => ({ id, name, icon }))} selected={own.categoryIds} next={back + "#work"} />
        <div className="mt-10">
          <AreaForm towns={towns.map(({ slug, name, district }) => ({ slug, name, district }))} town={own.town?.slug} radius={own.p.serviceRadiusKm} next={back + "#work"} />
        </div>
      </Section>

      <Section id="contact" title={t("proEdit.sectionContact")}>
        <ContactForm phone={own.p.phone} whatsapp={own.p.whatsapp} />
      </Section>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="mt-12 scroll-mt-6">
      <h2 id={`${id}-h`} className="mb-5 border-b border-ink pb-2 text-lead font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}
