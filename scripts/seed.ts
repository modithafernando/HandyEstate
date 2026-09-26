/**
 * Seeds reference data (categories, towns, review tags) and FICTIONAL demo providers.
 *   npm run db:seed          → reference data + demo data (resets demo rows)
 *   npm run db:seed -- --ref → reference data only (safe for production)
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, inArray, sql } from "drizzle-orm";
import postgres from "postgres";
import * as s from "../src/server/db/schema";
import { CATEGORIES, REVIEW_TAGS, TOWNS } from "../src/server/data/reference";
import { CUSTOMER_NAMES, PROVIDERS, REVIEW_COMMENTS } from "./seed-data";
import { slugify } from "../src/lib/slug";
import { endOfTodayColombo } from "../src/lib/time";
import { hashPassword } from "../src/lib/password";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema: s, casing: "snake_case" });

// Deterministic PRNG so the seed looks the same on every machine.
let seed = 20260926;
const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

async function seedReference() {
  for (const c of CATEGORIES) {
    await db
      .insert(s.serviceCategories)
      .values(c)
      .onConflictDoUpdate({ target: s.serviceCategories.slug, set: { name: c.name, icon: c.icon, sort: c.sort, searchTerms: c.searchTerms } });
  }
  for (const t of TOWNS) {
    await db
      .insert(s.towns)
      .values({ ...t, sort: t.sort ?? 100 })
      .onConflictDoUpdate({ target: s.towns.slug, set: { name: t.name, district: t.district, lat: t.lat, lng: t.lng } });
  }
  for (const t of REVIEW_TAGS) {
    await db.insert(s.reviewTags).values(t).onConflictDoUpdate({ target: s.reviewTags.slug, set: { name: t.name, sort: t.sort } });
  }
  console.log(`✓ reference: ${CATEGORIES.length} categories, ${TOWNS.length} towns, ${REVIEW_TAGS.length} tags`);
}

async function seedDemo() {
  // Reset previous demo data (demo users are in the +9470000 block).
  await db.delete(s.users).where(sql`${s.users.phone} like '+9470000%'`);
  await db.delete(s.events).where(sql`true`);

  const cats = await db.select().from(s.serviceCategories);
  const catBySlug = new Map(cats.map((c) => [c.slug, c]));
  const townRows = await db.select().from(s.towns);
  const townBySlug = new Map(townRows.map((t) => [t.slug, t]));
  const tags = await db.select().from(s.reviewTags);

  // Demo sign-ins (development only — shown on the login page outside production)
  await db.insert(s.users).values([
    { phone: "+94700000000", name: "Admin (dev)", isAdmin: true, passwordHash: hashPassword("admin123") },
    { phone: "+94700000001", name: "Amaya", passwordHash: hashPassword("customer123") },
  ]);

  // Customers who leave reviews
  const customers = await db
    .insert(s.users)
    .values(CUSTOMER_NAMES.map((name, i) => ({ phone: `+94700009${String(i).padStart(3, "0")}`, name })))
    .returning();

  const now = new Date();
  const availableUntil = endOfTodayColombo(now);

  for (const [i, p] of PROVIDERS.entries()) {
    const phone = `+947000001${String(i).padStart(2, "0")}`;
    // The first provider (Kasun) is the demo handyman account.
    const [user] = await db.insert(s.users).values({ phone, name: p.name, passwordHash: i === 0 ? hashPassword("handyman123") : null }).returning();
    const town = townBySlug.get(p.town);
    if (!town) throw new Error(`Unknown town ${p.town}`);
    const slugBase = slugify(p.business ?? `${p.name} ${town.name}`);
    const status = p.status ?? "approved";
    const createdAt = new Date(now.getTime() - (20 + Math.floor(rand() * 60)) * 86400_000);

    const [prov] = await db
      .insert(s.providers)
      .values({
        userId: user.id,
        slug: slugBase,
        displayName: p.name,
        businessName: p.business ?? null,
        bio: p.bio,
        phone,
        whatsapp: p.whatsapp ? phone : null,
        townId: town.id,
        serviceRadiusKm: p.radius,
        status,
        setupStep: 99,
        isVerified: !!p.verified,
        availableUntil: p.today ? availableUntil : null,
        lastActiveAt: new Date(now.getTime() - Math.floor(rand() * 72) * 3600_000),
        isDemo: true,
        createdAt,
        approvedAt: status === "approved" ? createdAt : null,
      })
      .returning();

    await db.insert(s.providerCategories).values(
      p.cats.map((slug) => {
        const c = catBySlug.get(slug);
        if (!c) throw new Error(`Unknown category ${slug}`);
        return { providerId: prov.id, categoryId: c.id };
      }),
    );
    await db.insert(s.providerServices).values(
      p.services.map(([name, price, unit], sort) => ({ providerId: prov.id, name, priceFrom: price, priceUnit: unit ?? "job", sort })),
    );

    if (p.verified) {
      await db.insert(s.verifications).values({
        providerId: prov.id,
        status: "approved",
        nicLast4: String(1000 + Math.floor(rand() * 8999)),
        reviewedAt: createdAt,
        note: "Demo data",
      });
    }
    if (status === "pending") {
      await db.insert(s.verifications).values({ providerId: prov.id, status: "pending", nicLast4: "937V" });
    }

    // Reviews
    const n = p.reviews ?? 0;
    const reviewers = [...customers].sort(() => rand() - 0.5).slice(0, n);
    let ratingSum = 0;
    for (const reviewer of reviewers) {
      const q = p.quality ?? 4.5;
      const r = rand();
      const rating = r < q - 4 ? 5 : r < 0.92 ? Math.max(3, Math.round(q)) : Math.max(3, Math.round(q) - 1);
      ratingSum += rating;
      const pool = [...(REVIEW_COMMENTS[p.cats[0]] ?? []), ...REVIEW_COMMENTS.general];
      const comment = rand() < 0.75 ? pick(pool) : null;
      const [rev] = await db
        .insert(s.reviews)
        .values({
          providerId: prov.id,
          userId: reviewer.id,
          rating,
          comment,
          hadContact: true,
          createdAt: new Date(createdAt.getTime() + Math.floor(rand() * (now.getTime() - createdAt.getTime()))),
        })
        .returning();
      const tagCount = Math.floor(rand() * 3) + (rating >= 4 ? 1 : 0);
      const chosen = [...tags].sort(() => rand() - 0.5).slice(0, tagCount);
      if (chosen.length) await db.insert(s.reviewTagLinks).values(chosen.map((t) => ({ reviewId: rev.id, tagId: t.id })));
    }
    await db.update(s.providers).set({ ratingSum, reviewCount: n }).where(eq(s.providers.id, prov.id));
  }

  // A little event history so dashboards aren't empty in development.
  const provs = await db.select({ id: s.providers.id, townId: s.providers.townId }).from(s.providers).where(eq(s.providers.status, "approved"));
  const eventRows: (typeof s.events.$inferInsert)[] = [];
  for (const pr of provs) {
    for (let d = 0; d < 14; d++) {
      const day = new Date(now.getTime() - d * 86400_000);
      const views = Math.floor(rand() * 9);
      for (let v = 0; v < views; v++) {
        const visitorId = `demo-${Math.floor(rand() * 400)}`;
        eventRows.push({ type: "PROVIDER_IMPRESSION", occurredAt: day, providerId: pr.id, townId: pr.townId, visitorId, source: "search" });
        if (rand() < 0.4) eventRows.push({ type: "PROVIDER_PROFILE_OPENED", occurredAt: day, providerId: pr.id, visitorId, source: "search" });
        if (rand() < 0.18) eventRows.push({ type: "CALL_CLICKED", occurredAt: day, providerId: pr.id, visitorId, source: "profile" });
        if (rand() < 0.08) eventRows.push({ type: "WHATSAPP_CLICKED", occurredAt: day, providerId: pr.id, visitorId, source: "profile" });
      }
    }
  }
  // Searches, so funnel ratios in admin look like a real week.
  const activeTowns = townRows.filter((t) => ["matara", "galle", "weligama", "akuressa", "walgama", "hikkaduwa"].includes(t.slug));
  for (let d = 0; d < 14; d++) {
    const day = new Date(now.getTime() - d * 86400_000);
    for (let n = 0; n < 60 + Math.floor(rand() * 40); n++) {
      const c = pick(cats);
      const t = pick(activeTowns);
      const results = rand() < 0.08 ? 0 : 1 + Math.floor(rand() * 6);
      eventRows.push({ type: "SEARCH_PERFORMED", occurredAt: day, visitorId: `demo-${Math.floor(rand() * 400)}`, categoryId: c.id, townId: t.id, source: "category", props: { results } });
    }
  }
  for (let i = 0; i < eventRows.length; i += 1000) await db.insert(s.events).values(eventRows.slice(i, i + 1000));

  // A report for the admin queue
  const someone = await db.select().from(s.providers).where(inArray(s.providers.slug, ["janaka-home-appliances"]));
  if (someone[0]) {
    await db.insert(s.reports).values({ providerId: someone[0].id, reason: "wrong_number", details: "Number rang but someone else answered.", visitorId: "demo-1" });
  }

  console.log(`✓ demo: ${PROVIDERS.length} fictional providers, ${customers.length} customers, ${eventRows.length} events`);
}

async function main() {
  await seedReference();
  if (!process.argv.includes("--ref")) await seedDemo();
  await client.end();
}

main().catch(async (e) => {
  console.error(e);
  await client.end();
  process.exit(1);
});
