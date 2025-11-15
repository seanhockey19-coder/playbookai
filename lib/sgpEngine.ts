export function generateBestSGP(game) {
  if (!game) return [];

  const legs = [];

  // -------------------------------
  //  1. Extract markets
  // -------------------------------
  const ml = game.h2h?.outcomes || [];
  const spreads = game.spreads?.outcomes || [];
  const totals = game.totals?.outcomes || [];

  // Helper: convert American odds → implied prob (0-1)
  const impliedProb = (odds: number) => {
    if (odds < 0) return Math.abs(odds) / (Math.abs(odds) + 100);
    return 100 / (odds + 100);
  };

  // Helper: value score (0–100)
  const valueScore = (prob: number, juice: number) => {
    const efficiency = prob - impliedProb(juice);
    return Math.max(0, Math.min(100, Math.round(efficiency * 250 + 50)));
  };

  // -------------------------------
  //  2. Convert to SGP candidates
  // -------------------------------
  const candidates = [];

  ml.forEach((o) => {
    const prob = impliedProb(o.price);
    candidates.push({
      label: `${o.name} ML`,
      odds: o.price,
      prob,
      value: valueScore(prob, o.price),
      category: "moneyline",
    });
  });

  spreads.forEach((o) => {
    const point = o.point ?? 0;
    const pointLabel = o.point == null ? "PK" : `${point > 0 ? "+" : ""}${point}`;
    const prob = impliedProb(o.price);

    candidates.push({
      label: `${o.name} ${pointLabel}`,
      odds: o.price,
      prob,
      value: valueScore(prob, o.price),
      category: "spread",
    });
  });

  totals.forEach((o) => {
    const isOver = o.name.toLowerCase().includes("over");
    const prob = impliedProb(o.price);

    candidates.push({
      label: `${o.name} ${o.point}`,
      odds: o.price,
      prob,
      value: valueScore(prob, o.price),
      category: "total",
      side: isOver ? "over" : "under",
    });
  });

  // -------------------------------
  //  3. AI: Rank by Value + Correlation
  // -------------------------------
  const sorted = candidates
    .map((c) => ({
      ...c,
      score: c.value + c.prob * 100, // hybrid scoring
    }))
    .sort((a, b) => b.score - a.score);

  // -------------------------------
  //  4. Pick the top 2–3 legs that correlate
  // -------------------------------
  const top = sorted.slice(0, 5); // shortlist

  const hasFavorite = top.find((c) => c.category === "moneyline");
  const hasSpread = top.find((c) => c.category === "spread");
  const hasTotal = top.find((c) => c.category === "total");

  const build = [];

  if (hasFavorite) build.push(hasFavorite);
  if (hasSpread && build.length < 2) build.push(hasSpread);
  if (hasTotal && build.length < 3) build.push(hasTotal);

  return build.slice(0, 3); // return top 2–3 legs
}
