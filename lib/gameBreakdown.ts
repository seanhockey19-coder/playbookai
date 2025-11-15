// Simple AI-ish logic using odds + totals + spreads

export function getGameBreakdown(game) {
  if (!game) return null;

  const spreads = game.spreads?.outcomes || [];
  const totals = game.totals?.outcomes || [];
  const ml = game.h2h?.outcomes || [];

  // Helper: convert American odds → implied probability
  const impliedProb = (odds) => {
    if (odds < 0) return Math.abs(odds) / (Math.abs(odds) + 100);
    return 100 / (odds + 100);
  };

  // -----------------------
  // Win Probability
  // -----------------------
  let homeProb = 0.5;
  let awayProb = 0.5;

  const homeML = ml.find((o) => o.name === game.homeTeam);
  const awayML = ml.find((o) => o.name === game.awayTeam);

  if (homeML && awayML) {
    homeProb = impliedProb(homeML.price);
    awayProb = impliedProb(awayML.price);
  }

  // -----------------------
  // Total Projection
  // -----------------------
  const over = totals.find((o) => o.name.toLowerCase().includes("over"));
  const projectedTotal = over?.point ?? 45;

  // -----------------------
  // Pace of Play (fake AI)
  // -----------------------
  const pace =
    projectedTotal > 47
      ? "Fast"
      : projectedTotal > 42
      ? "Medium"
      : "Slow";

  // -----------------------
  // Suggested Angles
  // -----------------------
  const bestSide =
    homeProb > awayProb ? `${game.homeTeam} ML` : `${game.awayTeam} ML`;

  const totalSide =
    projectedTotal > 46 ? `Over ${projectedTotal}` : `Under ${projectedTotal}`;

  // -----------------------
  // Coach Summary
  // -----------------------
  const summary = `The matchup between ${game.homeTeam} and ${game.awayTeam} projects as a ${pace.toLowerCase()}-paced game with a lean toward ${bestSide}. Total projection suggests ${totalSide}.`;

  return {
    homeProb: Math.round(homeProb * 100),
    awayProb: Math.round(awayProb * 100),
    projectedTotal,
    pace,
    bestSide,
    totalSide,
    summary,
  };
}
