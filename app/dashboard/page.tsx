"use client";

import { useEffect, useState } from "react";
import GameSelector from "./components/GameSelector";
import PlayerSelector from "./components/PlayerSelector";
import OddsCard from "./components/OddsCard";
import PropsCard from "./components/PropsCard";
import LadderCard from "./components/LadderCard";
import ParlayBuilder from "./components/ParlayBuilder";
import LockRiskCard from "./components/LockRiskCard";
import LadderGeneratorCard from "./components/LadderGeneratorCard";
import TodaysTicketCard from "./components/TodaysTicketCard";
import type { SimplifiedGame } from "../api/nfl/odds/route";

export default function DashboardPage() {
  const [games, setGames] = useState<SimplifiedGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------
  // FETCH LIVE ODDS
  // ---------------------------------------------
  useEffect(() => {
    const fetchOdds = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/nfl/odds");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to fetch odds");
        }

        const json = await res.json();
        const events: SimplifiedGame[] = json.events || [];
        setGames(events);

        // Auto-select first game
        if (events.length > 0) {
          setSelectedGameId(events[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Unknown error loading odds");
      } finally {
        setLoading(false);
      }
    };

    fetchOdds();
  }, []);

  const selectedGame =
    games.find((g) => g.id === selectedGameId) || games[0] || undefined;

  // ---------------------------------------------
  // FETCH PROPS (SAFE EVEN IF EMPTY)
  // ---------------------------------------------
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

  // ---------------------------------------------
  // RENDER PAGE
  // ---------------------------------------------
  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "2rem", color: "#0ff", marginBottom: "1.5rem" }}>
        CoachesPlaybookAI — Dashboard
      </h1>

      {loading && <p>Loading live odds…</p>}
      {error && (
        <p style={{ color: "salmon" }}>
          Could not load odds: {error}
        </p>
      )}

      {/* Game Selector */}
      <GameSelector
        games={games}
        selectedGameId={selectedGameId}
        onChange={setSelectedGameId}
      />

      {/* MAIN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "1.5rem",
          marginTop: "2rem",
        }}
      >
        {/* Odds for selected game */}
        <OddsCard game={selectedGame} />

        {/* Props (optional, still works if empty) */}
        <PropsCard
          game={selectedGame}
          propsData={propsData}
          loading={propsLoading}
        />

        {/* Props-based Ladder Suggestions */}
        <LadderCard propsData={propsData} />

        {/* Multi-game Parlay Builder (WITH VALUE GRADES) */}
        <ParlayBuilder games={games} />

        {/* Lock Stack + Risk Boost + Value Scoring */}
        <LockRiskCard games={games} />

        {/* Ladder Planner (Day X system) */}
        <LadderGeneratorCard games={games} />

        {/* Today's Ticket Generator */}
        <TodaysTicketCard games={games} />

        {/* Player Selector (future expansion) */}
        <PlayerSelector />
      </div>
    </div>
  );
}
