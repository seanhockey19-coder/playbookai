"use client";

import { useState, useEffect } from "react";
import type { SimplifiedGame } from "../../api/nfl/odds/route";

// ---------- Helpers ----------

// American → Decimal
function americanToDecimal(odds: number): number {
  if (odds === 0) return 1;
  if (odds >= 100) return 1 + odds / 100;
  return 1 + 100 / Math.abs(odds);
}

// Decimal → American
function decimalToAmerican(decimal: number): number {
  if (decimal <= 1) return 0;
  if (decimal >= 2) return Math.round((decimal - 1) * 100);
  return Math.round(-100 / (decimal - 1));
}

// Implied probability from American odds
function impliedProb(odds: number): number {
  if (odds >= 0) return 100 / (odds + 100);
  return Math.abs(odds) / (Math.abs(odds) + 100);
}

// Simple Value Score (0–100)
function computeValueScore(odds: number): number {
  const p = impliedProb(odds); // 0–1
  // Slight reward for “safer” lines (bigger minus)
  const safetyBoost = odds < 0 ? Math.min(Math.abs(odds) / 1200, 0.25) : 0;
  const score = (p + safetyBoost) * 100;
  return Math.round(Math.min(score, 100));
}

// EV for a single leg (1 unit stake)
function computeLegEV(odds: number, hitProb: number, stake = 1): number {
  const dec = americanToDecimal(odds);
  const winProfit = (dec - 1) * stake;
  const loseLoss = stake;
  return hitProb * winProfit - (1 - hitProb) * loseLoss;
}

function parseOdds(raw: any): number | null {
  if (raw == null) return null;
  const s = String(raw).trim().replace(/\s+/g, "");
  const n = parseInt(s, 10);
  if (Number.isNaN(n)) return null;
  return n;
}

// ---------- Types ----------

interface ParlayBuilderProps {
  game?: SimplifiedGame;
  propsData?: any[]; // player props from parent (both teams)
}

interface MarketLeg {
  id: string;
  label: string;
  odds: number;
  type: "moneyline" | "spread" | "total" | "prop";
  meta?: any;
}

