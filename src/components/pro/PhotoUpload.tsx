"use client";

import { ImageSquare } from "@phosphor-icons/react";
import { useActionState, useRef } from "react";
import { uploadPhotos, type FormState } from "@/app/actions/pro";
import { useI18n } from "@/lib/i18n/client";
import { shrinkFormImages } from "@/lib/shrink-image";
import { useFormError } from "./useFormError";

/** Picking files submits straight away — one less button. */
export function PhotoUpload({ full }: { full: boolean }) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<FormState, FormData>(uploadPhotos, null);
  const form = useRef<HTMLFormElement>(null);
  const error = useFormError(state?.error);
  return (
    <form ref={form} action={async (fd) => action(await shrinkFormImages(fd, "photos", 2000))}>
      <label
        aria-disabled={full || pending}
        className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-md bg-brand px-5 font-semibold text-white hover:bg-brand-strong focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand aria-disabled:pointer-events-none aria-disabled:opacity-50"
      >
        <ImageSquare size={22} aria-hidden />
        {pending ? t("photos.uploading") : t("photos.add")}
        <input type="file" name="photos" accept="image/*" multiple className="sr-only" disabled={full || pending} onChange={() => form.current?.requestSubmit()} />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-caption font-medium text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
