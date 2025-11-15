"use client";

import { useEffect, useState } from "react";
import GameSelector from "./components/GameSelector";
import OddsCard from "./components/OddsCard";
import PropsCard from "./components/PropsCard";
import ParlayBuilder from "./components/ParlayBuilder";
import LadderGenerator from "./components/LadderGenerator";
import GameBreakdown from "./components/GameBreakdown";
import AIPicksFeed from "./components/AIPicksFeed";
import type { SimplifiedGame } from "../api/nfl/odds/route";

export default function DashboardPage() {
  // ================================================================
  // STATE
  // ================================================================
  const [sport, setSport] = useState<"nfl" | "nba">("nfl");
  const [games, setGames] = useState<SimplifiedGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [propsData, setPropsData] = useState<any[]>([]);
  const [propsLoading, setPropsLoading] = useState(false);

  const selectedGame =
    games.find((g) => g.id === selectedGameId) ||
    (games.length > 0 ? games[0] : undefined);

  // ================================================================
  // LOAD ODDS (NFL or NBA)
  // ================================================================
  useEffect(() => {
    const loadOdds = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/nfl/odds?sport=${sport === "nba"
          ? "basketball_nba"
          : "americanfootball_nfl"
          }`);

        const json = await res.json();
        setGames(json.events || []);

        if (json.events?.length > 0) {
          setSelectedGameId(json.events[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    loadOdds();
  }, [sport]);

  // ================================================================
  // LOAD PROPS WHEN GAME CHANGES
  // ================================================================
  useEffect(() => {
    const loadProps = async () => {
      if (!selectedGame) return;

      try {
        setPropsLoading(true);
        const q = new URLSearchParams({
          home: selectedGame.homeTeam,
          away: selectedGame.awayTeam,
        }).toString();

        const res = await fetch(`/api/nfl/props?${q}`);
        const json = await res.json();
        setPropsData(json.props || []);
      } finally {
        setPropsLoading(false);
      }
    };

    loadProps();
  }, [selectedGameId]);

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <div style={{ padding: "2rem", color: "#fff" }}>
      {/* SPORT TOGGLE */}
      <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
        <button
          onClick={() => setSport("nfl")}
          style={{
            padding: "6px 16px",
            borderRadius: 8,
            background: sport === "nfl" ? "#0ff" : "#444",
            color: sport === "nfl" ? "#000" : "#ccc",
            cursor: "pointer",
          }}
        >
          NFL
        </button>

        <button
          onClick={() => setSport("nba")}
          style={{
            padding: "6px 16px",
            borderRadius: 8,
            background: sport === "nba" ? "#0ff" : "#444",
            color: sport === "nba" ? "#000" : "#ccc",
            cursor: "pointer",
          }}
        >
          NBA
        </button>
      </div>

      <h1 style={{ fontSize: "2rem", color: "#0ff", marginBottom: "1.5rem" }}>
        Dashboard ({sport.toUpperCase()})
      </h1>

      {/* GAME SELECTOR */}
      <GameSelector
        games={games}
        selectedGameId={selectedGameId}
        onChange={setSelectedGameId}
      />

      {/* GRID LAYOUT */}
      <div
        style={{
          marginTop: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* AI Game Breakdown */}
        <GameBreakdown game={selectedGame} />

        {/* AI Picks Feed */}
        <AIPicksFeed game={selectedGame} />

        {/* Odds */}
        <OddsCard game={selectedGame} />

        {/* Props */}
        <PropsCard game={selectedGame} propsData={propsData} loading={propsLoading} />

        {/* Parlay Builder */}
        <ParlayBuilder game={selectedGame} />

        {/* Ladder Generator */}
        <LadderGenerator />
      </div>
    </div>
  );
}
