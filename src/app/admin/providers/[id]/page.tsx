import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { decideVerification, revokeVerified, setProviderStatus } from "@/app/actions/admin";
import { H1, StatusTag, smallBtn, smallBtnDanger, smallBtnPrimary, smallInput, table } from "@/components/admin";
import { Avatar } from "@/components/ui/Avatar";
import { mediaUrl } from "@/lib/media";
import { db, schema as s } from "@/server/db";
import { getOwnProvider } from "@/server/queries/pro";
import { getProviderStats } from "@/server/queries/provider";

export default async function AdminProvider({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const own = await getOwnProvider(id);
  if (!own) notFound();
  const { p } = own;
  const [verifs, reports, stats, cats] = await Promise.all([
    db.select().from(s.verifications).where(eq(s.verifications.providerId, id)).orderBy(desc(s.verifications.createdAt)),
    db.select().from(s.reports).where(eq(s.reports.providerId, id)).orderBy(desc(s.reports.createdAt)),
    getProviderStats(id, 30),
    db.select({ name: s.serviceCategories.name }).from(s.providerCategories).innerJoin(s.serviceCategories, eq(s.serviceCategories.id, s.providerCategories.categoryId)).where(eq(s.providerCategories.providerId, id)),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <Avatar src={mediaUrl(p.photoKey)} name={p.displayName} size={88} />
        <div>
          <H1>{p.businessName || p.displayName}</H1>
          <p className="text-small text-ink-2">
            {p.displayName} · {p.phone} · WhatsApp {p.whatsapp ?? "none"} · {own.town?.name ?? "no town"} + {p.serviceRadiusKm} km
          </p>
          <p className="text-small">Status: <StatusTag status={p.status} /> {p.suspendedReason && `— ${p.suspendedReason}`} · Verified: {p.isVerified ? "yes" : "no"} · Setup step {p.setupStep}</p>
          <Link href={`/p/${p.slug}`} className="text-small font-semibold text-brand hover:underline">Public profile →</Link>
        </div>
      </div>

      <section className="flex flex-wrap items-end gap-2">
        {p.status !== "approved" && (
          <form action={setProviderStatus}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="status" value="approved" /><button className={smallBtnPrimary}>Approve / make live</button></form>
        )}
        {p.status !== "suspended" && (
          <form action={setProviderStatus} className="flex gap-2">
            <input type="hidden" name="id" value={p.id} /><input type="hidden" name="status" value="suspended" />
            <input name="reason" placeholder="Reason (internal)" className={smallInput} />
            <button className={smallBtnDanger}>Suspend</button>
          </form>
        )}
        {p.isVerified && (
          <form action={revokeVerified}><input type="hidden" name="id" value={p.id} /><button className={smallBtn}>Remove Verified badge</button></form>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lead font-bold">Profile</h2>
        <p className="text-small"><b>Categories:</b> {cats.map((c) => c.name).join(", ") || "—"}</p>
        <p className="mt-1 max-w-2xl whitespace-pre-line text-small"><b>Bio:</b> {p.bio || "—"}</p>
        <p className="mt-1 text-small"><b>Services:</b> {own.services.map((x) => `${x.name}${x.priceFrom ? ` (Rs ${x.priceFrom}/${x.priceUnit})` : ""}`).join(" · ") || "—"}</p>
        <p className="mt-1 text-small"><b>Work photos:</b> {own.photos.length}</p>
        <p className="mt-1 text-small"><b>Last 30 days (people):</b> {stats.impressions} impressions · {stats.views} opens · {stats.calls} calls/reveals · {stats.whatsapp} WhatsApp</p>
      </section>

      <section>
        <h2 className="mb-2 text-lead font-bold">NIC verification</h2>
        <table className={table}>
          <thead><tr><th>Submitted</th><th>NIC (last 4)</th><th>Status</th><th>Document</th><th>Decision</th></tr></thead>
          <tbody>
            {verifs.map((v) => (
              <tr key={v.id}>
                <td className="whitespace-nowrap">{v.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                <td>…{v.nicLast4 ?? "—"}</td>
                <td><StatusTag status={v.status} />{v.note && <div className="text-caption text-ink-2">{v.note}</div>}</td>
                <td>
                  {v.documentKey ? (
                    <a href={`/admin/documents/${v.id}`} target="_blank" rel="noopener" className="font-semibold text-brand hover:underline">View photo</a>
                  ) : (
                    <span className="text-ink-3">deleted</span>
                  )}
                </td>
                <td>
                  {v.status === "pending" && (
                    <form action={decideVerification} className="flex flex-wrap gap-2">
                      <input type="hidden" name="id" value={v.id} />
                      <input name="note" placeholder="Note (shown to provider if rejected)" className={smallInput + " w-64"} />
                      <button name="decision" value="approved" className={smallBtnPrimary}>Approve</button>
                      <button name="decision" value="rejected" className={smallBtnDanger}>Reject</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {!verifs.length && <tr><td colSpan={5} className="text-ink-3">No submissions.</td></tr>}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-2 text-lead font-bold">Reports</h2>
        <table className={table}>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}><td>{r.createdAt.toISOString().slice(0, 10)}</td><td>{r.reason}</td><td>{r.details}</td><td><StatusTag status={r.status} /></td></tr>
            ))}
            {!reports.length && <tr><td className="text-ink-3">None.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
