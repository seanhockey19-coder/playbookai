// ============================================================
//  AI SGP Engine — Simplified Value-Based Combo Picker
// ============================================================

// This is the shared type used between ParlayBuilder + SGP Button
export interface MarketOption {
  id: string;
  label: string;
  odds: number;
  type: string;
  valueScore: number;
}

// ------------------------------------------------------------
//  chooseBestSGP — returns the strongest 2–3 leg combo
// ------------------------------------------------------------
export function chooseBestSGP(options: MarketOption[]): MarketOption[] {
  if (!options || options.length === 0) return [];

  // 1) Sort highest → lowest value score
  const sorted = [...options].sort(
    (a, b) => b.valueScore - a.valueScore
  );

  // 2) Always pick the best 2 legs
  const top2 = sorted.slice(0, 2);

  // 3) Sometimes add a 3rd leg if value score is high enough
  const third = sorted[2];
  if (third && third.valueScore >= 6.5) {
    return [...top2, third];
  }

  return top2;
}

// ------------------------------------------------------------
//  (Optional) future advanced model hooks
// ------------------------------------------------------------
export function scoreCombo(combo: MarketOption[]): number {
  // Placeholder AI scoring — expand later
  let score = 0;
  combo.forEach((c) => (score += c.valueScore));
  return score;
}
