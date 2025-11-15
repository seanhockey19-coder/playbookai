"use client";

import { getGameBreakdown } from "@/lib/gameBreakdown";

export default function GameBreakdown({ game }) {
  if (!game) return null;

  const breakdown = getGameBreakdown(game);

  if (!breakdown) return null;

  return (
    <div
      style={{
        padding: "1rem",
        background: "#111",
        borderRadius: "10px",
        color: "#0ff",
        marginBottom: "1.5rem",
      }}
    >
      <h2 style={{ marginBottom: "0.5rem" }}>🧠 AI Game Breakdown</h2>

      <p>
        <strong>{game.homeTeam} Win Probability:</strong>{" "}
        {breakdown.homeProb}%
      </p>
      <p>
        <strong>{game.awayTeam} Win Probability:</strong>{" "}
        {breakdown.awayProb}%
      </p>

      <p>
        <strong>Projected Total:</strong> {breakdown.projectedTotal}
      </p>

      <p>
        <strong>Pace of Play:</strong> {breakdown.pace}
      </p>

      <p>
        <strong>Suggested Side:</strong> {breakdown.bestSide}
      </p>

      <p>
        <strong>Suggested Total:</strong> {breakdown.totalSide}
      </p>

      <p style={{ marginTop: "1rem", opacity: 0.8 }}>
        {breakdown.summary}
      </p>
    </div>
  );
}
