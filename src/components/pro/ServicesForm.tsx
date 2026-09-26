"use client";

import { Plus, X } from "@phosphor-icons/react";
import { useActionState, useState } from "react";
import { saveServices, type FormState } from "@/app/actions/pro";
import { Field, inputClass } from "@/components/ui/Field";
import { useI18n } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/en";
import { SubmitRow } from "./SubmitRow";

type Row = { key: number; name: string; price: string; unit: string };
const UNITS = ["job", "visit", "hour", "day", "sqft"] as const;
const MAX = 8;

export function ServicesForm({
  services,
  bio,
  next,
  showBio = true,
}: {
  services: { name: string; priceFrom: number | null; priceUnit: string }[];
  bio?: string | null;
  next?: string;
  showBio?: boolean;
}) {
  const { t } = useI18n();
  const [state, action, pending] = useActionState<FormState, FormData>(saveServices, null);
  const [rows, setRows] = useState<Row[]>(() =>
    (services.length ? services : [{ name: "", priceFrom: null, priceUnit: "job" }]).map((s, i) => ({
      key: i,
      name: s.name,
      price: s.priceFrom?.toString() ?? "",
      unit: s.priceUnit,
    })),
  );
  const update = (key: number, patch: Partial<Row>) => setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const unitLabel = (u: string) => (u === "job" ? "job" : t(`provider.unit.${u}` as MessageKey).replace(/^per /, ""));

  return (
    <form action={action}>
      {next && <input type="hidden" name="next" value={next} />}
      <ul className="border-t border-line">
        {rows.map((r, i) => (
          <li key={r.key} className="border-b border-line py-4">
            <div className="flex items-end gap-2">
              <Field label={t("setup.services.name")} htmlFor={`svc-name-${r.key}`} className="flex-1">
                <input
                  id={`svc-name-${r.key}`}
                  name="svc_name"
                  value={r.name}
                  onChange={(e) => update(r.key, { name: e.target.value })}
                  maxLength={60}
                  placeholder={i === 0 ? "e.g. Leak repair" : undefined}
                  className={inputClass}
                />
              </Field>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRows((x) => x.filter((y) => y.key !== r.key))}
                  className="grid size-12 shrink-0 place-items-center rounded-md text-ink-2 hover:bg-ink/5"
                  aria-label={`${t("photos.remove")} ${r.name}`}
                >
                  <X size={20} aria-hidden />
                </button>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Field label={t("setup.services.price")} htmlFor={`svc-price-${r.key}`} optional={t("form.optional")}>
                <input
                  id={`svc-price-${r.key}`}
                  name="svc_price"
                  inputMode="numeric"
                  value={r.price}
                  onChange={(e) => update(r.key, { price: e.target.value.replace(/[^\d]/g, "") })}
                  className={inputClass}
                />
              </Field>
              <Field label={t("setup.services.unit")} htmlFor={`svc-unit-${r.key}`}>
                <select id={`svc-unit-${r.key}`} name="svc_unit" value={r.unit} onChange={(e) => update(r.key, { unit: e.target.value })} className={inputClass}>
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {unitLabel(u)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </li>
        ))}
      </ul>
      {rows.length < MAX && (
        <button
          type="button"
          onClick={() => setRows((x) => [...x, { key: Date.now(), name: "", price: "", unit: "job" }])}
          className="mt-2 inline-flex h-11 items-center gap-2 font-semibold text-brand"
        >
          <Plus size={18} weight="bold" aria-hidden />
          {t("setup.services.add")}
        </button>
      )}
      {showBio && (
        <Field label={t("setup.services.bio")} htmlFor="bio" hint={t("setup.services.bioHint")} className="mt-7">
          <textarea id="bio" name="bio" rows={4} maxLength={600} defaultValue={bio ?? ""} className={inputClass + " h-auto py-3"} />
        </Field>
      )}
      {state?.error && (
        <p role="alert" className="mt-3 text-small text-danger">
          {t("form.error")}
        </p>
      )}
      <SubmitRow pending={pending} editing={!!next} />
    </form>
  );
}
