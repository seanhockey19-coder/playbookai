"use client";

import { useState, ChangeEvent } from "react";
import {
  findLockStack,
  generateLadderPlan,
  LadderDay,
} from "../utils/lockrisk";

export default function LadderGeneratorCard({ games }: { games: any[] }) {
  const [startStake, setStartStake] = useState<number>(10);
  const [days, setDays] = useState<number>(7);

  const lockLegs = findLockStack(games);
  const ladder: LadderDay[] = generateLadderPlan(startStake, days, lockLegs);

  const handleStakeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    if (isNaN(v)) return;
    setStartStake(v);
  };

  const handleDaysChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (isNaN(v)) return;
    setDays(Math.max(1, Math.min(14, v))); // 1–14 days
  };

  return (
    <div style={{ padding: "1rem", background: "#111", borderRadius: "8px" }}>
      <h2 style={{ color: "#0ff", marginBottom: "0.75rem" }}>
        Day-X Ladder Generator
      </h2>

      {lockLegs.length === 0 && (
        <p style={{ opacity: 0.75 }}>
          No qualifying Lock Stack legs found from current games.
        </p>
      )}

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <label style={{ fontSize: "0.9rem" }}>
          Start Stake ($)
          <br />
          <input
            type="number"
            value={startStake}
            onChange={handleStakeChange}
            min={1}
            style={{
              marginTop: "0.25rem",
              padding: "0.35rem 0.5rem",
              background: "#1a1a1a",
              borderRadius: "4px",
              border: "1px solid #333",
              color: "white",
              width: "100px",
            }}
          />
        </label>

        <label style={{ fontSize: "0.9rem" }}>
          Days
          <br />
          <input
            type="number"
            value={days}
            onChange={handleDaysChange}
            min={1}
            max={14}
            style={{
              marginTop: "0.25rem",
              padding: "0.35rem 0.5rem",
              background: "#1a1a1a",
              borderRadius: "4px",
              border: "1px solid #333",
              color: "white",
              width: "80px",
            }}
          />
        </label>
      </div>

      {ladder.length > 0 && (
        <>
          <p style={{ fontSize: "0.85rem", opacity: 0.8 }}>
            Using {ladder[0].legs.length} Lock Stack leg(s) per day. Implied
            odds: {ladder[0].impliedAmerican > 0
              ? `+${ladder[0].impliedAmerican}`
              : ladder[0].impliedAmerican}{" "}
            ({ladder[0].impliedDecimal.toFixed(2)}x)
          </p>

          <table
            style={{
              width: "100%",
              marginTop: "0.5rem",
              fontSize: "0.85rem",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", paddingBottom: "0.35rem" }}>
                  Day
                </th>
                <th style={{ textAlign: "right", paddingBottom: "0.35rem" }}>
                  Start
                </th>
                <th style={{ textAlign: "right", paddingBottom: "0.35rem" }}>
                  Target
                </th>
              </tr>
            </thead>
            <tbody>
              {ladder.map((d) => (
                <tr key={d.day}>
                  <td style={{ padding: "0.18rem 0" }}>{d.day}</td>
                  <td style={{ padding: "0.18rem 0", textAlign: "right" }}>
                    ${d.stakeStart.toFixed(2)}
                  </td>
                  <td style={{ padding: "0.18rem 0", textAlign: "right" }}>
                    ${d.targetStake.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "0.75rem" }}>
            <strong style={{ fontSize: "0.9rem" }}>Daily Legs:</strong>
            <ul style={{ marginTop: "0.35rem", paddingLeft: "1rem" }}>
              {ladder[0].legs.map((l, i) => (
                <li key={i} style={{ marginBottom: "0.25rem" }}>
                  {l.label} ({l.odds > 0 ? `+${l.odds}` : l.odds})
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
