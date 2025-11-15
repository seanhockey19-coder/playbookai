export function generateBestSGP(game) {
  if (!game) return [];

  const impliedProb = (odds) => {
    if (odds < 0) return Math.abs(odds) / (Math.abs(odds) + 100);
    return 100 / (odds + 100);
  };

  const valueScore = (prob, juice) => {
    const efficiency = prob - impliedProb(juice);
    return Math.max(0, Math.min(100, Math.round(efficiency * 250 + 50)));
  };

  const ml = game.h2h?.outcomes || [];
  const spreads = game.spreads?.outcomes || [];
  const totals = game.totals?.outcomes || [];

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
    const formatted = o.point == null ? "PK" : `${point > 0 ? "+" : ""}${point}`;
    const prob = impliedProb(o.price);

    candidates.push({
      label: `${o.name} ${formatted}`,
      odds: o.price,
      prob,
      value: valueScore(prob, o.price),
      category: "spread",
    });
  });

  totals.forEach((o) => {
    const prob = impliedProb(o.price);
    candidates.push({
      label: `${o.name} ${o.point}`,
      odds: o.price,
      prob,
      value: valueScore(prob, o.price),
      category: "total",
    });
  });

  const sorted = candidates
    .map((c) => ({ ...c, score: c.value + c.prob * 100 }))
    .sort((a, b) => b.score - a.score);

  const top = sorted.slice(0, 5);

  const hasFavorite = top.find((c) => c.category === "moneyline");
  const hasSpread = top.find((c) => c.category === "spread");
  const hasTotal = top.find((c) => c.category === "total");

  const build = [];
  if (hasFavorite) build.push(hasFavorite);
  if (hasSpread && build.length < 2) build.push(hasSpread);
  if (hasTotal && build.length < 3) build.push(hasTotal);

  return build.slice(0, 3);
}
