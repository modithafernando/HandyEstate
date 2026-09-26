"use client";

import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/client";

/** Setup: big Continue (+ optional Skip). Edit: Save. */
export function SubmitRow({ pending, editing, skipName, saved }: { pending: boolean; editing: boolean; skipName?: string; saved?: boolean }) {
  const { t } = useI18n();
  return (
    <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center">
      <Button type="submit" size="lg" className="w-full sm:w-auto sm:min-w-44" disabled={pending}>
        {editing ? t("proEdit.save") : t("setup.continue")}
      </Button>
      {skipName && !editing && (
        <Button type="submit" name={skipName} value="1" variant="ghost" size="lg" formNoValidate disabled={pending}>
          {t("setup.skip")}
        </Button>
      )}
      {saved && (
        <p role="status" className="text-small font-semibold text-live sm:ml-2">
          {t("proEdit.saved")}
        </p>
      )}
    </div>
  );
}
