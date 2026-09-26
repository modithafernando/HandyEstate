import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { BackLink } from "@/components/provider/BackLink";
import { ReviewForm } from "@/components/review/ReviewForm";
import { getI18n } from "@/lib/i18n/server";
import { db, schema as s } from "@/server/db";
import { getReviewTags } from "@/server/queries/catalog";
import { getProviderBySlug } from "@/server/queries/provider";
import { getCurrentUser } from "@/server/services/auth";

export const metadata = { title: "Write a review", robots: { index: false } };

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await getProviderBySlug(slug);
  if (!row || row.p.status !== "approved") notFound();
  const user = await getCurrentUser();
  if (!user) redirect(`/login?intent=review&next=${encodeURIComponent(`/p/${slug}/review`)}`);
  if (user.providerId === row.p.id) redirect(`/p/${slug}`);

  const [{ t }, tags, existing] = await Promise.all([
    getI18n(),
    getReviewTags(),
    db.select({ id: s.reviews.id }).from(s.reviews).where(and(eq(s.reviews.providerId, row.p.id), eq(s.reviews.userId, user.id))).limit(1),
  ]);

  return (
    <div className="mx-auto max-w-xl px-5 pb-10 sm:px-8">
      <div className="pt-2">
        <BackLink href={`/p/${slug}`} label={t("nav.back")} />
      </div>
      <h1 className="mt-2 text-title font-extrabold">{t("review.title", { name: row.p.businessName || row.p.displayName })}</h1>
      {existing.length > 0 && <p className="mt-2 text-small text-ink-2">{t("review.already", { name: row.p.displayName })}</p>}
      <div className="mt-8">
        <ReviewForm providerId={row.p.id} tags={tags.map(({ id, name }) => ({ id, name }))} needsName={!user.name} />
      </div>
    </div>
  );
}
