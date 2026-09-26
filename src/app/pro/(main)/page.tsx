import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowRight, CaretRight, CheckCircle, Circle, SealCheck, Star } from "@phosphor-icons/react/dist/ssr";
import { AvailabilitySwitch } from "@/components/pro/AvailabilitySwitch";
import { getI18n } from "@/lib/i18n/server";
import type { MessageKey } from "@/lib/i18n/en";
import { averageRating } from "@/lib/rating";
import { isAvailable } from "@/lib/time";
import { db, schema as s } from "@/server/db";
import { completeness, getOwnProvider } from "@/server/queries/pro";
import { getProviderStats } from "@/server/queries/provider";
import { requireProvider } from "@/server/services/auth";

const CHECKLIST: { key: keyof ReturnType<typeof completeness>; label: MessageKey; href: string }[] = [
  { key: "photo", label: "pro.item.photo", href: "/pro/profile#basics" },
  { key: "prices", label: "pro.item.prices", href: "/pro/profile#jobs" },
  { key: "bio", label: "pro.item.bio", href: "/pro/profile#jobs" },
  { key: "photos", label: "pro.item.photos", href: "/pro/photos" },
  { key: "verify", label: "pro.item.verify", href: "/pro/verify" },
  { key: "whatsapp", label: "pro.item.whatsapp", href: "/pro/profile#contact" },
];

export default async function ProToday() {
  const user = await requireProvider();
  const own = await getOwnProvider(user.providerId);
  if (!own) redirect("/pro/setup/1");
  if (own.p.status === "draft") redirect(`/pro/setup/${own.p.setupStep}`);
  await db.update(s.providers).set({ lastActiveAt: new Date() }).where(eq(s.providers.id, own.p.id));

  const [{ t }, stats] = await Promise.all([getI18n(), getProviderStats(own.p.id, 7)]);
  const done = completeness(own);
  const todo = CHECKLIST.filter((c) => !done[c.key]);
  const avg = averageRating(own.p.ratingSum, own.p.reviewCount);
  const statRows = [
    { n: stats.impressions, label: t("pro.stat.impressions") },
    { n: stats.views, label: t("pro.stat.views") },
    { n: stats.calls, label: t("pro.stat.calls") },
    { n: stats.whatsapp, label: t("pro.stat.whatsapp") },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-title font-extrabold">{t("pro.greeting", { name: own.p.displayName })}</h1>
        {own.p.status !== "approved" && (
          <p role="status" className="mt-3 border-l-2 border-accent bg-surface px-4 py-3 text-small">
            {own.p.status === "suspended" ? t("pro.suspended") : t("pro.pending")}
          </p>
        )}
      </div>

      <AvailabilitySwitch on={isAvailable(own.p.availableUntil)} />

      <section aria-labelledby="stats-h">
        <h2 id="stats-h" className="border-b border-ink pb-2 text-small font-semibold text-ink-2">
          {t("pro.week")}
        </h2>
        <dl>
          {statRows.map((r) => (
            <div key={r.label} className="flex items-baseline gap-4 border-b border-line py-3">
              <dt className="order-2 text-body text-ink-2">
                <span className="sr-only">{r.n}</span> {r.n === 1 ? t("pro.stat.unitOne") : t("pro.stat.unit")} {r.label}
              </dt>
              <dd className="order-1 w-14 shrink-0 text-title font-extrabold" aria-hidden>
                {r.n}
              </dd>
            </div>
          ))}
        </dl>
        <Link href="/pro/reviews" className="flex items-center gap-3 border-b border-line py-4 hover:bg-surface">
          <Star size={22} weight="fill" className="text-star" aria-hidden />
          <span className="flex-1 text-body">{avg !== null ? t("pro.rating", { rating: avg.toFixed(1), n: own.p.reviewCount }) : t("pro.noReviews")}</span>
          <CaretRight size={18} className="text-ink-3" aria-hidden />
        </Link>
      </section>

      {todo.length > 0 && (
        <section aria-labelledby="finish-h">
          <div className="flex items-baseline justify-between border-b border-ink pb-2">
            <h2 id="finish-h" className="text-small font-semibold text-ink-2">
              {t("pro.finish")}
            </h2>
            <span className="text-small text-ink-2">
              {CHECKLIST.length - todo.length}/{CHECKLIST.length}
            </span>
          </div>
          <p className="mt-3 text-small text-ink-2">{t("pro.finishBody")}</p>
          <ul className="mt-2">
            {CHECKLIST.map((c) => (
              <li key={c.key}>
                {done[c.key] ? (
                  <p className="flex items-center gap-3 border-b border-line py-3.5 text-body text-ink-3 line-through decoration-line-strong">
                    <CheckCircle size={22} weight="fill" className="text-live" aria-hidden />
                    {t(c.label)}
                  </p>
                ) : (
                  <Link href={c.href} className="flex items-center gap-3 border-b border-line py-3.5 text-body font-semibold hover:text-brand">
                    <Circle size={22} className="text-line-strong" aria-hidden />
                    <span className="flex-1">
                      {c.key === "verify" && own.verification?.status === "pending" ? t("pro.verifyPending") : t(c.label)}
                    </span>
                    <CaretRight size={18} className="text-ink-3" aria-hidden />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {own.p.isVerified && (
        <p className="flex items-center gap-2 text-body font-semibold text-brand">
          <SealCheck size={22} weight="fill" aria-hidden />
          {t("pro.verifiedBadge")}
        </p>
      )}

      <Link href={`/p/${own.p.slug}`} className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline">
        {t("pro.viewPublic")} <ArrowRight size={16} weight="bold" aria-hidden />
      </Link>
    </div>
  );
}
