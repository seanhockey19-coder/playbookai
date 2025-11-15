export const runtime = "edge";

import { NextResponse } from "next/server";

// ------------------------------------------------------------
//  GET /api/props-scraped?player=Patrick Mahomes
// ------------------------------------------------------------
export async function GET(req: Request) {
  const url = new URL(req.url);
  const playerName = url.searchParams.get("player");

  if (!playerName) {
    return NextResponse.json(
      { error: "Missing ?player= query parameter" },
      { status: 400 }
    );
  }

  try {
    // ------------------------------------------------------------
    // 1) Search for player to get Action Network player ID
    // ------------------------------------------------------------
    const searchURL = `https://api.actionnetwork.com/web/v1/search/player?q=${encodeURIComponent(
      playerName
    )}`;

    const searchRes = await fetch(searchURL);
    const searchJson = await searchRes.json();

    const record = searchJson.records?.find(
      (r: any) => r.entity_type === "PLAYER"
    );

    if (!record) {
      return NextResponse.json({
        player: playerName,
        props: [],
        note: "Player not found on Action Network search API",
      });
    }

    const playerId = record.entity_id;

    // ------------------------------------------------------------
    // 2) Fetch player props from Action Network props endpoint
    // ------------------------------------------------------------
    const propsURL = `https://api.actionnetwork.com/web/v1/player/${playerId}/props`;

    const propsRes = await fetch(propsURL);
    const propsJson = await propsRes.json();

    // Format props
    const props = (propsJson || []).map((p: any) => ({
      category: p.category || "Unknown",
      propName: p.label || p.market || "Stat",
      line: p.projection?.toString() || "",
      over: p.over?.toString() || null,
      under: p.under?.toString() || null,
      book: "Action Network API",
      source: "action-network-api",
    }));

    return NextResponse.json({
      player: record.full_name,
      playerId,
      props,
      count: props.length,
    });
  } catch (err) {
    console.error("ACTION NETWORK API ERROR:", err);
    return NextResponse.json(
      {
        player: playerName,
        props: [],
        error: "Failed to fetch props from Action Network API",
      },
      { status: 500 }
    );
  }
}
