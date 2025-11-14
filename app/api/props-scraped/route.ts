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
export async function GET(request: Request) {
  const url = new URL(request.url);
  const playerName = url.searchParams.get("player");

  if (!playerName) {
    return NextResponse.json(
      { error: "Missing ?player= query parameter" },
      { status: 400 }
    );
  }

  try {
    const encoded = encodeURIComponent(playerName);

    // Action Network player search URL
    const searchURL = `https://www.actionnetwork.com/search?q=${encoded}`;

    const searchHTML = await fetch(searchURL).then((res) => res.text());

    const $search = cheerio.load(searchHTML);

    // Find first player link
    let playerLink: string | null = null;

    $search("a[href*='/player/']").each((_, el) => {
