import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { setReviewStatus } from "@/app/actions/admin";
import { H1, StatusTag, smallBtn, table } from "@/components/admin";
import { db, schema as s } from "@/server/db";

export const metadata = { title: "Reviews" };

export default async function AdminReviews() {
  const rows = await db
    .select({ r: s.reviews, provider: s.providers.displayName, slug: s.providers.slug, author: s.users.name, phone: s.users.phone })
    .from(s.reviews)
    .innerJoin(s.providers, eq(s.providers.id, s.reviews.providerId))
    .innerJoin(s.users, eq(s.users.id, s.reviews.userId))
    .orderBy(desc(s.reviews.createdAt))
    .limit(200);
  return (
    <div>
      <H1>Reviews</H1>
      <div className="mt-4 overflow-x-auto">
        <table className={table}>
          <thead><tr><th>Date</th><th>Provider</th><th>By</th><th>★</th><th>Comment</th><th>Contact?</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map(({ r, provider, slug, author, phone }) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap">{r.createdAt.toISOString().slice(0, 10)}</td>
                <td><Link className="text-brand hover:underline" href={`/p/${slug}`}>{provider}</Link></td>
                <td>{author}<div className="text-caption text-ink-2">{phone}</div></td>
                <td>{r.rating}</td>
                <td className="max-w-sm">{r.comment}</td>
                <td>{r.hadContact ? "yes" : "no"}</td>
                <td><StatusTag status={r.status} /></td>
                <td>
                  <form action={setReviewStatus}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="status" value={r.status === "published" ? "hidden" : "published"} />
                    <button className={smallBtn}>{r.status === "published" ? "Hide" : "Publish"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
