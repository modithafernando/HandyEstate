import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { AreaForm } from "@/components/pro/AreaForm";
import { CategoriesForm } from "@/components/pro/CategoriesForm";
import { NameForm } from "@/components/pro/NameForm";
import { PhotoForm } from "@/components/pro/PhotoForm";
import { ServicesForm } from "@/components/pro/ServicesForm";
import { cn } from "@/lib/cn";
import { getI18n } from "@/lib/i18n/server";
import { mediaUrl } from "@/lib/media";
import { SETUP_STEPS } from "@/lib/setup";
import { getCategories } from "@/server/queries/catalog";
import { getOwnProvider } from "@/server/queries/pro";
import { requireUser } from "@/server/services/auth";
import { location } from "@/server/services/location";

export default async function SetupStep({ params }: { params: Promise<{ step: string }> }) {
  const step = Number((await params).step);
  if (!Number.isInteger(step) || step < 1 || step > SETUP_STEPS) notFound();
  const user = await requireUser(`/pro/setup/${step}`);
  const own = user.providerId ? await getOwnProvider(user.providerId) : null;
  if (!own && step !== 1) redirect("/pro/setup/1");
  if (own && step > own.p.setupStep) redirect(`/pro/setup/${own.p.setupStep}`);

  const { t } = await getI18n();
  const titles = ["setup.name.title", "setup.photo.title", "setup.cats.title", "setup.area.title", "setup.services.title"] as const;
  const bodies = [null, "setup.photo.body", "setup.cats.body", null, "setup.services.body"] as const;
  const body = bodies[step - 1];

  let form: React.ReactNode;
  switch (step) {
    case 1:
      form = <NameForm displayName={own?.p.displayName ?? user.name ?? ""} businessName={own?.p.businessName} />;
      break;
    case 2:
      form = <PhotoForm current={mediaUrl(own!.p.photoKey)} name={own!.p.displayName} />;
      break;
    case 3: {
      const cats = await getCategories();
      form = <CategoriesForm categories={cats.map(({ id, name, icon }) => ({ id, name, icon }))} selected={own!.categoryIds} />;
      break;
    }
    case 4: {
      const towns = await location.listTowns();
      form = <AreaForm towns={towns.map(({ slug, name, district }) => ({ slug, name, district }))} town={own!.town?.slug} radius={own!.p.serviceRadiusKm} />;
      break;
    }
    default:
      form = <ServicesForm services={own!.services} bio={own!.p.bio} />;
  }

  return (
    <main id="main" className="mx-auto max-w-xl px-5 pb-16 pt-4 sm:px-8">
      <div className="flex h-11 items-center justify-between">
        {step > 1 ? (
          <Link href={`/pro/setup/${step - 1}`} className="-ml-2 inline-flex h-11 items-center gap-1.5 rounded-md px-2 text-small font-semibold text-ink-2 hover:text-ink">
            <ArrowLeft size={18} weight="bold" aria-hidden />
            {t("setup.back")}
          </Link>
        ) : (
          <span />
        )}
        <p className="text-small text-ink-2">{t("setup.step", { n: step, total: SETUP_STEPS })}</p>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1" aria-hidden>
        {Array.from({ length: SETUP_STEPS }, (_, i) => (
          <span key={i} className={cn("h-1 rounded-full", i < step ? "bg-brand" : "bg-line")} />
        ))}
      </div>
      <h1 className="mt-8 text-title font-extrabold">{t(titles[step - 1])}</h1>
      {body && <p className="mt-2 text-body text-ink-2">{t(body)}</p>}
      <div className="mt-7">{form}</div>
    </main>
  );
}
