"use server";

import { and, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema as s } from "@/server/db";
import { getCurrentUser, requireProvider, safeNext } from "@/server/services/auth";
import { hmac } from "@/server/services/crypto";
import { track } from "@/server/services/events";
import { ImageError, saveAvatar, savePrivateDocument, saveWorkPhoto, thumbKey } from "@/server/services/images";
import { location } from "@/server/services/location";
import { storage } from "@/server/services/storage";
import { normalizeNic, nicLast4 } from "@/lib/nic";
import { isLkMobile, normalizeLkPhone } from "@/lib/phone";
import { slugify } from "@/lib/slug";
import { endOfTodayColombo } from "@/lib/time";
import { SETUP_STEPS } from "@/lib/setup";

export type FormState = { error?: string; ok?: boolean } | null;

const MAX_CATEGORIES = 3;
const MAX_SERVICES = 8;
const MAX_PHOTOS = 12;

/** Where to go after saving: next setup step, or back to wherever the form says. */
async function advance(providerId: string, step: number, form: FormData): Promise<never> {
  const next = form.get("next");
  if (typeof next === "string" && next) {
    revalidatePath("/pro", "layout");
    redirect(safeNext(next, "/pro"));
  }
  const [p] = await db.select({ setupStep: s.providers.setupStep }).from(s.providers).where(eq(s.providers.id, providerId));
  if (p && p.setupStep <= step) await db.update(s.providers).set({ setupStep: step + 1 }).where(eq(s.providers.id, providerId));
  redirect(step >= SETUP_STEPS ? "/pro/setup/done" : `/pro/setup/${step + 1}`);
}

async function uniqueSlug(base: string, exceptId?: string) {
  const root = base || "provider";
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? root : `${root}-${Math.random().toString(36).slice(2, 6)}`;
    const clash = await db
      .select({ id: s.providers.id })
      .from(s.providers)
      .where(exceptId ? and(eq(s.providers.slug, candidate), ne(s.providers.id, exceptId)) : eq(s.providers.slug, candidate))
      .limit(1);
    if (!clash.length) return candidate;
  }
  throw new Error("Could not create a unique slug");
}

// ─── Step 1: name ────────────────────────────────────────────────────────────

const NameSchema = z.object({
  displayName: z.string().trim().min(2).max(40),
  businessName: z.string().trim().max(60).optional(),
});

export async function saveName(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/pro/setup");
  const parsed = NameSchema.safeParse({ displayName: form.get("displayName"), businessName: form.get("businessName") || undefined });
  if (!parsed.success) return { error: "name" };
  const { displayName, businessName } = parsed.data;

  let providerId = user.providerId;
  if (!providerId) {
    const slug = await uniqueSlug(slugify(businessName || displayName));
    const [p] = await db
      .insert(s.providers)
      .values({ userId: user.id, slug, displayName, businessName: businessName || null, phone: user.phone, whatsapp: user.phone, setupStep: 1 })
      .returning({ id: s.providers.id });
    providerId = p.id;
    if (!user.name) await db.update(s.users).set({ name: displayName }).where(eq(s.users.id, user.id));
    await track("PROVIDER_SIGNED_UP", { providerId });
  } else {
    await db.update(s.providers).set({ displayName, businessName: businessName || null }).where(eq(s.providers.id, providerId));
  }
  return advance(providerId, 1, form);
}

// ─── Step 2: photo ───────────────────────────────────────────────────────────

export async function savePhoto(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireProvider();
  const file = form.get("photo");
  if (form.get("skip") !== "1") {
    if (!(file instanceof File) || file.size === 0) return { error: "photo" };
    try {
      const key = await saveAvatar(file);
      const [old] = await db.select({ key: s.providers.photoKey }).from(s.providers).where(eq(s.providers.id, user.providerId));
      await db.update(s.providers).set({ photoKey: key }).where(eq(s.providers.id, user.providerId));
      if (old?.key) await storage.delete(old.key);
    } catch (e) {
      if (e instanceof ImageError) return { error: e.code };
      throw e;
    }
  }
  return advance(user.providerId, 2, form);
}

// ─── Step 3: categories ──────────────────────────────────────────────────────

export async function saveCategories(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireProvider();
  const ids = [...new Set(form.getAll("categories").map(Number).filter(Number.isInteger))].slice(0, MAX_CATEGORIES);
  if (!ids.length) return { error: "categories" };
  const valid = await db.select({ id: s.serviceCategories.id }).from(s.serviceCategories).where(and(inArray(s.serviceCategories.id, ids), eq(s.serviceCategories.isActive, true)));
  if (!valid.length) return { error: "categories" };
  await db.transaction(async (tx) => {
    await tx.delete(s.providerCategories).where(eq(s.providerCategories.providerId, user.providerId));
    await tx.insert(s.providerCategories).values(valid.map((c) => ({ providerId: user.providerId, categoryId: c.id })));
  });
  return advance(user.providerId, 3, form);
}

// ─── Step 4: area ────────────────────────────────────────────────────────────

export async function saveArea(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireProvider();
  const towns = await location.listTowns();
  const town = towns.find((t) => t.slug === form.get("town"));
  const radius = Number(form.get("radius"));
  if (!town || ![5, 10, 15, 20, 30].includes(radius)) return { error: "area" };
  await db.update(s.providers).set({ townId: town.id, serviceRadiusKm: radius }).where(eq(s.providers.id, user.providerId));
  return advance(user.providerId, 4, form);
}

