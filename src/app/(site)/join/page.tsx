import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { LinkButton } from "@/components/ui/Button";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentUser } from "@/server/services/auth";
import logo from "../../../../public/brand/handyestate-logo.png";

export const metadata: Metadata = {
  title: "For plumbers, electricians and other trades",
  description: "Get calls from people nearby who need your work. Free while HandyEstate is in beta.",
};

export default async function JoinPage() {
  const user = await getCurrentUser();
  if (user?.providerId) redirect("/pro");
  const { t } = await getI18n();
  const start = "/pro/setup";
  const needs = [t("join.need1"), t("join.need2"), t("join.need3"), t("join.need4")];
  const how = [t("join.how1"), t("join.how2"), t("join.how3"), t("join.how4")];

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <section className="pt-8 lg:grid lg:grid-cols-12 lg:items-center lg:gap-14 lg:pt-16">
        <div className="lg:col-span-7">
          <h1 className="text-display font-extrabold lg:text-display-lg">{t("join.title")}</h1>
          <p className="mt-4 max-w-xl text-body text-ink-2">{t("join.body")}</p>
          <p className="mt-4 inline-block border-l-2 border-accent pl-3 text-body font-semibold">{t("join.free")}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <LinkButton href={start} size="lg" className="w-full sm:w-auto sm:px-10">
              {t("join.cta")}
            </LinkButton>
          </div>
        </div>
        <div className="hidden lg:col-span-5 lg:block">
          <Image src={logo} alt="HandyEstate" priority className="h-auto w-full max-w-sm mix-blend-multiply" />
        </div>
      </section>

      <div className="mt-12 grid gap-10 border-t border-line pt-8 md:grid-cols-2 md:gap-14">
        <section>
          <h2 className="text-lead font-bold">{t("join.howTitle")}</h2>
          <ol className="mt-4 space-y-4">
            {how.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-brand text-small font-bold text-white">{i + 1}</span>
                <span className="pt-0.5 text-body">{step}</span>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="text-lead font-bold">{t("join.need")}</h2>
          <ul className="mt-4 border-t border-line">
            {needs.map((n) => (
              <li key={n} className="flex gap-3 border-b border-line py-3 text-body">
                <Check size={20} weight="bold" className="mt-0.5 shrink-0 text-brand" aria-hidden />
                {n}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
