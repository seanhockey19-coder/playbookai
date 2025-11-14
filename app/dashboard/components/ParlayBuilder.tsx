"use client";

import { useState } from "react";
import ParlayLegSelector from "./ParlayLegSelector";
import ParlaySummary from "./ParlaySummary";

export default function ParlayBuilder({ games }: { games: any[] }) {
  const [legs, setLegs] = useState<
    { label: string; odds: number; valueGrade?: string }[]
  >([]);

  const addLeg = (leg: { label: string; odds: number; valueGrade?: string }) => {
    if (leg.odds == null) return;
    setLegs((prev) => [...prev, leg]);
  };

  const removeLeg = (index: number) => {
    setLegs((prev) => prev.filter((_, i) => i !== index));
  };

  const clearLegs = () => {
    setLegs([]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <ParlayLegSelector games={games} onAdd={addLeg} />
      <ParlaySummary legs={legs} onRemove={removeLeg} onClear={clearLegs} />
    </div>
  );
}
