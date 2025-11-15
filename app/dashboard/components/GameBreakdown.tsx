"use client";

import { useEffect, useState } from "react";
import { SimplifiedGame } from "../../api/nfl/odds/route";

interface Props {
  game: SimplifiedGame | undefined;
}

export default function GameBreakdown({ game }: Props) {
  const [text, setText] = useState("Loading breakdown…");

  useEffect(() => {
    if (!game) {
      setText("No game selected");
      return;
    }

    // Very early placeholder AI breakdown generator
    const breakdown = `
      Matchup: ${game.homeTeam} vs ${game.awayTeam}

      • The moneyline market favors ${
        game.h2h?.outcomes?.[0]?.name || "one side"
      } slightly.
      • Spread suggests the game will be ${
        game.spreads?.outcomes?.[0]?.point || "close"
      }.
      • Totals market projects ${
        game.totals?.outcomes?.[0]?.point
          ? `~${game.totals.outcomes[0].point} points`
          : "a mid-range scoring game"
      }.

      This is an early AI breakdown panel. 
      Full advanced model coming soon.
    `;

    setText(breakdown);
  }, [game]);

  return (
    <div
      style={{
        padding: 20,
        background: "#0b0b0b",
        borderRadius: 10,
        border: "1px solid #333",
        marginBottom: 20,
        color: "#0ff",
        whiteSpace: "pre-line",
      }}
    >
      <h3 style={{ marginBottom: 10 }}>AI Game Breakdown</h3>
      <div style={{ color: "#ccc", fontSize: 14 }}>{text}</div>
    </div>
  );
}
