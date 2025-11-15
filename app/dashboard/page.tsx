"use client";

import { useEffect, useState } from "react";
import AIPicksFeed from "./components/AIPicksFeed";
import GameSelector from "./components/GameSelector";
import OddsCard from "./components/OddsCard";
import PropsCard from "./components/PropsCard";
import PlayerSelector from "./components/PlayerSelector";
import LadderCard from "./components/LadderCard";
import ParlayBuilder from "./components/ParlayBuilder";
import GameBreakdown from "./components/GameBreakdown";
import LadderGenerator from "./components/LadderGenerator";

import type { SimplifiedGame } from "../api/nfl/odds/route";

export default function DashboardPage() {
  // ============================
  // SPORT TOGGLE (NFL / NBA)
  // ============================
  const [sport, setSport] = useState<"nfl" | "nba">("nfl");

  // ============================
  // GAME STATE
  // ============================
  const [games, setGames] = useState<SimplifiedGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================
  // LOAD ODDS (NFL or NBA)
  // ============================
  useEffect(() => {
    const fetchOdds = async () => {
      try {
        setLoading(true);
        setError(null);

        const url =
          sport === "nfl" ? "/api/nfl/odds" : "/api/nba/odds";

        const res = await fetch(url);

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to fetch odds");
        }

        const json = await res.json();
        const events: SimplifiedGame[] = json.events || [];

        setGames(events);
        setSelectedGameId(events[0]?.id || null);
      } catch (err: any) {
        setError(err.message || "Unknown error");
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOdds();
  }, [sport]);

  const selectedGame =
    games.find((g) => g.id === selectedGameId) || games[0];

  // ============================
  // LOAD PLAYER PROPS (IF AVAILABLE)
  // ============================
  const [propsData, setPropsData] = useState<any[]>([]);
  const [propsLoading, setPropsLoading] = useState(false);

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
      } catch (err) {
        setPropsData([]);
      } finally {
        setPropsLoading(false);
      }
    };

    loadProps();
  }, [selectedGameId, selectedGame?.homeTeam, selectedGame?.awayTeam]);

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <div style={{ padding: "2rem", color: "#fff" }}>
      <h1 style={{ fontSize: "2rem", color: "#0ff", marginBottom: "1.5rem" }}>
        Dashboard ({sport.toUpperCase()})
      </h1>

      {/* SPORT TOGGLE */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setSport("nfl")}
          style={{
            padding: "8px 16px",
            background: sport === "nfl" ? "#0ff" : "#222",
            color: sport === "nfl" ? "#000" : "#ccc",
            border: "1px solid #333",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          NFL
        </button>

        <button
          onClick={() => setSport("nba")}
          style={{
            padding: "8px 16px",
            background: sport === "nba" ? "#0ff" : "#222",
            color: sport === "nba" ? "#000" : "#ccc",
            border: "1px solid #333",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          NBA
        </button>
      </div>

      {/* LOADING / ERROR */}
      {loading && <p style={{ color: "#999" }}>Loading live odds…</p>}
      {error && <p style={{ color: "salmon" }}>Error: {error}</p>}

      {/* GAME SELECTOR */}
      <GameSelector
        games={games}
        selectedGameId={selectedGameId}
        onChange={setSelectedGameId}
      />

      {/* ===================== */}
      {/*   AI GAME BREAKDOWN   */}
      {/* ===================== */}
      <GameBreakdown game={selectedGame} />

      {/* ===================== */}
      {/*     GRID LAYOUT       */}
      {/* ===================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "1.5rem",
          marginTop: "1.5rem",
          <AIPicksFeed game={selectedGame} />
        }}
      >
        {/* Odds Card */}
        <OddsCard game={selectedGame} />

        {/* Props (NFL only for now) */}
        <PropsCard
          game={selectedGame}
          propsData={propsData}
          loading={propsLoading}
        />

        {/* Ladder (props-based) */}
        <LadderCard propsData={propsData} />

        {/* SGP / Parlay Builder */}
        <ParlayBuilder game={selectedGame} />

        {/* Optional future tools */}
        <PlayerSelector />

        <LadderGenerator />
      </div>
    </div>
  );
}
