// ============================================================
//  Action Network Player Props Scraper
//  Fully Fixed + Safe + Typed + Ready for Production
// ============================================================

export const runtime = "nodejs"; // Cheerio requires NodeJS runtime

import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// ------------------------------------------------------------
//  Types
// ------------------------------------------------------------
interface ScrapedProp {
  category: string;
  propName: string;
  line: string;
  over: string | null;
  under: string | null;
  book: string;
  source: string;
}

interface ScrapedPlayerProps {
  player: string;
  props: ScrapedProp[];
}

// ------------------------------------------------------------
//  GET /api/props-scraped?player=Mahomes
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
    const encoded = encodeURIComponent(playerName);

    // Search page URL
    const searchURL = `https://www.actionnetwork.com/search?q=${encoded}`;

    const searchHTML = await fetch(searchURL).then((res) => res.text());
    const $search = cheerio.load(searchHTML);

    // ------------------------------------------------------------
    //  Find the player's page link
    // ------------------------------------------------------------
    let playerLink: string | null = null;

    $search("a[href*='/player/']").each((_, el) => {
      const href = $search(el).attr("href") || "";
      if (href.includes("/player/")) {
        playerLink = "https://www.actionnetwork.com" + href;
        return false; // break
      }
    });

    if (!playerLink) {
      return NextResponse.json({
        player: playerName,
        props: [],
        note: "Player not found on Action Network",
      });
    }

    // ------------------------------------------------------------
    //  Fetch player's actual props page
    // ------------------------------------------------------------
    const playerHTML = await fetch(playerLink).then((res) => res.text());
    const $ = cheerio.load(playerHTML);

    const props: ScrapedProp[] = [];

    // ------------------------------------------------------------
    //  Scrape all props tables
    // ------------------------------------------------------------
    $("table, .props-table").each((_, table) => {
      const category =
        $(table).find("thead th").first().text().trim() || "Unknown";

      $(table)
        .find("tbody tr")
        .each((_, row) => {
          const cells = $(row).find("td");

          if (cells.length < 2) return;

          const propName = $(cells[0]).text().trim();
          const line = $(cells[1]).text().trim();

          const oddsCell = $(cells[2]).text().trim() || "";

          const over = oddsCell.includes("Over")
            ? oddsCell.replace("Over", "").trim()
            : null;

          const under = oddsCell.includes("Under")
            ? oddsCell.replace("Under", "").trim()
            : null;

          if (propName && line) {
            props.push({
              category,
              propName,
              line,
              over,
              under,
              book: "Action Network (scraped)",
              source: "action-network",
            });
          }
        });
    });

    // ------------------------------------------------------------
    //  Return final JSON
    // ------------------------------------------------------------
    return NextResponse.json({
      player: playerName,
      props,
      scrapedFrom: playerLink,
      count: props.length,
    });
  } catch (err) {
    console.error("SCRAPER ERROR:", err);
    return NextResponse.json(
      {
        player: playerName,
        props: [],
        error: "Scraper failed — Action Network layout likely changed.",
        fallback: true,
      },
      { status: 500 }
    );
  }
}
