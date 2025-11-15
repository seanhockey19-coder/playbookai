import { NextResponse } from "next/server";

const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing ODDS_API_KEY env var" },
      { status: 500 }
    );
  }

  const url = `${ODDS_API_BASE}/sports/basketball_nba/odds?regions=us&markets=h2h,spreads,totals&oddsFormat=american&dateFormat=iso&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    const json = await res.json();

    const events = json.map((ev: any) => {
      const firstBook = ev.bookmakers?.[0];
      const markets: any = {};

      firstBook?.markets?.forEach((m: any) => {
        markets[m.key] = m;
      });

      return {
        id: ev.id,
        commenceTime: ev.commence_time,
        homeTeam: ev.home_team,
        awayTeam: ev.away_team,
        h2h: markets["h2h"],
        spreads: markets["spreads"],
        totals: markets["totals"],
      };
    });

    return NextResponse.json({ events });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch NBA odds", details: String(err) },
      { status: 500 }
    );
  }
}
