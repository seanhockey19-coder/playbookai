"use client";

import { useEffect, useState } from "react";
import BestSGPButton from "./BestSGPButton";
import { generateBestSGP } from "@/lib/sgpEngine";

export default function ParlayBuilder({ game, propsData = [] }) {
  const [markets, setMarkets] = useState([]);
  const [selectedLegs, setSelectedLegs] = useState([]);
  const [aiSGP, setAiSGP] = useState([]);

  // -----------------------------------------
  // Build markets (ML / Spread / Total / Props)
  // -----------------------------------------
  useEffect(() => {
    if (!game) return;

    const newMarkets = [];

    // Convert American odds → implied probability
    const impliedProb = (odds) => {
      if (odds < 0) return Math.abs(odds) / (Math.abs(odds) + 100);
      return 100 / (odds + 100);
    };

    // -------------------------------
    // Moneyline
    // -------------------------------
    game.h2h?.outcomes?.forEach((o) => {
      newMarkets.push({
        id: `ML-${o.name}`,
        label: `${o.name} ML`,
        odds: o.price,
        type: "moneyline",
        valueScore: Math.round(impliedProb(o.price) * 100),
      });
    });

    // -------------------------------
    // Spread
    // -------------------------------
    game.spreads?.outcomes?.forEach((o) => {
      const point = o.point ?? 0;
      const formattedPoint = o.point == null ? "PK" : `${point > 0 ? "+" : ""}${point}`;

      newMarkets.push({
        id: `Spread-${o.name}`,
        label: `${o.name} ${formattedPoint}`,
        odds: o.price,
        type: "spread",
        valueScore: Math.round(impliedProb(o.price) * 100),
      });
    });

    // -------------------------------
    // Totals
    // -------------------------------
    game.totals?.outcomes?.forEach((o) => {
      newMarkets.push({
        id: `Total-${o.name}`,
        label: `${o.name} ${o.point}`,
        odds: o.price,
        type: "total",
        valueScore: Math.round(impliedProb(o.price) * 100),
      });
    });

    // -------------------------------
    // Player Props (if available)
    // -------------------------------
    propsData.forEach((p) => {
      newMarkets.push({
        id: `Prop-${p.category}-${p.propName}-${p.line}`,
        label: `${p.propName} ${p.line}`,
        odds: p.over ?? p.under ?? "-110",
        type: "prop",
        valueScore: 50,
      });
    });

    setMarkets(newMarkets);
  }, [game, propsData]);

  // -----------------------------------------
  // If BEST SGP button is pressed → load AI picks
  // -----------------------------------------
  useEffect(() => {
    if (aiSGP.length === 0) return;

    const legs = aiSGP.map((l) => ({
      id: l.label,
      label: l.label,
      odds: l.odds,
      type: l.category,
    }));

    setSelectedLegs(legs);
  }, [aiSGP]);

  // -----------------------------------------
  // Toggle leg in/out of parlay
  // -----------------------------------------
  const toggleLeg = (leg) => {
    if (selectedLegs.find((l) => l.id === leg.id)) {
      setSelectedLegs(selectedLegs.filter((l) => l.id !== leg.id));
    } else {
      setSelectedLegs([...selectedLegs, leg]);
    }
  };

  // -----------------------------------------
  // Calculate parlay odds
  // -----------------------------------------
  const computeParlayOdds = () => {
    if (selectedLegs.length === 0) return 0;

    let decimal = 1;

    selectedLegs.forEach((leg) => {
      const odds = leg.odds;
      let dec =
        odds < 0 ? 1 + 100 / Math.abs(odds) : 1 + odds / 100;

      decimal *= dec;
    });

    const american =
      decimal >= 2
        ? Math.round((decimal - 1) * 100)
        : Math.round(-100 / (decimal - 1));

    return american;
  };

  const parlayOdds = computeParlayOdds();

  return (
    <div
      style={{
        padding: "1rem",
        background: "#111",
        color: "#0ff",
        borderRadius: "10px",
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>Parlay Builder</h2>

      {/* 🔥 Best SGP Button */}
      <BestSGPButton game={game} onGenerate={setAiSGP} />

      {/* Market List */}
      <div style={{ maxHeight: "350px", overflowY: "auto" }}>
        {markets.map((m) => (
          <div
            key={m.id}
            onClick={() => toggleLeg(m)}
            style={{
              padding: "10px",
              marginBottom: "8px",
              border: "1px solid #0ff",
              borderRadius: "6px",
              cursor: "pointer",
              background: selectedLegs.find((l) => l.id === m.id)
                ? "#0ff"
                : "transparent",
              color: selectedLegs.find((l) => l.id === m.id)
                ? "#000"
                : "#0ff",
            }}
          >
            <strong>{m.label}</strong>
            <br />
            <span style={{ opacity: 0.8 }}>Odds: {m.odds}</span>
            <br />
            <span style={{ opacity: 0.8 }}>Value: {m.valueScore}/100</span>
          </div>
        ))}
      </div>

      {/* Parlay Odds */}
      <div style={{ marginTop: "1rem", fontSize: "1.1rem" }}>
        <strong>Parlay Odds:</strong> {parlayOdds}
      </div>
    </div>
  );
}
