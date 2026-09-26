import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flag, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { AvailableDot } from "@/components/provider/Availability";
import { BackLink } from "@/components/provider/BackLink";
import { ContactButton } from "@/components/provider/ContactButton";
import { RecordRecent } from "@/components/provider/RecordRecent";
import { RevealNumber } from "@/components/provider/RevealNumber";
import { ReviewItem } from "@/components/provider/ReviewItem";
import { ServiceList } from "@/components/provider/ServiceList";
import { TrustLine } from "@/components/provider/TrustLine";
import { TrackOnMount } from "@/components/track/TrackOnMount";
import { Avatar } from "@/components/ui/Avatar";
import { buttonClass, LinkButton } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";
import { cn } from "@/lib/cn";
import { formatKm } from "@/lib/i18n/format";
import { getI18n } from "@/lib/i18n/server";
import type { Translate } from "@/lib/i18n/translate";
import { mediaUrl, thumbUrl } from "@/lib/media";
import { averageRating } from "@/lib/rating";
import { getProviderProfile, type ProviderProfile } from "@/server/queries/provider";
import { getCurrentUser } from "@/server/services/auth";
import { getArea } from "@/server/services/location";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string; reviews?: string; reviewed?: string }> };

const REVIEWS_SHOWN = 5;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProviderProfile(slug, await getArea());
  if (!data) return {};
  const { provider: p, town, categories } = data;
  const title = [p.businessName || p.displayName, categories[0]?.name, town?.name].filter(Boolean).join(" · ");
  return { title, description: p.bio ?? undefined, robots: { index: p.status === "approved" && !p.isDemo } };
}

