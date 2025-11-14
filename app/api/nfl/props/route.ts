import { NextResponse } from "next/server";

const ODDS_API_BASE = "https://api.the-odds-api.com/v4";

interface OddsOutcome {
  name: string;
  price: number;
  point?: number | null;
}

interface OddsMarket {
  key: string;
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

export async function GET(request: Request) {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing ODDS_API_KEY env var" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const homeTeam = searchParams.get("home");
  const awayTeam = searchParams.get("away");

  if (!homeTeam || !awayTeam) {
    return NextResponse.json(
      { error: "Missing 'home' or 'away' query params" },
      { status: 400 }
    );
  }

  // Request ALL props markets league-wide, then filter by this matchup
  const markets =
    "player_pass_yds,player_pass_tds,player_rush_yds,player_rush_att,player_rec_yds,player_receptions,player_anytime_td";

  const url = `${ODDS_API_BASE}/sports/americanfootball_nfl/odds?regions=us,us2,eu,uk&markets=${markets}&oddsFormat=american&apiKey=${apiKey}`;

  try {
    const res = await fetch(url, {
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

    // Match by home and away team names (case-insensitive)
    const event = data.find((ev) => {
      const home = ev.home_team.toLowerCase();
      const away = ev.away_team.toLowerCase();
      return (
        home === homeTeam.toLowerCase() && away === awayTeam.toLowerCase()
      );
    });

    if (!event) {
      return NextResponse.json(
        { props: [], source: "no_matching_event" },
        { status: 200 }
      );
    }

    const bookmaker = event.bookmakers?.[0];
    const marketsList = bookmaker?.markets ?? [];

    const props = marketsList.flatMap((market) =>
      market.outcomes.map((o) => ({
        player: o.name,
        stat: market.key,
        line: o.point ?? null,
        odds: o.price,
      }))
    );

    return NextResponse.json({
      props,
      source: "odds_api",
      matchup: {
        home: event.home_team,
        away: event.away_team,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch props" },
      { status: 500 }
    );
  }
}
