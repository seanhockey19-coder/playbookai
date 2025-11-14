// Simple value scoring system based purely on odds band + implied probability.
// This is a good v1 heuristic and can be upgraded later with real model data.

export interface ValueScore {
  grade: "A+" | "A" | "B" | "C" | "D";
  score: number; // 0–100
  color: string; // hex for UI
  impliedProb: number; // 0–1
  label: string;
  explanation: string;
}

// Convert American odds to implied probability (0–1)
export function americanToImpliedProbability(odds: number): number {
  if (odds === 0 || !Number.isFinite(odds)) return 0.5;
  if (odds > 0) {
    return 100 / (odds + 100);
  } else {
    return -odds / (-odds + 100);
  }
}

// Core scoring heuristic
export function getValueScore(odds: number): ValueScore {
  const prob = americanToImpliedProbability(odds);

  let grade: ValueScore["grade"] = "C";
  let score = 50;
  let color = "#cccccc";
  let explanation = "";

  if (odds < 0) {
    // Favorites
    if (odds <= -900) {
      grade = "A+";
      score = 95;
      color = "#00ff99";
      explanation = "Ultra-safe heavy favorite; great anchor leg.";
    } else if (odds <= -600) {
      grade = "A";
      score = 88;
      color = "#00e676";
      explanation = "Very strong favorite; high hit probability.";
    } else if (odds <= -350) {
      grade = "B";
      score = 78;
      color = "#aeea00";
      explanation = "Solid favorite; good for ladders and anchors.";
    } else if (odds <= -200) {
      grade = "C";
      score = 60;
      color = "#ffeb3b";
      explanation = "Medium favorite; decent but not ultra-safe.";
    } else {
      grade = "D";
      score = 45;
      color = "#ff9800";
      explanation = "Close to a coin flip; use with caution.";
    }
  } else {
    // Underdogs
    if (odds >= 120 && odds <= 250) {
      grade = "A";
      score = 85;
      color = "#00e5ff";
      explanation = "Live underdog in a sweet-spot odds range.";
    } else if (odds > 250 && odds <= 500) {
      grade = "B";
      score = 75;
      color = "#29b6f6";
      explanation = "Spicier underdog with solid payout upside.";
    } else if (odds > 500 && odds <= 900) {
      grade = "C";
      score = 60;
      color = "#ffb74d";
      explanation = "Longshot; fun but volatile.";
    } else if (odds > 900) {
      grade = "D";
      score = 40;
      color = "#ef6c00";
      explanation = "Very unlikely to hit; pure lottery piece.";
    } else {
      grade = "C";
      score = 55;
      color = "#ffc400";
      explanation = "Essentially even-ish; fine as a filler leg.";
    }
  }

  return {
    grade,
    score,
    color,
    impliedProb: prob,
    label: `${grade} (${Math.round(prob * 100)}% implied)`,
    explanation,
  };
}