export default async function ProviderPage({ params, searchParams }: Props) {
  const [{ slug }, { from, reviews: showAll, reviewed }] = await Promise.all([params, searchParams]);
  const [{ t, locale }, area, user] = await Promise.all([getI18n(), getArea(), getCurrentUser()]);
  const data = await getProviderProfile(slug, area);
  if (!data) notFound();
  const { provider: p } = data;

  const isOwner = user?.providerId === p.id;
  const live = p.status === "approved";
  if (!live && !isOwner && !user?.isAdmin) notFound();

  const title = p.businessName || p.displayName;
  const source = from?.slice(0, 20) || "direct";
  const primaryCategory = data.categories[0];
  const reviews = showAll ? data.reviews : data.reviews.slice(0, REVIEWS_SHOWN);

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      {live && <TrackOnMount event={{ type: "PROVIDER_PROFILE_OPENED", providerId: p.id, townId: area.id, source }} />}
      {live && (
        <RecordRecent
          item={{
            id: p.id,
            slug: p.slug,
            title,
            name: p.displayName,
            sub: [primaryCategory?.name, data.town?.name].filter(Boolean).join(" · "),
            photo: mediaUrl(p.photoKey),
            hasWhatsapp: !!p.whatsapp,
          }}
        />
      )}

      <div className="pt-2">
        <BackLink href={primaryCategory ? `/search?cat=${primaryCategory.slug}` : "/"} label={t("nav.back")} />
      </div>

      {!live && (
        <p role="status" className="mt-2 border-l-2 border-accent bg-surface px-4 py-3 text-small">
          {p.status === "suspended" ? t("pro.suspended") : t("pro.pending")}
        </p>
      )}

      <div className="lg:grid lg:grid-cols-12 lg:gap-14">
        <article className="lg:col-span-7">
          {/* Identity */}
          <header className="flex gap-4 pt-3">
            <Avatar src={mediaUrl(p.photoKey)} name={p.displayName} size={84} />
            <div className="min-w-0 pt-0.5">
              <h1 className="text-title font-extrabold">{title}</h1>
              {p.businessName && <p className="mt-0.5 text-body text-ink-2">{p.displayName}</p>}
              <p className="mt-1 text-small text-ink-2">{data.categories.map((c) => c.name).join(" · ")}</p>
            </div>
          </header>

          <div className="mt-4 space-y-1.5">
            <TrustLine verified={p.isVerified} ratingSum={p.ratingSum} reviewCount={p.reviewCount} t={t} className="text-body" />
            {data.town && (
              <p className="flex items-start gap-1.5 text-body text-ink-2">
                <MapPin size={19} weight="fill" className="mt-0.5 shrink-0 text-ink-3" aria-hidden />
                <span>
                  {t("provider.serves", { town: data.town.name, km: p.serviceRadiusKm })}
                  {data.distanceKm !== null && data.town.id !== area.id && (
                    <>
                      <span className="text-line-strong"> · </span>
                      <span>{t("provider.kmFrom", { km: formatKm(data.distanceKm), area: area.name })}</span>
                    </>
                  )}
                </span>
              </p>
            )}
          </div>

          <AvailabilityBand available={data.available} t={t} className="mt-5 lg:hidden" />

          {p.bio && (
            <Section title={t("provider.about")}>
              <p className="text-body whitespace-pre-line">{p.bio}</p>
            </Section>
          )}

          {data.services.length > 0 && (
            <Section title={t("provider.services")}>
              <ServiceList services={data.services} t={t} locale={locale} />
              <p className="mt-3 text-caption text-ink-2">{t("provider.priceNote")}</p>
            </Section>
          )}

          {data.photos.length > 0 && (
            <Section title={t("provider.work")}>
              <ul className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0">
                {data.photos.map((ph, i) => (
                  <li key={ph.id} className="shrink-0">
                    <a href={mediaUrl(ph.key)!} target="_blank" rel="noopener" className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbUrl(ph.key)}
                        alt={t("provider.photoOf", { n: i + 1, total: data.photos.length })}
                        width={240}
                        height={240}
                        loading="lazy"
                        className="size-36 rounded-md bg-line object-cover sm:size-auto sm:aspect-square sm:w-full"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title={t("nav.reviews")} id="reviews">
            {reviewed && (
              <p role="status" className="mb-4 border-l-2 border-live bg-live-tint px-4 py-3 text-small font-medium">
                {t("review.thanks")}
              </p>
            )}
            <ReviewSummary data={data} t={t} />
            {reviews.length > 0 && (
              <ul className="mt-2 border-t border-line">
                {reviews.map((r) => (
                  <ReviewItem key={r.id} r={r} t={t} />
                ))}
              </ul>
            )}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {!showAll && data.reviews.length > REVIEWS_SHOWN && (
                <LinkButton href={`/p/${p.slug}?reviews=all#reviews`} variant="secondary" scroll={false}>
                  {t("provider.allReviews", { n: data.reviews.length })}
                </LinkButton>
              )}
              {live && !isOwner && (
                <LinkButton href={`/p/${p.slug}/review`} variant="secondary">
                  {t("provider.writeReview")}
                </LinkButton>
              )}
            </div>
          </Section>

          <footer className="mt-10 space-y-3 border-t border-line pt-5">
            {live && (
              <Link href={`/p/${p.slug}/report`} className="inline-flex items-center gap-1.5 text-small text-ink-2 hover:text-ink">
                <Flag size={16} aria-hidden />
                {t("provider.report")}
              </Link>
            )}
            {p.isDemo && <p className="text-caption text-ink-3">{t("provider.demo")}</p>}
          </footer>
        </article>

        {/* Desktop contact panel */}
        <aside className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-8 mt-3 rounded-lg border border-line bg-surface p-6">
            <AvailabilityBand available={data.available} t={t} />
            {live ? (
              <div className="mt-5 space-y-3">
                <ContactButton providerId={p.id} kind="call" source="profile" className={buttonClass("primary", "lg", "w-full")}>
                  <Phone size={22} weight="fill" aria-hidden />
                  {t("provider.callName", { name: p.displayName })}
                </ContactButton>
                {p.whatsapp && (
                  <ContactButton providerId={p.id} kind="whatsapp" source="profile" className={buttonClass("secondary", "lg", "w-full")}>
                    <WhatsappLogo size={22} weight="fill" className="text-[#1f9e4f]" aria-hidden />
                    {t("provider.whatsapp")}
                  </ContactButton>
                )}
                <div className="pt-1 text-center">
                  <RevealNumber providerId={p.id} source="profile" />
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {/* Mobile sticky call bar */}
      {live && (
        <>
          <div aria-hidden className="h-24 lg:hidden" />
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface px-4 pt-3 shadow-float pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
            <div className="mx-auto flex max-w-md gap-2.5">
              <ContactButton providerId={p.id} kind="call" source="profile" className={buttonClass("primary", "lg", "min-w-0 flex-1 text-lead")}>
                <Phone size={24} weight="fill" aria-hidden />
                <span className="truncate">{t("provider.callName", { name: p.displayName.split(" ")[0] })}</span>
              </ContactButton>
              {p.whatsapp && (
                <ContactButton
                  providerId={p.id}
                  kind="whatsapp"
                  source="profile"
                  className={buttonClass("secondary", "lg", "w-16 px-0")}
                  aria-label={t("provider.whatsapp")}
                >
                  <WhatsappLogo size={28} weight="fill" className="text-[#1f9e4f]" aria-hidden />
                </ContactButton>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section aria-labelledby={`${id ?? title}-h`} id={id} className="mt-9 scroll-mt-6">
      <h2 id={`${id ?? title}-h`} className="mb-3 text-lead font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function AvailabilityBand({ available, t, className }: { available: boolean; t: Translate; className?: string }) {
  return available ? (
    <p className={cn("flex items-center gap-2.5 rounded-md bg-live-tint px-4 py-3 text-body font-semibold text-live", className)}>
      <AvailableDot />
      {t("provider.availableToday")}
    </p>
  ) : (
    <p className={cn("rounded-md border border-line px-4 py-3 text-body text-ink-2", className)}>{t("provider.checkAvailability")}</p>
  );
}

function ReviewSummary({ data, t }: { data: ProviderProfile; t: Translate }) {
  const { provider: p, tagSummary } = data;
  const avg = averageRating(p.ratingSum, p.reviewCount);
  if (avg === null) return <p className="text-body text-ink-2">{t("provider.noReviews")}</p>;
  return (
    <div className="sm:flex sm:gap-10">
      <div className="flex items-center gap-3 sm:block sm:shrink-0">
        <p className="text-display font-extrabold leading-none">{avg.toFixed(1)}</p>
        <div className="sm:mt-2">
          <Stars value={avg} size={16} />
          <p className="text-small text-ink-2">{p.reviewCount === 1 ? t("provider.reviewsOne") : t("provider.reviews", { n: p.reviewCount })}</p>
        </div>
      </div>
      {tagSummary.length > 0 && (
        <div className="mt-5 min-w-0 flex-1 sm:mt-0">
          <h3 className="sr-only">{t("provider.whatPeopleSay")}</h3>
          <ul className="grid grid-cols-2 gap-x-6">
            {tagSummary.slice(0, 6).map((tag) => (
              <li key={tag.name} className="flex items-baseline justify-between border-b border-line py-2 text-small">
                <span>{tag.name}</span>
                <span className="font-semibold text-ink-2">{tag.n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
