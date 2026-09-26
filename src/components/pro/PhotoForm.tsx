"use client";

import { Camera } from "@phosphor-icons/react";
import { useActionState, useState } from "react";
import { savePhoto, type FormState } from "@/app/actions/pro";
import { Avatar } from "@/components/ui/Avatar";
import { useI18n } from "@/lib/i18n/client";
import { shrinkFormImages } from "@/lib/shrink-image";
import { SubmitRow } from "./SubmitRow";
import { useFormError } from "./useFormError";

export function PhotoForm({ current, name, next }: { current: string | null; name: string; next?: string }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<FormState, FormData>(savePhoto, null);
  const [preview, setPreview] = useState<string | null>(null);
  const error = useFormError(state?.error);
  const shown = preview ?? current;
  return (
    <form action={async (fd) => action(await shrinkFormImages(fd, "photo", 1000))}>
      {next && <input type="hidden" name="next" value={next} />}
      <div className="flex items-center gap-5">
        <Avatar src={shown} name={name} size={112} />
        <label className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-md border border-line-strong bg-surface px-4 font-semibold hover:border-ink-3 focus-within:outline-2 focus-within:outline-brand">
          <Camera size={22} aria-hidden />
          {shown ? t("setup.photo.change") : t("setup.photo.choose")}
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-caption font-medium text-danger">
          {error}
        </p>
      )}
      <SubmitRow pending={pending} editing={!!next} skipName="skip" />
    </form>
  );
}
