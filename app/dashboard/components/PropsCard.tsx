"use client";

import type { SimplifiedGame } from "../../api/nfl/odds/route";

interface PropsCardProps {
  game?: SimplifiedGame;
  propsData?: any[];
  loading?: boolean;
}

export default function PropsCard({
  game,
  propsData = [],
  loading,
}: PropsCardProps) {
  return (
    <div style={{ padding: "1rem", background: "#111", borderRadius: "8px" }}>
      <h2 style={{ color: "#0ff", marginBottom: "1rem" }}>Player Props</h2>

      {!game && <p>Select a game to see props.</p>}

      {loading && <p>Loading player props…</p>}

      {!loading && propsData.length === 0 && <p>No props available.</p>}

      {!loading &&
        propsData.map((p, i) => (
          <div key={i} style={{ marginBottom: "1rem" }}>
            <strong>{p.player}</strong>
            <br />
            {p.stat.replace(/_/g, " ")} OVER {p.line ?? "N/A"}
            <br />
            Odds: {p.odds > 0 ? `+${p.odds}` : p.odds}
          </div>
        ))}
    </div>
  );
}
