import { redirect } from "next/navigation";
import { deletePhoto } from "@/app/actions/pro";
import { PhotoUpload } from "@/components/pro/PhotoUpload";
import { getI18n } from "@/lib/i18n/server";
import { thumbUrl } from "@/lib/media";
import { getOwnProvider } from "@/server/queries/pro";
import { requireProvider } from "@/server/services/auth";

export default async function ProPhotos() {
  const user = await requireProvider();
  const own = await getOwnProvider(user.providerId);
  if (!own) redirect("/pro/setup/1");
  const { t } = await getI18n();
  return (
    <div>
      <h1 className="text-title font-extrabold">{t("photos.title")}</h1>
      <p className="mt-2 text-body text-ink-2">{t("photos.body")}</p>
      <div className="mt-6">
        <PhotoUpload full={own.photos.length >= 12} />
      </div>
      {own.photos.length ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {own.photos.map((ph, i) => (
            <li key={ph.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={thumbUrl(ph.key)} alt={t("provider.photoOf", { n: i + 1, total: own.photos.length })} className="aspect-square w-full rounded-md bg-line object-cover" />
              <form action={deletePhoto}>
                <input type="hidden" name="id" value={ph.id} />
                <button type="submit" className="mt-1 h-10 text-small font-semibold text-danger">
                  {t("photos.remove")}
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-body text-ink-3">{t("photos.empty")}</p>
      )}
    </div>
  );
}
