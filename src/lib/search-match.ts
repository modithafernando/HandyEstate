/**
 * Maps what people type ("tap leaking", "washing machine not spinning") to a service category.
 * Deliberately simple and explainable: phrase hits beat word hits, names beat terms.
 */
export type MatchableCategory = { id: number; slug: string; name: string; searchTerms: string[]; sort: number };

export function normalizeQuery(q: string): string {
  return q
    .toLowerCase()
    .replace(/[’'`]/g, "")
    .replace(/[^\p{L}\p{N}/]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const singular = (w: string) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);

export function scoreCategory(query: string, cat: MatchableCategory): number {
  const q = normalizeQuery(query);
  if (!q) return 0;
  const padded = ` ${q} `;
  const tokens = new Set(q.split(" ").map(singular));
  let score = 0;

  const names = [normalizeQuery(cat.name), cat.slug.replace(/-/g, " ")];
  for (const n of names) if (padded.includes(` ${n} `)) score = Math.max(score, 6);

  for (const raw of cat.searchTerms) {
    const term = normalizeQuery(raw);
    if (!term) continue;
    if (term.includes(" ")) {
      if (padded.includes(` ${term} `)) score += 2 + term.split(" ").length;
    } else if (tokens.has(singular(term))) {
      score += 1;
    }
  }

  // Typing in progress: "plum" → plumber, "electr" → electrician
  if (score === 0) {
    for (const tok of tokens) {
      if (tok.length < 4) continue;
      if (names.some((n) => n.startsWith(tok)) || cat.searchTerms.some((t) => t.startsWith(tok))) {
        score = 0.5;
        break;
      }
    }
  }
  return score;
}

export function matchCategory<C extends MatchableCategory>(query: string, categories: C[]): C | null {
  let best: C | null = null;
  let bestScore = 0;
  for (const c of [...categories].sort((a, b) => a.sort - b.sort)) {
    const sc = scoreCategory(query, c);
    if (sc > bestScore) {
      best = c;
      bestScore = sc;
    }
  }
  return best;
}
