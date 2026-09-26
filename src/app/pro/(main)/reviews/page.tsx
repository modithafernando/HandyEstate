import { ReviewItem } from "@/components/provider/ReviewItem";
import { getI18n } from "@/lib/i18n/server";
import { getProviderReviews } from "@/server/queries/provider";
import { requireProvider } from "@/server/services/auth";

export default async function ProReviews() {
  const user = await requireProvider();
  const [{ t }, reviews] = await Promise.all([getI18n(), getProviderReviews(user.providerId)]);
  return (
    <div>
      <h1 className="text-title font-extrabold">{t("nav.reviews")}</h1>
      {reviews.length ? (
        <ul className="mt-4 border-t border-line">
          {reviews.map((r) => (
            <ReviewItem key={r.id} r={r} t={t} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-body text-ink-2">{t("pro.noReviews")}</p>
      )}
    </div>
  );
}
