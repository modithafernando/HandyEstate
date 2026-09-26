import { redirect } from "next/navigation";
import { db, schema as s } from "@/server/db";
import { requireUser } from "@/server/services/auth";
import { eq } from "drizzle-orm";
import { SETUP_STEPS } from "@/lib/setup";

export default async function SetupIndex() {
  const user = await requireUser("/pro/setup");
  if (!user.providerId) redirect("/pro/setup/1");
  const [p] = await db.select({ step: s.providers.setupStep, status: s.providers.status }).from(s.providers).where(eq(s.providers.id, user.providerId));
  if (p.status !== "draft") redirect("/pro");
  redirect(`/pro/setup/${Math.min(p.step, SETUP_STEPS)}`);
}
