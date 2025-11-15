"use client";

import { SimplifiedGame } from "../../api/nfl/odds/route";

interface LineCandidate {
  label: string;
  market: "moneyline" | "spread" | "total";
  odds: number;
  impliedProb: number;
  valueScore: number;
}

interface Props {
  game: SimplifiedGame | undefined;
}

export default function LineValueCard({ game }: Props) {
  if (!game) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 10,
          border: "1px solid #333",
          background: "#0b0b0b",
          color: "#ccc",
        }}
      >
        <h3 style={{ color: "#0ff", marginBottom: 8 }}>AI Value Scan</h3>
        <p>No game selected.</p>
      </div>
    );
  }

  const candidates: LineCandidate[] = [];

  // helper: american → implied probability
  const impliedProb = (odds: number) => {
    if (odds < 0) return Math.abs(odds) / (Math.abs(odds) + 100);
    return 100 / (odds + 100);
  };

  // -------------------------------
  // Moneyline
  // -------------------------------
  game.h2h?.outcomes?.forEach((o) => {
    const prob = impliedProb(o.price);
    // simple “value” heuristic: favor better price for a given market
    const valueScore = (1 - prob) * 100; // dogs get higher scores

    candidates.push({
      label: `${o.name} ML (${o.price})`,
      market: "moneyline",
      odds: o.price,
      impliedProb: prob,
      valueScore,
    });
  });

  // -------------------------------
  // Spreads
  // -------------------------------
  game.spreads?.outcomes?.forEach((o) => {
    if (o.point == null) return;
    const prob = impliedProb(o.price);
    const valueScore = (1 - prob) * 100 - Math.abs(o.point) * 2; // slight penalty for big spreads

    candidates.push({
      label: `${o.name} ${o.point > 0 ? "+" : ""}${o.point} (${o.price})`,
      market: "spread",
      odds: o.price,
      impliedProb: prob,
      valueScore,
    });
  });

  // -------------------------------
  // Totals
  // -------------------------------
  if (game.totals?.outcomes?.length === 2) {
    const [over, under] = game.totals.outcomes;

    if (over.point != null) {
      const prob = impliedProb(over.price);
      const valueScore = (1 - prob) * 100;
      candidates.push({
        label: `Over ${over.point} (${over.price})`,
        market: "total",
        odds: over.price,
        impliedProb: prob,
        valueScore,
      });
    }

    if (under.point != null) {
      const prob = impliedProb(under.price);
      const valueScore = (1 - prob) * 100;
      candidates.push({
        label: `Under ${under.point} (${under.price})`,
        market: "total",
        odds: under.price,
        impliedProb: prob,
        valueScore,
      });
    }
  }

  const ranked = candidates
    .map((c) => ({
      ...c,
      impliedPct: c.impliedProb * 100,
    }))
    .sort((a, b) => b.valueScore - a.valueScore)
    .slice(0, 3);

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 10,
        border: "1px solid #333",
        background: "#0b0b0b",
        color: "#eee",
      }}
    >
      <h3 style={{ color: "#0ff", marginBottom: 10 }}>AI Line Value Scan</h3>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        Highlights the lines that look most favorable based on implied
        probability and price structure. (Early “soft spot” detector.)
      </p>

      {ranked.length === 0 ? (
        <p style={{ color: "#777" }}>No markets available for this game.</p>
      ) : (
        <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
          {ranked.map((c, idx) => (
            <li
              key={idx}
              style={{
                padding: "8px 10px",
                marginBottom: 8,
                borderRadius: 6,
                background: "#111",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  color: "#0af",
                }}
              >
                {c.market.toUpperCase()}
              </div>
              <div style={{ fontWeight: "bold", marginTop: 2 }}>
                {c.label}
              </div>
              <div style={{ fontSize: 12, marginTop: 4, color: "#aaa" }}>
                Implied win chance: {c.impliedPct.toFixed(1)}%
              </div>
              <div
                style={{
                  fontSize: 12,
                  marginTop: 2,
                  color: "#0f0",
                }}
              >
                Value score: {c.valueScore.toFixed(1)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
