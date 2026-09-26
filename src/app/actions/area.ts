"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { coarsen } from "@/lib/geo";
import { AREA_COOKIE, location } from "@/server/services/location";

const YEAR = 60 * 60 * 24 * 365;

async function remember(slug: string) {
  (await cookies()).set(AREA_COOKIE, slug, { path: "/", maxAge: YEAR, sameSite: "lax", httpOnly: false });
}

export async function setArea(slug: string) {
  const towns = await location.listTowns();
  const town = towns.find((t) => t.slug === slug);
  if (!town) return { ok: false as const };
  await remember(town.slug);
  return { ok: true as const, name: town.name };
}

const Pos = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });

/** Receives an already-coarsened position; we only keep the nearest town. */
export async function setAreaFromPosition(input: { lat: number; lng: number }) {
  const parsed = Pos.safeParse(input);
  if (!parsed.success) return { ok: false as const };
  const town = await location.nearestTown(coarsen(parsed.data));
  if (!town) return { ok: false as const };
  await remember(town.slug);
  return { ok: true as const, name: town.name, slug: town.slug };
}
