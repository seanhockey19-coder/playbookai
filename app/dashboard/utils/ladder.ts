export interface LadderLeg {
  player: string;
  stat: string;
  odds: number;
  line: number | null;
}

export function findLadderLegs(propsData: any[]): LadderLeg[] {
  const ladder: LadderLeg[] = [];

  propsData.forEach((p) => {
    if (typeof p.odds !== "number") return;
    if (p.odds <= -500 && p.odds >= -1000) {
      ladder.push({
        player: p.player,
        stat: p.stat,
        odds: p.odds,
        line: p.line ?? null,
      });
    }
  });

  // safest first (closest to -1000)
  ladder.sort((a, b) => a.odds - b.odds);

  return ladder.slice(0, 5);
}
