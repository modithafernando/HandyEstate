import Link from "next/link";
import { H1, table } from "@/components/admin";
import { getMarketplaceMetrics } from "@/server/queries/admin";

export default async function AdminOverview({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const days = [7, 30, 90].includes(Number((await searchParams).days)) ? Number((await searchParams).days) : 7;
  const m = await getMarketplaceMetrics(days);
  const n = (type: string) => m.ev.get(type)?.n ?? 0;
  const people = (type: string) => m.ev.get(type)?.people ?? 0;
  const approved = m.providers.find((p) => p.status === "approved");
  const contacts = n("CALL_CLICKED") + n("WHATSAPP_CLICKED") + n("PHONE_REVEALED");

  const funnel = [
    ["Searches", n("SEARCH_PERFORMED"), people("SEARCH_PERFORMED")],
    ["Provider impressions", n("PROVIDER_IMPRESSION"), people("PROVIDER_IMPRESSION")],
    ["Profile opens", n("PROVIDER_PROFILE_OPENED"), people("PROVIDER_PROFILE_OPENED")],
    ["Number reveals", n("PHONE_REVEALED"), people("PHONE_REVEALED")],
    ["Call taps", n("CALL_CLICKED"), people("CALL_CLICKED")],
    ["WhatsApp taps", n("WHATSAPP_CLICKED"), people("WHATSAPP_CLICKED")],
    ["Availability changes", n("AVAILABILITY_CHANGED"), people("AVAILABILITY_CHANGED")],
    ["Reviews", n("REVIEW_SUBMITTED"), people("REVIEW_SUBMITTED")],
    ["Provider sign-ups", n("PROVIDER_SIGNED_UP"), people("PROVIDER_SIGNED_UP")],
  ] as const;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <H1>Marketplace</H1>
        <nav className="flex gap-1 text-small font-semibold">
          {[7, 30, 90].map((d) => (
            <Link key={d} href={`/admin?days=${d}`} aria-current={d === days ? "page" : undefined} className="rounded-md px-3 py-1.5 text-ink-2 aria-[current=page]:bg-ink aria-[current=page]:text-white">
              {d} days
            </Link>
          ))}
        </nav>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        {[
          ["Visitors", m.visitors?.visitors ?? 0],
          ["Returning visitors", m.visitors?.returning ?? 0],
          ["Contacts (call/WA/reveal)", contacts],
          ["Contacts per 100 searches", n("SEARCH_PERFORMED") ? Math.round((contacts / n("SEARCH_PERFORMED")) * 100) : "—"],
          ["Live providers", approved?.n ?? 0],
          ["Available today", approved?.available ?? 0],
          ["Pending verifications", m.queue?.verifications ?? 0],
          ["Open reports", m.queue?.reports ?? 0],
        ].map(([label, value]) => (
          <div key={label} className="bg-surface p-4">
            <dt className="text-caption text-ink-2">{label}</dt>
            <dd className="mt-1 text-title font-extrabold">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 text-lead font-bold">Events</h2>
          <table className={table}>
            <thead><tr><th>Event</th><th className="text-right">Count</th><th className="text-right">People</th></tr></thead>
            <tbody>
              {funnel.map(([label, c, p]) => (
                <tr key={label}><td>{label}</td><td className="text-right">{c}</td><td className="text-right">{p}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
        <section>
          <h2 className="mb-2 text-lead font-bold">By day</h2>
          <table className={table}>
            <thead><tr><th>Day</th><th className="text-right">Searches</th><th className="text-right">Contacts</th></tr></thead>
            <tbody>
              {m.perDay.map((d) => (
                <tr key={d.day}><td>{d.day}</td><td className="text-right">{d.searches}</td><td className="text-right">{d.calls}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
        <section>
          <h2 className="mb-2 text-lead font-bold">Searched services</h2>
          <table className={table}>
            <tbody>{m.topCategories.map((c) => <tr key={c.name}><td>{c.name}</td><td className="text-right">{c.searches}</td></tr>)}</tbody>
          </table>
        </section>
        <section>
          <h2 className="mb-2 text-lead font-bold">Searched areas</h2>
          <table className={table}>
            <tbody>{m.topAreas.map((c) => <tr key={c.name}><td>{c.name}</td><td className="text-right">{c.searches}</td></tr>)}</tbody>
          </table>
        </section>
        <section className="lg:col-span-2">
          <h2 className="text-lead font-bold">Searches with no results</h2>
          <p className="mb-2 text-small text-ink-2">Where supply is missing — or search words to add to a category.</p>
          <table className={table}>
            <thead><tr><th>Query</th><th>Area</th><th className="text-right">Times</th></tr></thead>
            <tbody>
              {m.zeroResults.length ? m.zeroResults.map((z, i) => <tr key={i}><td>{z.query}</td><td>{z.area}</td><td className="text-right">{z.n}</td></tr>) : <tr><td colSpan={3} className="text-ink-3">None</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
