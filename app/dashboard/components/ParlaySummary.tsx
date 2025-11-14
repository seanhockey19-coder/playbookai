"use client";

import { combineOdds } from "../utils/odds";
import { getValueScore } from "../utils/value";

interface ParlaySummaryProps {
  legs: { label: string; odds: number; valueGrade?: string }[];
  onRemove: (index: number) => void;
  onClear: () => void;
}

export default function ParlaySummary({
  legs,
  onRemove,
  onClear,
}: ParlaySummaryProps) {
  if (legs.length === 0)
    return (
      <div style={{ padding: "1rem", background: "#111", borderRadius: "8px" }}>
        <h2 style={{ color: "#0ff" }}>Parlay Summary</h2>
        <p>No legs added yet.</p>
      </div>
    );

  const oddsArr = legs.map((l) => l.odds);
  const combined = combineOdds(oddsArr);

  const impliedProb = 1 / combined.decimal; // parlay-level probability (rough)

  return (
    <div style={{ padding: "1rem", background: "#111", borderRadius: "8px" }}>
      <h2 style={{ color: "#0ff" }}>Parlay Summary</h2>

      <ul>
        {legs.map((l, i) => {
          const vs = getValueScore(l.odds);
          return (
            <li
              key={i}
              style={{
                marginBottom: "0.4rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <div>
                <div>
                  {l.label} ({l.odds > 0 ? "+" : ""}
                  {l.odds})
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: vs.color,
                    opacity: 0.9,
                  }}
                >
                  Value: {vs.grade} · {Math.round(vs.impliedProb * 100)}% implied
                </div>
              </div>

              <button
                onClick={() => onRemove(i)}
                style={{
                  background: "transparent",
                  border: "1px solid #444",
                  padding: "2px 6px",
                  color: "salmon",
                  cursor: "pointer",
                }}
              >
                X
              </button>
            </li>
          );
        })}
      </ul>

      <p style={{ marginTop: "0.75rem" }}>
        Combined Odds:{" "}
        <strong>
          {combined.american > 0 ? "+" : ""}
          {combined.american}
        </strong>{" "}
        ({combined.decimal.toFixed(2)}x) · Implied ~
        {Math.round(impliedProb * 100)}%
      </p>

      <button
        onClick={onClear}
        style={{
          marginTop: "1rem",
          padding: "6px 12px",
          background: "#222",
          border: "1px solid #333",
          color: "#ff6666",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Clear All
      </button>
    </div>
  );
}
