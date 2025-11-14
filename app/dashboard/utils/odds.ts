// Convert American odds to decimal
export function americanToDecimal(odds: number): number {
  if (odds > 0) return 1 + odds / 100;
  return 1 - 100 / odds;
}

// Convert decimal odds back to American
export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2.0) {
    return Math.round((decimal - 1) * 100);
  } else {
    return Math.round(-100 / (decimal - 1));
  }
}

// Combine multiple American odds into one parlay
export function combineOdds(legs: number[]): { decimal: number; american: number } {
  if (legs.length === 0) return { decimal: 1, american: 0 };

  const decimalTotal = legs
    .map(americanToDecimal)
    .reduce((acc, val) => acc * val, 1);

  const american = decimalToAmerican(decimalTotal);

  return { decimal: decimalTotal, american };
}
