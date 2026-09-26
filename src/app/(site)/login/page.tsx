import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OtpLogin } from "@/components/auth/OtpLogin";
import { getI18n } from "@/lib/i18n/server";
import { getCurrentUser, safeNext } from "@/server/services/auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; intent?: string }> }) {
  const { next, intent } = await searchParams;
  const dest = safeNext(next);
  if (await getCurrentUser()) redirect(dest);
  const { t } = await getI18n();
  return (
    <div className="mx-auto max-w-md px-5 pt-8 sm:pt-14">
      <OtpLogin next={dest} intro={intent === "review" ? t("review.signInFirst") : undefined} />
    </div>
  );
}
