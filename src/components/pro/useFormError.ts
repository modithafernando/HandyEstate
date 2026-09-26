"use client";

import { useI18n } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/en";

const MAP: Record<string, MessageKey> = {
  name: "auth.err.name",
  tooLarge: "form.tooLarge",
  notImage: "form.notImage",
  photo: "verify.err.photo",
  categories: "setup.cats.err",
  phone: "auth.err.phone",
  nic: "verify.err.nic",
  duplicate: "verify.err.duplicate",
};

export function useFormError(code: string | undefined) {
  const { t } = useI18n();
  if (!code) return null;
  return t(MAP[code] ?? "form.error");
}
