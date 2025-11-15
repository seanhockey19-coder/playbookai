"use client";

import { useState } from "react";
import { SimplifiedGame } from "../../api/nfl/odds/route";
import BestSGPButton from "./BestSGPButton";

interface MarketOption {
  id: string;
  label: string;
  odds: number;
  type: string;
  valueScore: number;
}

interface Props {
  game: SimplifiedGame | undefined;
}

export default function ParlayBuilder({ game }: Props) {
  const [selected, setSelected] = useState<MarketOption[]>([]);

  if (!game) {
    return (
      <div style={{ padding: 20, color: "#ccc" }}>
        <h3>No game selected</h3>
      </div>
    );
  }

  // ⭐ FIXED: Strict typing for newMarkets
  const newMarkets: MarketOption[] = [];

  // -------------------------------
  // Moneyline
  // -------------------------------
  game.h2h?.outcomes?.forEach((o) => {
    newMarkets.push({
      id: `ML-${o.name}`,
      label: `${o.name} ML`,
      odds: o.price,
      type: "moneyline",
      valueScore: Math.random() * 10, // placeholder score
    });
  });

  // -------------------------------
  // Spread
  // -------------------------------
  game.spreads?.outcomes?.forEach((o) => {
    if (o.point == null) return;

    newMarkets.push({
      id: `SPREAD-${o.name}`,
      label: `${o.name} ${o.point > 0 ? "+" : ""}${o.point}`,
      odds: o.price,
      type: "spread",
      valueScore: Math.random() * 10,
    });
  });

  // -------------------------------
  // Totals
  // -------------------------------
  if (game.totals?.outcomes?.length === 2) {
    const [over, under] = game.totals.outcomes;

    if (over.point != null) {
      newMarkets.push({
        id: `TOT-OVER`,
        label: `Over ${over.point}`,
        odds: over.price,
        type: "total",
        valueScore: Math.random() * 10,
      });
    }

    if (under.point != null) {
      newMarkets.push({
        id: `TOT-UNDER`,
        label: `Under ${under.point}`,
        odds: under.price,
        type: "total",
        valueScore: Math.random() * 10,
      });
    }
  }

  // -------------------------------
  // Select/Deselect market option
  // -------------------------------
  const togglePick = (m: MarketOption) => {
    if (selected.some((x) => x.id === m.id)) {
      setSelected(selected.filter((x) => x.id !== m.id));
    } else {
      setSelected([...selected, m]);
    }
  };

  return (
    <div style={{ padding: 20, border: "1px solid #333", borderRadius: 8 }}>
      <h3 style={{ color: "#0ff" }}>{game.homeTeam} vs {game.awayTeam}</h3>

      <div style={{ marginTop: 10 }}>
        {newMarkets.map((m) => (
          <div
            key={m.id}
            onClick={() => togglePick(m)}
            style={{
              padding: "8px 12px",
              marginBottom: 8,
              borderRadius: 6,
              cursor: "pointer",
              background: selected.some((x) => x.id === m.id)
                ? "#006699"
                : "#1a1a1a",
            }}
          >
            <strong>{m.label}</strong> — <span>{m.odds}</span>
          </div>
        ))}
      </div>

      {/* AI Best SGP Button */}
      <BestSGPButton selected={selected} />
    </div>
  );
}
