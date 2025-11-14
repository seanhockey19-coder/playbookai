import { combineOdds } from "./odds";
import type { LockRiskLeg, LadderDay } from "./lockrisk";

export interface TodayTicket {
  day: number;
  stake: number;
  payout: number;
  combinedAmerican: number;
  combinedDecimal: number;
  legs: LockRiskLeg[];
  slipText: string;
}

export function generateTodayTicket(
  ladderPlan: LadderDay[],
  dayNumber: number,
  legs: LockRiskLeg[]
): TodayTicket | null {
  const day = ladderPlan.find((d) => d.day === dayNumber);
  if (!day || legs.length === 0) return null;

  const oddsArray = legs.map((l) => l.odds);
  const combined = combineOdds(oddsArray);

  const payout = day.stakeStart * combined.decimal;

  const slip = [
    `🔥 TODAY'S LADDER TICKET — DAY ${dayNumber}`,
    ``,
    ...legs.map((l) => `• ${l.label} (${l.odds > 0 ? "+" : ""}${l.odds})`),
    ``,
    `Total Odds: ${combined.american > 0 ? "+" : ""}${combined.american} (${combined.decimal.toFixed(2)}x)`,
    `Wager: $${day.stakeStart.toFixed(2)}`,
    `Payout: $${payout.toFixed(2)}`,
    ``,
    `Good luck 🍀`,
  ].join("\n");

  return {
    day: dayNumber,
    stake: day.stakeStart,
    payout: Number(payout.toFixed(2)),
    combinedAmerican: combined.american,
    combinedDecimal: combined.decimal,
    legs,
    slipText: slip,
  };
}
