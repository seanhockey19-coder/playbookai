import { NextResponse } from "next/server";

interface PropLine {
  player: string;
  team?: string;
  market: string;        // e.g. "Points", "Rebounds", "Passing Yards"
  dkLine: number;
  dkOdds: number;
  fdLine: number;
  fdOdds: number;
  projection: number;    // model projection
  edgePct: number;       // % edge vs best line
  confidence: number;    // 0–1 (we’ll render as %)
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sport = url.searchParams.get("sport") || "nfl";
  const gameId = url.searchParams.get("gameId") || "";

  // TODO: Replace this block with real API-Sports + model logic.
  // For now, we return a few demo props so the UI and wiring are solid.

  let props: PropLine[] = [];

  if (sport === "nba") {
    props = [
      {
        player: "Sample Guard",
        team: "NYK",
        market: "Points",
        dkLine: 24.5,
        dkOdds: -115,
        fdLine: 25.5,
        fdOdds: -110,
        projection: 27.2,
        edgePct: 9.8,
        confidence: 0.84,
      },
      {
        player: "Sample Wing",
        team: "BOS",
        market: "Rebounds",
        dkLine: 7.5,
        dkOdds: -105,
        fdLine: 8.5,
        fdOdds: +100,
        projection: 9.1,
        edgePct: 11.3,
        confidence: 0.79,
      },
      {
        player: "Sample Guard",
        team: "NYK",
        market: "Assists",
        dkLine: 5.5,
        dkOdds: -120,
        fdLine: 6.5,
        fdOdds: +105,
        projection: 7.3,
        edgePct: 10.1,
        confidence: 0.81,
      },
    ];
  } else {
    // NFL demo props
    props = [
      {
        player: "Sample QB",
        team: "KC",
        market: "Passing Yards",
        dkLine: 269.5,
        dkOdds: -115,
        fdLine: 274.5,
        fdOdds: -110,
        projection: 288.4,
        edgePct: 7.9,
        confidence: 0.83,
      },
      {
        player: "Sample WR1",
        team: "MIA",
        market: "Receiving Yards",
        dkLine: 84.5,
        dkOdds: -120,
        fdLine: 87.5,
        fdOdds: -110,
        projection: 96.2,
        edgePct: 9.4,
        confidence: 0.86,
      },
      {
        player: "Sample RB1",
        team: "SF",
        market: "Rushing Yards",
        dkLine: 68.5,
        dkOdds: -110,
        fdLine: 70.5,
        fdOdds: -105,
        projection: 77.0,
        edgePct: 7.1,
        confidence: 0.78,
      },
    ];
  }

  return NextResponse.json({
    sport,
    gameId,
    props,
  });
}
