"use client";

import { useState, useEffect } from "react";
import type { SimplifiedGame } from "../../api/nfl/odds/route";

// Convert American → Decimal
function americanToDecimal(odds: number): number {
  if (odds >= 100) return 1 + odds / 100;
  return 1 + 100 / Math.abs(odds);
}

// Convert Decimal → American
function decimalToAmerican(decimal: number): number {
  if (decimal <= 1) return 0;
  if (decimal >= 2) return Math.round((decimal - 1) * 100);
  return Math.round(-100 / (decimal - 1));
}

// Implied probability from American odds
function impliedProb(odds: number) {
  if (odds >= 0) return 100 / (odds + 100);
  return Math.abs(odds) / (Math.abs(odds) + 100);
}

// Value Score (0–100 simple model)
function computeValueScore(odds: number) {
  const imp = impliedProb(odds); // 0–1
  return Math.round((imp * 100 + (1 - imp) * 40) / 2);
}

interface Props {
  game?: SimplifiedGame;
}

export default function ParlayBuilder({ game }: Props) {
  const [legs, setLegs] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Reset legs when switching games
    setLegs([]);
  }, [game?.id]);

  if (!game) {
    return (
      <div style={card}>
        <h2>Parlay Builder</h2>
        <p>No game selected.</p>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Build available markets for the selected game
  // ---------------------------------------------------------
  const markets: any[] = [];

  // MONEYLINE
  if (game.h2h?.outcomes) {
    game.h2h.outcomes.forEach((o) => {
      markets.push({
        id: `ML-${o.name}`,
        label: `${o.name} ML`,
        odds: o.price,
        type: "moneyline",
        team: o.name,
      });
    });
  }

  // SPREADS — with PK fallback
  if (game.spreads?.outcomes) {
    game.spreads.outcomes.forEach((o) => {
      const point = o.point ?? 0;

      const formattedPoint =
        o.point == null ? "PK" : `${point > 0 ? "+" : ""}${point}`;

      markets.push({
        id: `Spread-${o.name}`,
        label: `${o.name} ${formattedPoint}`,
        odds: o.price,
        type: "spread",
        team: o.name,
        point,
      });
    });
  }

  // TOTALS
  if (game.totals?.outcomes) {
    const totalPoint = game.totals.outcomes[0]?.point ?? "N/A";

    game.totals.outcomes.forEach((o) => {
      markets.push({
        id: `Total-${o.name}`,
        label: `Total ${o.name} ${totalPoint}`,
        odds: o.price,
        type: "total",
        point: totalPoint,
      });
    });
  }

  // ---------------------------------------------------------
  // Toggle Leg
  // ---------------------------------------------------------
  const toggleLeg = (m: any) => {
    const exists = legs.find((l) => l.id === m.id);
    if (exists) {
      setLegs((prev) => prev.filter((l) => l.id !== m.id));
      return;
    }
    setLegs((prev) => [...prev, m]);
  };

  // ---------------------------------------------------------
  // Combined Parlay Odds
  // ---------------------------------------------------------
  const combinedAmerican = () => {
    if (legs.length === 0) return null;
    const decimals = legs.map((l) => americanToDecimal(l.odds));
    const combo = decimals.reduce((acc, d) => acc * d, 1);
    return decimalToAmerican(combo);
  };

  return (
    <div style={card}>
      <h2>Single-Game Parlay Builder</h2>

      <p style={{ marginBottom: "0.6rem", opacity: 0.8 }}>
        {game.awayTeam} @ {game.homeTeam}
      </p>

      {/* Combined Odds */}
      {legs.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <strong>Combined Odds:</strong>{" "}
          {combinedAmerican() ? combinedAmerican() : "--"}
          <br />
          <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
            Legs: {legs.length}
          </span>
        </div>
      )}

      {/* ALL MARKETS LIST */}
      <div style={{ maxHeight: "260px", overflowY: "auto" }}>
        {markets.map((m) => {
          const selected = legs.some((l) => l.id === m.id);
          const valueScore = computeValueScore(m.odds);

          return (
            <div key={m.id} style={marketBox}>
              <div>
                <strong>{m.label}</strong>
                <br />
                Odds: <span style={{ color: "#0ff" }}>{m.odds}</span>
                <br />
                Value Score: {valueScore}/100
              </div>

              <button
                onClick={() => toggleLeg(m)}
                style={{
                  background: selected ? "#ff0" : "#0ff",
                  color: "#000",
                  border: "none",
                  padding: "0.4rem 0.6rem",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                {selected ? "Remove" : "Add"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// Styles
// ---------------------------------------------------------
const card = {
  background: "#0a0a0a",
  border: "1px solid #0ff",
  borderRadius: "10px",
  padding: "1rem",
  color: "#0ff",
} as const;

const marketBox = {
  border: "1px solid #333",
  padding: "0.6rem",
  marginBottom: "0.6rem",
  borderRadius: "6px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#111",
} as const;
