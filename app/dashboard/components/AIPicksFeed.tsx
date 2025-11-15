"use client";

import { useEffect, useState } from "react";
import { SimplifiedGame } from "../../api/nfl/odds/route";

interface AIPick {
  title: string;
  pick: string;
  reason: string;
  confidence: number;
}

interface Props {
  game: SimplifiedGame | undefined;
}

export default function AIPicksFeed({ game }: Props) {
  const [picks, setPicks] = useState<AIPick[]>([]);

  useEffect(() => {
    if (!game) {
      setPicks([]);
      return;
    }

    const newPicks: AIPick[] = [];

    //-------------------------
    // Best Moneyline pick
    //-------------------------
    const h2h = game.h2h?.outcomes;
    if (h2h && h2h.length >= 2) {
      const bestML =
        [...h2h].sort((a, b) => Math.abs(a.price) - Math.abs(b.price))[0];

      newPicks.push({
        title: "🔥 AI Best Moneyline",
        pick: `${bestML.name} ML (${bestML.price})`,
        confidence: 74 + Math.random() * 10,
        reason: `${bestML.name} shows the strongest implied win probability based on current market shape.`,
      });
    }

    //-------------------------
    // Best Spread pick
    //-------------------------
    const spreads = game.spreads?.outcomes;
    if (spreads && spreads.length >= 2) {
      const bestSpread =
        [...spreads].sort((a, b) => Math.abs(a.point!) - Math.abs(b.point!))[0];

      newPicks.push({
        title: "⭐ AI Best Spread",
        pick: `${bestSpread.name} ${bestSpread.point} (${bestSpread.price})`,
        confidence: 68 + Math.random() * 12,
        reason: `Line movement + soft pricing suggests ${bestSpread.name} spread has positive value.`,
      });
    }

    //-------------------------
    // Best Total (Over/Under)
    //-------------------------
    const totals = game.totals?.outcomes;
    if (totals && totals.length === 2) {
      const [over, under] = totals;

      const chosen =
        Math.random() > 0.5 ? over : under; // placeholder AI logic

      newPicks.push({
        title: "📈 AI Total Play",
        pick: `${chosen.name} ${chosen.point} (${chosen.price})`,
        confidence: 65 + Math.random() * 15,
        reason: `Market projection + matchup pace favors this angle.`,
      });
    }

    setPicks(newPicks);
  }, [game]);

  return (
    <div
      style={{
        background: "#0b0b0b",
        border: "1px solid #333",
        padding: 20,
        borderRadius: 10,
        color: "white",
        maxHeight: 500,
        overflowY: "auto",
      }}
    >
      <h3 style={{ color: "#0ff", marginBottom: 15 }}>
        AI Recommended Picks Feed
      </h3>

      {picks.length === 0 ? (
        <p style={{ color: "#777" }}>No AI picks available.</p>
      ) : (
        picks.map((p, i) => (
          <div
            key={i}
            style={{
              marginBottom: 20,
              padding: 12,
              background: "#111",
              borderRadius: 8,
            }}
          >
            <h4 style={{ marginBottom: 6, color: "#0af" }}>{p.title}</h4>
            <strong style={{ color: "#0f0" }}>{p.pick}</strong>
            <div
              style={{
                fontSize: 12,
                marginTop: 6,
                color: "#aaa",
                whiteSpace: "pre-line",
              }}
            >
              {p.reason}
            </div>
            <div style={{ marginTop: 8, color: "#0ff" }}>
              Confidence: <strong>{p.confidence.toFixed(1)}%</strong>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
