import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { cn } from "@/lib/cn";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentUser, safeNext } from "@/server/services/auth";
import logo from "../../../public/brand/handyestate-logo-transparent.png";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

type Props = { searchParams: Promise<{ as?: string; mode?: string; next?: string }> };

/** The first page. Customers first; handymen one tap away. */
export default async function LoginPage({ searchParams }: Props) {
  const { as, mode: rawMode, next: rawNext } = await searchParams;
  const role = as === "handyman" ? "handyman" : "customer";
  const mode = rawMode === "register" ? "register" : "signin";
  const next = rawNext ? safeNext(rawNext) : undefined;

  const user = await getCurrentUser();
  if (user) redirect(next ?? (role === "handyman" && user.providerId ? "/pro" : "/"));

  const { t } = await getI18n();
  const title =
    mode === "register"
      ? t(role === "handyman" ? "login.registerHandymanTitle" : "login.registerCustomerTitle")
      : t(role === "handyman" ? "login.handymanTitle" : "login.customerTitle");
  const body =
    mode === "register" ? (role === "handyman" ? t("login.registerHandymanBody") : null) : t(role === "handyman" ? "login.handymanBody" : "login.customerBody");
  const tab = (r: "customer" | "handyman") =>
    `/login?${new URLSearchParams({ ...(r === "handyman" ? { as: r } : {}), ...(mode === "register" ? { mode } : {}), ...(next ? { next } : {}) })}`;

  return (
    <main id="main" className="min-h-dvh lg:grid lg:grid-cols-2">
      {/* Brand panel (desktop) */}
      <div className="hidden items-center justify-center border-r border-line bg-surface p-16 lg:flex">
        <Image src={logo} alt="HandyEstate" priority className="h-auto w-full max-w-md" />
      </div>

      <div className="mx-auto w-full max-w-md px-5 pb-12 pt-6 sm:pt-12 lg:flex lg:flex-col lg:justify-center">
        <Image src={logo} alt="HandyEstate" priority className="mx-auto h-auto w-48 lg:hidden" />

        {/* Customer first — it's the default and on the left. */}
        <nav aria-label={t("login.signIn")} className="mt-4 grid grid-cols-2 rounded-md border border-line-strong bg-surface p-1 lg:mt-0">
          {(["customer", "handyman"] as const).map((r) => (
            <Link
              key={r}
              href={tab(r)}
              replace
              aria-current={role === r ? "page" : undefined}
              className={cn(
                "flex h-11 items-center justify-center rounded-[4px] text-small font-semibold",
                role === r ? "bg-brand text-white" : "text-ink-2 hover:text-ink",
              )}
            >
              {r === "customer" ? t("login.asCustomer") : t("login.asHandyman")}
            </Link>
          ))}
        </nav>

        <h1 className="mt-8 text-title font-extrabold">{title}</h1>
        {body && <p className="mt-2 text-body text-ink-2">{body}</p>}

        <div className="mt-7">
          <LoginForm key={`${role}-${mode}`} role={role} mode={mode} next={next} />
        </div>

        {process.env.NODE_ENV !== "production" && mode === "signin" && (
          <aside className="mt-10 border-t border-line pt-5 text-small">
            <h2 className="font-semibold text-ink-2">{t("login.demo")}</h2>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="text-ink-2">{t("login.demoCustomer")}</dt>
              <dd>
                070 000 0001 · <code>customer123</code>
              </dd>
              <dt className="text-ink-2">{t("login.demoHandyman")}</dt>
              <dd>
                070 000 0100 · <code>handyman123</code>
              </dd>
            </dl>
          </aside>
        )}
      </div>
    </main>
  );
}
