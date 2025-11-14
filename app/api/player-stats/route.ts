import { NextResponse } from "next/server";

const BASE = "https://api.sportsdata.io/v3/nfl/stats/json";
const API_KEY = process.env.SPORTSDATA_API_KEY;

export async function GET(req: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing SPORTSDATA_API_KEY" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const player = searchParams.get("player");
  const team = searchParams.get("team");

  try {
    // Pull entire player stats list (season)
    const res = await fetch(`${BASE}/PlayerSeasonStats/2024?key=${API_KEY}`, {
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "SportsDataIO API error" },
        { status: 500 }
      );
    }

    const data = await res.json();

    // Optional: filter by name or team
    const filtered = data.filter((p: any) => {
      let match = true;
      if (player) match = p.Name.toLowerCase().includes(player.toLowerCase());
      if (team && match) match = p.Team === team;
      return match;
    });

    return NextResponse.json({ players: filtered });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch player stats" },
      { status: 500 }
    );
  }
}
