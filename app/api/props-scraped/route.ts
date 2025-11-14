export const runtime = "nodejs";

import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const ACTION_BASE = "https://www.actionnetwork.com";

// Utility — clean whitespace
function clean(text?: string) {
  return text?.trim().replace(/\s+/g, " ") || "";
}

// Utility — categorize props
function categorize(propName: string) {
  const name = propName.toLowerCase();

  if (name.includes("pass")) return "Passing";
  if (name.includes("rush")) return "Rushing";
  if (name.includes("rec")) return "Receiving";
  if (name.includes("receptions")) return "Receptions";
  if (name.includes("touchdown") || name.includes("td")) return "Touchdowns";
  if (name.includes("longest")) return "Longest Play";
  if (name.includes("attempts")) return "Attempts";
  if (name.includes("completions")) return "Completions";

  return "Other";
}

// Scrape player search to get Action profile path
async function findPlayerProfile(query: string) {
  const url = `${ACTION_BASE}/api/search?q=${encodeURIComponent(query)}&limit=5`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 300 },
  });

  const json = await res.json();

  const athlete = json?.results?.find((r: any) => r.type === "athlete");

  if (!athlete) return null;

  return {
    name: athlete.name,
    path: athlete.path, // "/nfl/player/patrick-mahomes"
  };
}

// Scrape props from Action Network player page
async function scrapeActionProps(profilePath: string) {
  const res = await fetch(`${ACTION_BASE}${profilePath}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 180 },
  });

  const html = await res.text();
  const $ = cheerio.load(html);

  const props: any[] = [];

  // Action Network uses multiple prop tables
  $(".player-prop-table").each((_, table) => {
    const category = clean($(table).find(".prop-category").text());

    $(table)
      .find("tbody tr")
      .each((__, row) => {
        const cols = $(row).find("td");

        const propName = clean($(cols[0]).text());
        const line = clean($(cols[1]).text());
        const over = clean($(cols[2]).text());
        const under = clean($(cols[3]).text());
        const book = clean($(cols[4]).text());

        props.push({
          category: categorize(propName),
          propName,
          line,
          over,
          under,
          book,
          source: "ActionNetwork",
        });
      });
  });

  return props;
}

// Fallback: ESPN props (no odds, but stable)
async function scrapeESPNProps(playerName: string) {
  const slug = playerName.toLowerCase().replace(/\s+/g, "-");
  const url = `https://www.espn.com/nfl/player/prop/${slug}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    const props = [];

    $("table tbody tr").each((_, row) => {
      const cols = $(row).find("td");

      const stat = clean($(cols[0]).text());
      const line = clean($(cols[1]).text());

      if (stat && line) {
        props.push({
          category: categorize(stat),
          propName: stat,
          line,
          over: null,
          under: null,
          book: "ESPN",
          source: "ESPN",
        });
      }
    });

    return props;
  } catch {
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const playersQuery = searchParams.get("player");
  if (!playersQuery) {
    return NextResponse.json(
      { error: "Usage: /api/props-scraped?player=Kelce" },
      { status: 400 }
    );
  }

  const players = playersQuery.split(",").map((p) => p.trim());

  const results: any[] = [];

  for (const player of players) {
    try {
      const profile = await findPlayerProfile(player);

      if (!profile) {
        results.push({ player, error: "Player not found" });
        continue;
      }

      let props = await scrapeActionProps(profile.path);

      // Fallback to ESPN if Action returned 0 props
      if (props.length === 0) {
        const espnProps = await scrapeESPNProps(profile.name);
        props = espnProps;
      }

      results.push({
        player: profile.name,
        profileUrl: `${ACTION_BASE}${profile.path}`,
        props,
      });
    } catch (err: any) {
      results.push({
        player,
        error: "Scrape failed",
        details: err.message,
      });
    }
  }

  return NextResponse.json({ results });
}
