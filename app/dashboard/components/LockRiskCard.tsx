"use client";

import { findLockStack, findRiskBoost } from "../utils/lockrisk";
import { getValueScore } from "../utils/value";

export default function LockRiskCard({ games }: { games: any[] }) {
  const lockStack = findLockStack(games);
  const riskBoost = findRiskBoost(games);

  return (
    <div style={{ padding: "1rem", background: "#111", borderRadius: "8px" }}>
      <h2 style={{ color: "#0ff" }}>Lock Stack (Safe Picks)</h2>

      {lockStack.length === 0 && <p>No safe picks available.</p>}

      <ul>
        {lockStack.map((l, i) => {
          const vs = getValueScore(l.odds);
          return (
            <li key={i} style={{ marginBottom: "0.5rem" }}>
              <strong>{l.label}</strong> ({l.odds > 0 ? "+" : ""}
              {l.odds}){" "}
              <span
                style={{
                  marginLeft: 6,
                  fontSize: "0.8rem",
                  color: vs.color,
                }}
              >
                {vs.grade} · {Math.round(vs.impliedProb * 100)}%
              </span>
            </li>
          );
        })}
      </ul>

      <hr style={{ margin: "1rem 0", opacity: 0.3 }} />

      <h2 style={{ color: "#ff0" }}>Risk Boost (Underdogs)</h2>

      {riskBoost.length === 0 && <p>No underdogs available.</p>}

      <ul>
        {riskBoost.map((l, i) => {
          const vs = getValueScore(l.odds);
          return (
            <li key={i} style={{ marginBottom: "0.5rem" }}>
              <strong>{l.label}</strong> ({l.odds > 0 ? "+" : ""}
              {l.odds}){" "}
              <span
                style={{
                  marginLeft: 6,
                  fontSize: "0.8rem",
                  color: vs.color,
                }}
              >
                {vs.grade} · {Math.round(vs.impliedProb * 100)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
