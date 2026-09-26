"use client";

import { useActionState } from "react";
import { saveArea, type FormState } from "@/app/actions/pro";
import { Field, inputClass } from "@/components/ui/Field";
import { useI18n } from "@/lib/i18n/client";
import { SubmitRow } from "./SubmitRow";

const RADII = [5, 10, 15, 20, 30];

export function AreaForm({ towns, town, radius, next }: { towns: { slug: string; name: string; district: string }[]; town?: string; radius: number; next?: string }) {
  const { t } = useI18n();
  const [, action, pending] = useActionState<FormState, FormData>(saveArea, null);
  const districts = [...new Set(towns.map((x) => x.district))];
  return (
    <form action={action} className="space-y-7">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label={t("setup.area.town")} htmlFor="town">
        <select id="town" name="town" required defaultValue={town ?? ""} className={inputClass + " appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><path d=%22M4 6l4 4 4-4%22 stroke=%22%2356615c%22 stroke-width=%222%22 fill=%22none%22/></svg>')] bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10"}>
          <option value="" disabled>
            —
          </option>
          {districts.map((d) => (
            <optgroup key={d} label={t("area.district", { district: d })}>
              {towns
                .filter((x) => x.district === d)
                .map((x) => (
                  <option key={x.slug} value={x.slug}>
                    {x.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </Field>
      <fieldset>
        <legend className="text-small font-semibold">{t("setup.area.radius")}</legend>
        <div className="mt-2 grid grid-cols-5 overflow-hidden rounded-md border border-line-strong">
          {RADII.map((r) => (
            <label key={r} className="relative border-l border-line-strong first:border-l-0">
              <input type="radio" name="radius" value={r} defaultChecked={r === radius} className="peer sr-only" />
              <span className="flex h-12 cursor-pointer items-center justify-center bg-surface text-small font-semibold peer-checked:bg-brand peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-4 peer-focus-visible:outline-white">
                {t("setup.area.radiusValue", { km: r })}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <SubmitRow pending={pending} editing={!!next} />
    </form>
  );
}
