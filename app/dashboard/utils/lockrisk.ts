import { combineOdds } from "./odds";

export interface LockRiskLeg {
  label: string;
  odds: number;
  gameId: string;
  safeScore: number; // for future algorithm tuning
}

export interface LadderDay {
  day: number;
  stakeStart: number;
  targetStake: number;
  impliedDecimal: number;
  impliedAmerican: number;
  legs: LockRiskLeg[];
}

// LOCK STACK (safe ML favourites)
export function findLockStack(games: any[]): LockRiskLeg[] {
  const legs: LockRiskLeg[] = [];

  games.forEach((g) => {
    // Moneyline outcomes should be in g.h2h.outcomes
    const home = g.h2h?.outcomes?.find((o: any) => o.name === g.homeTeam);
    const away = g.h2h?.outcomes?.find((o: any) => o.name === g.awayTeam);

    // Heavy favourites only: -350 to -900
    if (home && home.price <= -350 && home.price >= -900) {
      legs.push({
        label: `${g.homeTeam} ML`,
        odds: home.price,
        gameId: g.id,
        safeScore: Math.abs(home.price),
      });
    }

    if (away && away.price <= -350 && away.price >= -900) {
      legs.push({
        label: `${g.awayTeam} ML`,
        odds: away.price,
        gameId: g.id,
        safeScore: Math.abs(away.price),
      });
    }
  });

  // Sort safest first (closest to -900)
  legs.sort((a, b) => b.safeScore - a.safeScore);

  // Top 10 by default
  return legs.slice(0, 10);
}

// RISK BOOST (ML underdogs)
export function findRiskBoost(games: any[]): LockRiskLeg[] {
  const legs: LockRiskLeg[] = [];

  games.forEach((g) => {
    const home = g.h2h?.outcomes?.find((o: any) => o.name === g.homeTeam);
    const away = g.h2h?.outcomes?.find((o: any) => o.name === g.awayTeam);

    // Underdogs: +120 to +500
    if (home && home.price >= 120 && home.price <= 500) {
      legs.push({
        label: `${g.homeTeam} ML`,
        odds: home.price,
        gameId: g.id,
        safeScore: Math.abs(home.price),
      });
    }

    if (away && away.price >= 120 && away.price <= 500) {
      legs.push({
        label: `${g.awayTeam} ML`,
        odds: away.price,
        gameId: g.id,
        safeScore: Math.abs(away.price),
      });
    }
  });

  // Sort biggest odds first
  legs.sort((a, b) => b.odds - a.odds);

  return legs.slice(0, 10);
}

// DAY-X LADDER GENERATOR
export function generateLadderPlan(
  startStake: number,
  days: number,
  lockLegs: LockRiskLeg[]
): LadderDay[] {
  if (!lockLegs.length || days <= 0 || startStake <= 0) return [];

  const plan: LadderDay[] = [];

  // For now: use the same top 2–3 safest legs every day
  const dailyLegs = lockLegs.slice(0, Math.min(3, lockLegs.length));
  const oddsArray = dailyLegs.map((l) => l.odds);
  const combined = combineOdds(oddsArray);

  let currentStake = startStake;

  for (let day = 1; day <= days; day++) {
    const targetStake = currentStake * combined.decimal;

    plan.push({
      day,
      stakeStart: Number(currentStake.toFixed(2)),
      targetStake: Number(targetStake.toFixed(2)),
      impliedDecimal: Number(combined.decimal.toFixed(3)),
      impliedAmerican: combined.american,
      legs: dailyLegs,
    });

    currentStake = targetStake;
  }

  return plan;
}