export default function ParlayBuilder({ game, propsData = [] }: ParlayBuilderProps) {
  const [legs, setLegs] = useState<MarketLeg[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Reset when switching game
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

  // ---------- Build Team Markets ----------

  const markets: MarketLeg[] = [];

  // MONEYLINE
  if (game.h2h?.outcomes) {
    game.h2h.outcomes.forEach((o) => {
      if (typeof o.price !== "number") return;
      markets.push({
        id: `ML-${o.name}`,
        label: `${o.name} ML`,
        odds: o.price,
        type: "moneyline",
        meta: { team: o.name },
      });
    });
  }

  // SPREADS (with PK fallback)
  if (game.spreads?.outcomes) {
    game.spreads.outcomes.forEach((o) => {
      if (typeof o.price !== "number") return;
      const point = o.point ?? 0;
      const formattedPoint = o.point == null ? "PK" : `${point > 0 ? "+" : ""}${point}`;

      markets.push({
        id: `Spread-${o.name}-${formattedPoint}`,
        label: `${o.name} ${formattedPoint}`,
        odds: o.price,
        type: "spread",
        meta: { team: o.name, point },
      });
    });
  }

  // TOTALS
  if (game.totals?.outcomes) {
    const totalPoint = game.totals.outcomes[0]?.point ?? "N/A";

    game.totals.outcomes.forEach((o) => {
      if (typeof o.price !== "number") return;
      markets.push({
        id: `Total-${o.name}-${totalPoint}`,
        label: `Total ${o.name} ${totalPoint}`,
        odds: o.price,
        type: "total",
        meta: { point: totalPoint, side: o.name },
      });
    });
  }

  // ---------- Build Player Prop Markets (from propsData) ----------

  // We assume propsData is an array of objects with fields like:
  // player / name, category, propName, line, over, under
  if (propsData && Array.isArray(propsData)) {
    propsData.forEach((p: any, index: number) => {
      const player =
        p.player || p.name || p.playerName || p._player || `Player ${index + 1}`;
      const category = p.category || p.market || "Prop";
      const statName = p.propName || p.stat || p.label || "Stat";
      const line = p.line ?? p.point ?? p.total ?? "";

      const overOdds = parseOdds(p.over ?? p.overOdds);
      const underOdds = parseOdds(p.under ?? p.underOdds);

      if (overOdds !== null) {
        markets.push({
          id: `PROP-${player}-${category}-${statName}-OVER-${line}`,
          label: `${player} ${statName} Over ${line}`,
          odds: overOdds,
          type: "prop",
          meta: { player, category, statName, side: "Over", line },
        });
      }

      if (underOdds !== null) {
        markets.push({
          id: `PROP-${player}-${category}-${statName}-UNDER-${line}`,
          label: `${player} ${statName} Under ${line}`,
          odds: underOdds,
          type: "prop",
          meta: { player, category, statName, side: "Under", line },
        });
      }
    });
  }

  // ---------- Toggle Leg ----------

  const toggleLeg = (m: MarketLeg) => {
    const exists = legs.find((l) => l.id === m.id);
    if (exists) {
      setLegs((prev) => prev.filter((l) => l.id !== m.id));
      return;
    }
    setLegs((prev) => [...prev, m]);
    setError("");
  };

  // ---------- Combined Parlay Metrics ----------

  const combinedMetrics = () => {
    if (legs.length === 0) {
      return {
        combinedAmerican: null,
        combinedDecimal: null,
        combinedHitProb: null,
        evOn10: null,
      };
    }

    const legHitProbs = legs.map((l) => impliedProb(l.odds));
    const legDecimals = legs.map((l) => americanToDecimal(l.odds));

    const comboDec = legDecimals.reduce((acc, d) => acc * d, 1);
    const comboAmer = decimalToAmerican(comboDec);

    // Multiply probabilities (simple independence assumption)
    const comboHitProb = legHitProbs.reduce((acc, p) => acc * p, 1);

    const stake = 10;
    const winProfit = (comboDec - 1) * stake;
    const ev = comboHitProb * winProfit - (1 - comboHitProb) * stake;

    return {
      combinedAmerican: comboAmer,
      combinedDecimal: comboDec,
      combinedHitProb: comboHitProb,
      evOn10: ev,
    };
  };

  const { combinedAmerican, combinedDecimal, combinedHitProb, evOn10 } =
    combinedMetrics();

  // ---------- Best Value Parlay (AI-ish helper) ----------

  const generateBestValueParlay = () => {
    if (markets.length === 0) {
      setError("No markets available for this game.");
      return;
    }

    // Score each market
    const scored = markets.map((m) => {
      const valScore = computeValueScore(m.odds);
      const p = impliedProb(m.odds);
      // Weighted score – value + safety
      const composite = valScore * 0.7 + p * 100 * 0.3;
      return { ...m, _valScore: valScore, _score: composite };
    });

    // Sort descending by composite score (best first)
    scored.sort((a, b) => b._score - a._score);

    // Filter out extreme longshots (optional)
    const filtered = scored.filter((m) => m.odds >= -800 && m.odds <= 400);

    const best = filtered.slice(0, 3); // top 3 legs by value

    if (best.length === 0) {
      setError("Could not find suitable value legs.");
      return;
    }

    setLegs(best);
    setError("");
  };

  // ---------- Render ----------

  return (
    <div style={card}>
      <h2>SGP Builder (Teams + Player Props)</h2>

      <p style={{ marginBottom: "0.4rem", opacity: 0.8 }}>
        {game.awayTeam} @ {game.homeTeam}
      </p>

      {/* Combined Metrics */}
      {legs.length > 0 && (
        <div style={{ marginBottom: "0.8rem", fontSize: "0.9rem" }}>
          <strong>Combined Odds:</strong>{" "}
          {combinedAmerican !== null ? combinedAmerican : "--"}{" "}
          <span style={{ opacity: 0.7 }}>
            ({combinedDecimal ? combinedDecimal.toFixed(2) : "--"}x)
          </span>
          <br />
          <strong>Est. Hit Rate:</strong>{" "}
          {combinedHitProb !== null
            ? `${(combinedHitProb * 100).toFixed(1)}%`
            : "--"}
          <br />
          <strong>EV on $10:</strong>{" "}
          {evOn10 !== null ? `$${evOn10.toFixed(2)}` : "--"}
          <br />
          <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
            Legs: {legs.length}
          </span>
        </div>
      )}

      {/* Best Value Button */}
      <button
        onClick={generateBestValueParlay}
        style={{
          width: "100%",
          padding: "0.5rem",
          background: "#ff0",
          color: "#000",
          borderRadius: "6px",
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "0.8rem",
        }}
      >
        Generate Best Value Parlay
      </button>

      {error && <p style={{ color: "salmon", fontSize: "0.85rem" }}>{error}</p>}

      {/* Markets list */}
      <div style={{ maxHeight: "260px", overflowY: "auto" }}>
        {markets.map((m) => {
          const selected = legs.some((l) => l.id === m.id);
          const valScore = computeValueScore(m.odds);
          const hitProb = impliedProb(m.odds);
          const legEV = computeLegEV(m.odds, hitProb, 1);

          return (
            <div key={m.id} style={marketBox}>
              <div style={{ fontSize: "0.85rem" }}>
                <strong>{m.label}</strong>
                <br />
                Odds: <span style={{ color: "#0ff" }}>{m.odds}</span>
                <br />
                Value Score: {valScore}/100
                <br />
                Hit Rate (imp): {(hitProb * 100).toFixed(1)}%
                <br />
                EV (1u): {legEV >= 0 ? "+" : ""}
                {legEV.toFixed(2)}
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
                  fontSize: "0.8rem",
                }}
              >
                {selected ? "Remove" : "Add"}
              </button>
            </div>
          );
        })}
        {markets.length === 0 && (
          <p style={{ fontSize: "0.85rem" }}>No markets available.</p>
        )}
      </div>
    </div>
  );
}

// ---------- Styles ----------

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
