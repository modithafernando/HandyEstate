import { describe, expect, it } from "vitest";
import { CATEGORIES } from "@/server/data/reference";
import { matchCategory, normalizeQuery } from "@/lib/search-match";

const cats = CATEGORIES.map((c, i) => ({ ...c, id: i + 1 }));
const m = (q: string) => matchCategory(q, cats)?.slug ?? null;

describe("matchCategory", () => {
  it.each([
    ["plumber", "plumber"],
    ["tap leaking", "plumber"],
    ["Toilet flush not working", "plumber"],
    ["AC repair", "ac-repair"],
    ["ac leaking water", "ac-repair"],
    ["electrician", "electrician"],
    ["trip switch keeps falling", "electrician"],
    ["washing machine repair", "appliance-repair"],
    ["fridge not cooling", "appliance-repair"],
    ["need a baas for wall crack", "mason"],
    ["paint my house", "painter"],
    ["termites", "pest-control"],
    ["gate welding", "welder"],
    ["plum", "plumber"],
    ["electr", "electrician"],
  ])("%s → %s", (q, slug) => expect(m(q)).toBe(slug));

  it("returns null for unrelated text", () => {
    expect(m("kasun")).toBeNull();
    expect(m("")).toBeNull();
  });

  it("normalises punctuation and case", () => {
    expect(normalizeQuery("  Tap   LEAKING!! ")).toBe("tap leaking");
  });
});
