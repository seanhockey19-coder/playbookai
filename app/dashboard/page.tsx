"use client";

import { useEffect, useState } from "react";
import GameBreakdown from "./components/GameBreakdown";
import GameSelector from "./components/GameSelector";
import PlayerSelector from "./components/PlayerSelector";
import OddsCard from "./components/OddsCard";
import PropsCard from "./components/PropsCard";
import ParlayBuilder from "./components/ParlayBuilder";
import LadderGenerator from "./components/LadderGenerator";

import type { SimplifiedGame } from "../api/nfl/odds/route";

export default function DashboardPage() {
  const [games, setGames] = useState<SimplifiedGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------
  // Load LIVE NFL Odds
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchOdds = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/nfl/odds");
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to load odds");
        }

        const events: SimplifiedGame[] = json.events || [];
        setGames(events);

        if (events.length > 0) {
          setSelectedGameId(events[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchOdds();
  }, []);

  const selectedGame =
    games.find((g) => g.id === selectedGameId) || games[0] || undefined;

  // ---------------------------------------------------------
  // Load LIVE Player Props (from our props API)
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // UI Rendering
  // ---------------------------------------------------------
  return (
    <div style={{ paddingBottom: "4rem" }}>
      <h1
        style={{
          fontSize: "2rem",
          color: "#0ff",
          marginBottom: "1.5rem",
          fontWeight: "bold",
        }}
      >
        Dashboard
      </h1>

      {loading && <p>Loading live odds…</p>}
      {error && <p style={{ color: "salmon" }}>Could not load odds: {error}</p>}

      {/* Game Selector */}
      <GameSelector
        games={games}
        selectedGameId={selectedGameId}
        onChange={setSelectedGameId}
      />

      {/* GRID LAYOUT */}
      
      <GameBreakdown game={selectedGame} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "1.5rem",
          marginTop: "2rem",
        }}
      >
        {/* Team Odds */}
        <OddsCard game={selectedGame} />

        {/* Live Props from Odds API (TEAM props) */}
        <PropsCard
          game={selectedGame}
          propsData={propsData}
          loading={propsLoading}
        />

       {/* Game + Player Props Parlay Builder */}
        <ParlayBuilder game={selectedGame} propsData={propsData} />

        {/* NEW: Player Prop Ladder Generator */}
        <LadderGenerator />

        {/* Player Selector – optional future expansion */}
        <PlayerSelector />
      </div>
    </div>
  );
}
