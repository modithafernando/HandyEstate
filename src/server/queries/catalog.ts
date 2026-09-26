import "server-only";
import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { db, schema as s } from "../db";

export type Category = typeof s.serviceCategories.$inferSelect;

export const getCategories = cache(async (): Promise<Category[]> =>
  db.select().from(s.serviceCategories).where(eq(s.serviceCategories.isActive, true)).orderBy(asc(s.serviceCategories.sort)),
);

export const getReviewTags = cache(async () => db.select().from(s.reviewTags).orderBy(asc(s.reviewTags.sort)));
