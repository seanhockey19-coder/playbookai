"use client";

import { chooseBestSGP } from "@/lib/sgpEngine";
import { useState } from "react";

interface MarketOption {
  id: string;
  label: string;
  odds: number;
  type: string;
  valueScore: number;
}

interface Props {
  selected: MarketOption[];
}

export default function BestSGPButton({ selected }: Props) {
  const [result, setResult] = useState<string | null>(null);

  const generateSGP = () => {
    if (selected.length < 2) {
      setResult("Select at least 2 picks.");
      return;
    }

    const best = chooseBestSGP(selected);
    setResult(
      `Best SGP Selected: ${best.map((x) => x.label).join(" + ")}`
    );
  };

  return (
    <div style={{ marginTop: 20 }}>
      <button
        onClick={generateSGP}
        style={{
          width: "100%",
          padding: 10,
          background: "#0088ff",
          border: "none",
          borderRadius: 6,
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        AI: Generate Best SGP
      </button>

      {result && (
        <div
          style={{
            marginTop: 10,
            background: "#111",
            padding: 10,
            borderRadius: 6,
            color: "#0ff",
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
}
