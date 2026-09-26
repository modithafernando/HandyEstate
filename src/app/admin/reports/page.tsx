import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { resolveReport } from "@/app/actions/admin";
import { H1, StatusTag, smallBtn, table } from "@/components/admin";
import { db, schema as s } from "@/server/db";

export const metadata = { title: "Reports" };

export default async function AdminReports() {
  const rows = await db
    .select({ r: s.reports, provider: s.providers.displayName, providerId: s.providers.id })
    .from(s.reports)
    .innerJoin(s.providers, eq(s.providers.id, s.reports.providerId))
    .orderBy(desc(s.reports.createdAt))
    .limit(200);
  return (
    <div>
      <H1>Reported profiles</H1>
      <div className="mt-4 overflow-x-auto">
        <table className={table}>
          <thead><tr><th>Date</th><th>Provider</th><th>Reason</th><th>Details</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map(({ r, provider, providerId }) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap">{r.createdAt.toISOString().slice(0, 10)}</td>
                <td><Link className="text-brand hover:underline" href={`/admin/providers/${providerId}`}>{provider}</Link></td>
                <td>{r.reason.replace("_", " ")}</td>
                <td className="max-w-sm">{r.details}</td>
                <td><StatusTag status={r.status} /></td>
                <td>
                  {r.status === "open" && (
                    <form action={resolveReport} className="flex gap-2">
                      <input type="hidden" name="id" value={r.id} />
                      <button name="status" value="resolved" className={smallBtn}>Resolved</button>
                      <button name="status" value="dismissed" className={smallBtn}>Dismiss</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="text-ink-3">No reports.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
