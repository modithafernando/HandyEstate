/** Bayesian average so one 5★ review doesn't outrank thirty 4.8★ reviews. */
export const PRIOR_MEAN = 4.0;
export const PRIOR_WEIGHT = 3;

export function bayesianRating(sum: number, count: number): number {
  return (sum + PRIOR_MEAN * PRIOR_WEIGHT) / (count + PRIOR_WEIGHT);
}

export function averageRating(sum: number, count: number): number | null {
  if (count === 0) return null;
  return Math.round((sum / count) * 10) / 10;
}
