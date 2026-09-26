import { asc } from "drizzle-orm";
import { saveCategory } from "@/app/actions/admin";
import { H1, smallBtnPrimary, smallInput } from "@/components/admin";
import { CategoryIcon, CATEGORY_ICON_KEYS } from "@/components/ui/CategoryIcon";
import { db, schema as s } from "@/server/db";

export const metadata = { title: "Categories" };

type Cat = typeof s.serviceCategories.$inferSelect;

function CategoryForm({ c }: { c?: Cat }) {
  return (
    <form action={saveCategory} className="grid gap-2 border-b border-line py-4 sm:grid-cols-[auto_1fr_8rem_5rem_auto_auto] sm:items-start">
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="grid size-9 place-items-center text-brand">{c ? <CategoryIcon icon={c.icon} size={24} /> : "+"}</div>
      <div className="space-y-2">
        <input name="name" required defaultValue={c?.name} placeholder="Name" className={smallInput + " w-full font-semibold"} />
        <textarea name="searchTerms" defaultValue={c?.searchTerms.join(", ")} placeholder="Search words, comma separated" rows={2} className={smallInput + " h-auto w-full py-1.5"} />
      </div>
      <select name="icon" defaultValue={c?.icon ?? "pipe-wrench"} className={smallInput}>
        {CATEGORY_ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
      </select>
      <input name="sort" type="number" defaultValue={c?.sort ?? 100} aria-label="Sort order" className={smallInput} />
      <label className="flex h-9 items-center gap-1.5 text-small"><input type="checkbox" name="isActive" defaultChecked={c?.isActive ?? true} className="accent-brand" /> Active</label>
      <button className={smallBtnPrimary}>{c ? "Save" : "Add"}</button>
    </form>
  );
}

export default async function AdminCategories() {
  const cats = await db.select().from(s.serviceCategories).orderBy(asc(s.serviceCategories.sort));
  return (
    <div>
      <H1>Categories</H1>
      <p className="mt-1 text-small text-ink-2">Search words decide what a typed query maps to — add words people actually use (check “Searches with no results”).</p>
      <div className="mt-4 border-t border-ink">
        {cats.map((c) => <CategoryForm key={c.id} c={c} />)}
        <CategoryForm />
      </div>
    </div>
  );
}