// ─── Step 5: jobs, prices, bio ───────────────────────────────────────────────

const Unit = z.enum(["job", "visit", "hour", "day", "sqft"]);

export async function saveServices(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireProvider();
  const names = form.getAll("svc_name").map(String);
  const prices = form.getAll("svc_price").map(String);
  const units = form.getAll("svc_unit").map(String);
  const rows = names
    .map((n, i) => ({
      name: n.trim().slice(0, 60),
      priceFrom: prices[i]?.replace(/[^\d]/g, "") ? Math.min(10_000_000, Number(prices[i].replace(/[^\d]/g, ""))) : null,
      priceUnit: Unit.catch("job").parse(units[i]),
    }))
    .filter((r) => r.name)
    .slice(0, MAX_SERVICES);
  const bio = String(form.get("bio") ?? "").trim().slice(0, 600) || null;

  await db.transaction(async (tx) => {
    await tx.delete(s.providerServices).where(eq(s.providerServices.providerId, user.providerId));
    if (rows.length) await tx.insert(s.providerServices).values(rows.map((r, sort) => ({ ...r, sort, providerId: user.providerId })));
    if (form.has("bio")) await tx.update(s.providers).set({ bio }).where(eq(s.providers.id, user.providerId));
  });

  // Finishing setup sends the profile for review.
  if (!form.get("next")) {
    await db
      .update(s.providers)
      .set({ status: "pending" })
      .where(and(eq(s.providers.id, user.providerId), eq(s.providers.status, "draft")));
  }
  return advance(user.providerId, 5, form);
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export async function saveContact(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireProvider();
  const raw = String(form.get("whatsapp") ?? "").trim();
  let whatsapp: string | null = null;
  if (raw) {
    const n = normalizeLkPhone(raw);
    if (!n || !isLkMobile(n)) return { error: "phone" };
    whatsapp = n;
  }
  await db.update(s.providers).set({ whatsapp }).where(eq(s.providers.id, user.providerId));
  revalidatePath("/pro", "layout");
  return { ok: true };
}

// ─── Availability ────────────────────────────────────────────────────────────

export async function setAvailability(on: boolean) {
  const user = await requireProvider();
  const now = new Date();
  await db
    .update(s.providers)
    .set({ availableUntil: on ? endOfTodayColombo(now) : null, lastActiveAt: now })
    .where(eq(s.providers.id, user.providerId));
  await track("AVAILABILITY_CHANGED", { providerId: user.providerId, props: { on } });
  revalidatePath("/pro");
  return { on };
}

// ─── Work photos ─────────────────────────────────────────────────────────────

export async function uploadPhotos(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireProvider();
  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { error: "photo" };
  const existing = await db.select({ id: s.providerPhotos.id }).from(s.providerPhotos).where(eq(s.providerPhotos.providerId, user.providerId));
  const room = MAX_PHOTOS - existing.length;
  try {
    for (const [i, f] of files.slice(0, Math.max(0, room)).entries()) {
      const saved = await saveWorkPhoto(f);
      await db.insert(s.providerPhotos).values({ providerId: user.providerId, ...saved, sort: existing.length + i });
    }
  } catch (e) {
    if (e instanceof ImageError) return { error: e.code };
    throw e;
  }
  revalidatePath("/pro/photos");
  return { ok: true };
}

export async function deletePhoto(form: FormData) {
  const user = await requireProvider();
  const id = Number(form.get("id"));
  const [ph] = await db
    .delete(s.providerPhotos)
    .where(and(eq(s.providerPhotos.id, id), eq(s.providerPhotos.providerId, user.providerId)))
    .returning();
  if (ph) await Promise.all([storage.delete(ph.key), storage.delete(thumbKey(ph.key))]);
  revalidatePath("/pro/photos");
}

// ─── NIC verification ────────────────────────────────────────────────────────

export async function submitNic(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireProvider();
  const nic = normalizeNic(String(form.get("nic") ?? ""));
  if (!nic) return { error: "nic" };
  const file = form.get("document");
  if (!(file instanceof File) || file.size === 0) return { error: "photo" };

  const nicHmac = hmac("nic", nic);
  const dup = await db
    .select({ id: s.verifications.id })
    .from(s.verifications)
    .where(and(eq(s.verifications.nicHmac, nicHmac), ne(s.verifications.providerId, user.providerId), inArray(s.verifications.status, ["pending", "approved"])))
    .limit(1);
  if (dup.length) return { error: "duplicate" };

  let documentKey: string;
  try {
    documentKey = await savePrivateDocument(file);
  } catch (e) {
    if (e instanceof ImageError) return { error: e.code };
    throw e;
  }
  // Replace any earlier pending submission (and its photo).
  const old = await db
    .delete(s.verifications)
    .where(and(eq(s.verifications.providerId, user.providerId), eq(s.verifications.status, "pending")))
    .returning({ key: s.verifications.documentKey });
  await Promise.all(old.map((o) => (o.key ? storage.delete(o.key) : null)));
  await db.insert(s.verifications).values({ providerId: user.providerId, nicHmac, nicLast4: nicLast4(nic), documentKey });
  revalidatePath("/pro", "layout");
  return { ok: true };
}
