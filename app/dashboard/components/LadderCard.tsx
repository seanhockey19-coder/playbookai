"use client";

import { findLadderLegs, LadderLeg } from "../utils/ladder";

interface LadderCardProps {
  propsData?: any[];
}

export default function LadderCard({ propsData = [] }: LadderCardProps) {
  const legs: LadderLeg[] = findLadderLegs(propsData);

  return (
    <div style={{ padding: "1rem", background: "#111", borderRadius: "8px" }}>
      <h2 style={{ color: "#0ff" }}>Ladder Challenge Picks</h2>

      {legs.length === 0 && (
        <p style={{ opacity: 0.7 }}>No suitable ladder legs available.</p>
      )}

      {legs.length > 0 && (
        <ul style={{ marginTop: "1rem" }}>
          {legs.map((l, i) => (
            <li key={i} style={{ lineHeight: "1.6rem", marginBottom: "0.6rem" }}>
              <strong>{l.player}</strong>
              <br />
              {l.stat.replace(/_/g, " ")} OVER {l.line ?? "N/A"}
              <br />
              Odds: {l.odds > 0 ? `+${l.odds}` : l.odds}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
