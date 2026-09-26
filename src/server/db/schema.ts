import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Translations for user-facing names. English lives in the `name` column. */
export type LocalizedNames = { si?: string; ta?: string };

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// ─── Accounts ────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull().unique(), // E.164, e.g. +94771234567
  name: text("name"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: createdAt(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
});

export const otpChallenges = pgTable(
  "otp_challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    phone: text("phone").notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attempts: smallint("attempts").notNull().default(0),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    ip: text("ip"),
    createdAt: createdAt(),
  },
  (t) => [index("otp_phone_created_idx").on(t.phone, t.createdAt), index("otp_ip_created_idx").on(t.ip, t.createdAt)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(), // sha256(token)
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

// ─── Reference data ──────────────────────────────────────────────────────────

export const towns = pgTable("towns", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  names: jsonb("names").$type<LocalizedNames>().notNull().default({}),
  district: text("district").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sort: integer("sort").notNull().default(100),
});

export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(), // "Plumber"
  names: jsonb("names").$type<LocalizedNames>().notNull().default({}),
  icon: text("icon").notNull().default("wrench"),
  /** Words people actually type: "tap", "leak", "pipe", "toilet"… */
  searchTerms: text("search_terms").array().notNull().default(sql`'{}'::text[]`),
  sort: integer("sort").notNull().default(100),
  isActive: boolean("is_active").notNull().default(true),
});

// ─── Providers ───────────────────────────────────────────────────────────────

export const providerStatus = pgEnum("provider_status", ["draft", "pending", "approved", "suspended"]);
export const priceUnit = pgEnum("price_unit", ["job", "visit", "hour", "day", "sqft"]);

export const providers = pgTable(
  "providers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    displayName: text("display_name").notNull(), // person's name: "Kasun"
    businessName: text("business_name"), // optional: "Kasun Electrical"
    bio: text("bio"),
    phone: text("phone").notNull(), // public contact number (E.164)
    whatsapp: text("whatsapp"), // null = no WhatsApp button
    photoKey: text("photo_key"),
    townId: integer("town_id").references(() => towns.id),
    serviceRadiusKm: smallint("service_radius_km").notNull().default(10),
    status: providerStatus("status").notNull().default("draft"),
    setupStep: smallint("setup_step").notNull().default(1),
    isVerified: boolean("is_verified").notNull().default(false),
    /** "Taking work today" — set to end of day (Asia/Colombo) when switched on. */
    availableUntil: timestamp("available_until", { withTimezone: true }),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
    ratingSum: integer("rating_sum").notNull().default(0),
    reviewCount: integer("review_count").notNull().default(0),
    isDemo: boolean("is_demo").notNull().default(false),
    suspendedReason: text("suspended_reason"),
    createdAt: createdAt(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
  },
  (t) => [index("providers_status_town_idx").on(t.status, t.townId)],
);

export const providerCategories = pgTable(
  "provider_categories",
  {
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => serviceCategories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.providerId, t.categoryId] }), index("provider_categories_cat_idx").on(t.categoryId)],
);

export const providerServices = pgTable(
  "provider_services",
  {
    id: serial("id").primaryKey(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // "Trip switch repair"
    priceFrom: integer("price_from"), // LKR, optional
    priceUnit: priceUnit("price_unit").notNull().default("job"),
    sort: integer("sort").notNull().default(0),
  },
  (t) => [index("provider_services_provider_idx").on(t.providerId)],
);

export const providerPhotos = pgTable(
  "provider_photos",
  {
    id: serial("id").primaryKey(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    sort: integer("sort").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("provider_photos_provider_idx").on(t.providerId)],
);

// ─── Verification ────────────────────────────────────────────────────────────

export const verificationKind = pgEnum("verification_kind", ["nic"]);
export const verificationStatus = pgEnum("verification_status", ["pending", "approved", "rejected"]);

export const verifications = pgTable(
  "verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    kind: verificationKind("kind").notNull().default("nic"),
    status: verificationStatus("status").notNull().default("pending"),
    nicHmac: text("nic_hmac"), // for duplicate detection only
    nicLast4: text("nic_last4"),
    documentKey: text("document_key"), // private storage; removed after decision
    reviewerId: uuid("reviewer_id").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    note: text("note"),
    createdAt: createdAt(),
  },
  (t) => [index("verifications_status_idx").on(t.status, t.createdAt), index("verifications_nic_idx").on(t.nicHmac)],
);

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const reviewStatus = pgEnum("review_status", ["published", "hidden"]);

export const reviewTags = pgTable("review_tags", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  names: jsonb("names").$type<LocalizedNames>().notNull().default({}),
  sort: integer("sort").notNull().default(100),
});

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: smallint("rating").notNull(),
    comment: text("comment"),
    status: reviewStatus("status").notNull().default("published"),
    /** Whether this user tapped Call/WhatsApp for this provider before reviewing. */
    hadContact: boolean("had_contact").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("reviews_provider_user_uq").on(t.providerId, t.userId),
    index("reviews_provider_created_idx").on(t.providerId, t.createdAt),
    check("reviews_rating_range", sql`${t.rating} between 1 and 5`),
  ],
);

export const reviewTagLinks = pgTable(
  "review_tag_links",
  {
    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => reviewTags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.reviewId, t.tagId] })],
);

// ─── Reports ─────────────────────────────────────────────────────────────────

export const reportReason = pgEnum("report_reason", ["wrong_number", "not_real", "bad_behaviour", "other"]);
export const reportStatus = pgEnum("report_status", ["open", "resolved", "dismissed"]);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    visitorId: text("visitor_id"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    reason: reportReason("reason").notNull(),
    details: text("details"),
    status: reportStatus("status").notNull().default("open"),
    createdAt: createdAt(),
    resolvedBy: uuid("resolved_by").references(() => users.id),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (t) => [index("reports_status_idx").on(t.status, t.createdAt)],
);

// ─── Events (analytics) ──────────────────────────────────────────────────────

export const EVENT_TYPES = [
  "SEARCH_PERFORMED",
  "PROVIDER_IMPRESSION",
  "PROVIDER_PROFILE_OPENED",
  "PHONE_REVEALED",
  "CALL_CLICKED",
  "WHATSAPP_CLICKED",
  "AVAILABILITY_CHANGED",
  "REVIEW_SUBMITTED",
  "PROVIDER_SIGNED_UP",
  "REPORT_SUBMITTED",
  "ADMIN_ACTION",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const events = pgTable(
  "events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    type: text("type").$type<EventType>().notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    visitorId: text("visitor_id"),
    userId: uuid("user_id"),
    providerId: uuid("provider_id"),
    categoryId: integer("category_id"),
    townId: integer("town_id"),
    query: text("query"),
    source: text("source"),
    props: jsonb("props").$type<Record<string, unknown>>(),
  },
  (t) => [
    index("events_type_time_idx").on(t.type, t.occurredAt),
    index("events_provider_type_time_idx").on(t.providerId, t.type, t.occurredAt),
    index("events_visitor_time_idx").on(t.visitorId, t.occurredAt),
  ],
);
