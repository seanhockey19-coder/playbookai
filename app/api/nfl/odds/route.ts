import { NextResponse } from "next/server";

const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

interface OddsOutcome {
  name: string;
  price: number;
  point?: number | null;
}

interface OddsMarket {
  key: string; // "h2h" | "spreads" | "totals" etc.
  outcomes: OddsOutcome[];
}

interface OddsBookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: OddsMarket[];
}

interface OddsEventFromApi {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsBookmaker[];
}

export interface SimplifiedGame {
  id: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  h2h?: OddsMarket;
  spreads?: OddsMarket;
  totals?: OddsMarket;
}

export async function GET(request: Request) {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing ODDS_API_KEY env var" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);

  // Allow overriding sport via ?sport=basketball_nba later
  const sport = searchParams.get("sport") || "americanfootball_nfl";

  const url = `${ODDS_API_BASE}/sports/${sport}/odds?regions=us&markets=h2h,spreads,totals&oddsFormat=american&dateFormat=iso&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, {
      // Small cache so you're not spamming requests every render
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Upstream odds API error", info: text },
        { status: 500 }
      );
    }

    const data: OddsEventFromApi[] = await res.json();

    const events: SimplifiedGame[] = data.map((ev) => {
      const firstBook = ev.bookmakers?.[0];
      const marketsByKey: Record<string, OddsMarket> = {};

      firstBook?.markets?.forEach((m) => {
        marketsByKey[m.key] = m;
      });

      return {
        id: ev.id,
        commenceTime: ev.commence_time,
        homeTeam: ev.home_team,
        awayTeam: ev.away_team,
        h2h: marketsByKey["h2h"],
        spreads: marketsByKey["spreads"],
        totals: marketsByKey["totals"],
      };
    });

    return NextResponse.json({ events });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch odds" },
      { status: 500 }
    );
  }
}
