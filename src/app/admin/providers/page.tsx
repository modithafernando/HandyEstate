import Link from "next/link";
import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { H1, StatusTag, smallBtn, smallInput, table } from "@/components/admin";
import { db, schema as s } from "@/server/db";

const STATUSES = ["pending", "approved", "suspended", "draft"] as const;

export const metadata = { title: "Providers" };

export default async function AdminProviders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q } = await searchParams;
  const filters: SQL[] = [];
  const st = STATUSES.find((x) => x === status);
  if (st) filters.push(eq(s.providers.status, st));
  if (q) filters.push(or(ilike(s.providers.displayName, `%${q}%`), ilike(s.providers.businessName, `%${q}%`), ilike(s.providers.phone, `%${q}%`))!);

  const rows = await db
    .select({
      p: s.providers,
      town: s.towns.name,
      pendingNic: sql<boolean>`exists (select 1 from verifications v where v.provider_id = ${s.providers.id} and v.status = 'pending')`,
    })
    .from(s.providers)
    .leftJoin(s.towns, eq(s.towns.id, s.providers.townId))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(s.providers.createdAt))
    .limit(200);

  return (
    <div>
      <H1>{st === "pending" ? "Waiting for approval" : "Providers"}</H1>
      <form className="mt-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Name or phone" className={smallInput} />
        <select name="status" defaultValue={st ?? ""} className={smallInput}>
          <option value="">All statuses</option>
          {STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <button className={smallBtn}>Filter</button>
      </form>
      <div className="mt-4 overflow-x-auto">
        <table className={table}>
          <thead><tr><th>Name</th><th>Town</th><th>Status</th><th>Verified</th><th>Reviews</th><th>Joined</th></tr></thead>
          <tbody>
            {rows.map(({ p, town, pendingNic }) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/providers/${p.id}`} className="font-semibold text-brand hover:underline">{p.businessName || p.displayName}</Link>
                  {p.isDemo && <span className="ml-2 text-caption text-ink-3">demo</span>}
                  <div className="text-caption text-ink-2">{p.phone}</div>
                </td>
                <td>{town ?? "—"}</td>
                <td><StatusTag status={p.status} /></td>
                <td>{p.isVerified ? "Yes" : pendingNic ? <StatusTag status="pending" /> : "—"}</td>
                <td>{p.reviewCount}</td>
                <td className="whitespace-nowrap">{p.createdAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="text-ink-3">Nothing here.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
