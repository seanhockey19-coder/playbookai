"use client";

import { useState } from "react";
import { findLockStack, generateLadderPlan } from "../utils/lockrisk";
import { generateTodayTicket } from "../utils/ticket";

export default function TodaysTicketCard({ games }: { games: any[] }) {
  const [startStake, setStartStake] = useState(10);
  const [days, setDays] = useState(7);
  const [dayIndex, setDayIndex] = useState(1);

  const lockLegs = findLockStack(games);
  const ladderPlan = generateLadderPlan(startStake, days, lockLegs);

  const ticket = generateTodayTicket(ladderPlan, dayIndex, lockLegs.slice(0, 3));

  return (
    <div style={{ padding: "1rem", background: "#111", borderRadius: "8px" }}>
      <h2 style={{ color: "#0ff", marginBottom: "0.75rem" }}>
        Today’s Ticket Generator
      </h2>

      {/* Controls */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <label>
          Start Stake ($)
          <input
            type="number"
            value={startStake}
            onChange={(e) => setStartStake(Number(e.target.value))}
            style={{
              marginTop: "0.25rem",
              padding: "0.3rem",
              width: "90px",
              background: "#1c1c1c",
              border: "1px solid #444",
              color: "#fff",
              borderRadius: "4px",
            }}
          />
        </label>

        <label>
          Total Days
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{
              marginTop: "0.25rem",
              padding: "0.3rem",
              width: "70px",
              background: "#1c1c1c",
              border: "1px solid #444",
              color: "#fff",
              borderRadius: "4px",
            }}
          />
        </label>

        <label>
          Today = Day
          <input
            type="number"
            value={dayIndex}
            onChange={(e) => setDayIndex(Number(e.target.value))}
            style={{
              marginTop: "0.25rem",
              padding: "0.3rem",
              width: "70px",
              background: "#1c1c1c",
              border: "1px solid #444",
              color: "#fff",
              borderRadius: "4px",
            }}
          />
        </label>
      </div>

      {!ticket && (
        <p style={{ color: "salmon" }}>
          Not enough data to generate today's ticket.
        </p>
      )}

      {ticket && (
        <>
          <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
            Combined Odds:{" "}
            {ticket.combinedAmerican > 0
              ? `+${ticket.combinedAmerican}`
              : ticket.combinedAmerican}{" "}
            ({ticket.combinedDecimal.toFixed(2)}x)
          </p>

          <p>
            Wager: <strong>${ticket.stake.toFixed(2)}</strong>
            <br />
            Payout:{" "}
            <strong style={{ color: "#0f0" }}>
              ${ticket.payout.toFixed(2)}
            </strong>
          </p>

          <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
            Today’s Legs:
          </p>

          <ul>
            {ticket.legs.map((l, i) => (
              <li key={i} style={{ marginBottom: "0.3rem" }}>
                {l.label} ({l.odds > 0 ? "+" : ""}
                {l.odds})
              </li>
            ))}
          </ul>

          <textarea
            readOnly
            value={ticket.slipText}
            style={{
              width: "100%",
              height: "150px",
              marginTop: "1rem",
              padding: "0.75rem",
              background: "#000",
              color: "#0f0",
              border: "1px solid #333",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "0.85rem",
            }}
          />
        </>
      )}
    </div>
  );
}
