"use client";

import { getValueScore } from "../utils/value";

interface ParlayLegSelectorProps {
  games: any[];
  onAdd: (leg: { label: string; odds: number; valueGrade?: string }) => void;
}

export default function ParlayLegSelector({ games, onAdd }: ParlayLegSelectorProps) {
  return (
    <div style={{ padding: "1rem", background: "#111", borderRadius: "8px" }}>
      <h2 style={{ color: "#0ff", marginBottom: "0.75rem" }}>
        Add Parlay Legs (with Value Grades)
      </h2>

      {games.map((g: any) => (
        <div
          key={g.id}
          style={{
            padding: "0.75rem",
            background: "#1a1a1a",
            borderRadius: "6px",
            marginBottom: "0.75rem",
          }}
        >
          <strong style={{ color: "#fff" }}>
            {g.awayTeam} @ {g.homeTeam}
          </strong>

          {/* MONEYLINES */}
          <div style={{ marginTop: "0.4rem" }}>
            {g.h2h && (
              <>
                {["home", "away"].map((side) => {
                  const teamName =
                    side === "home" ? g.homeTeam : g.awayTeam;
                  const outcome = g.h2h.outcomes.find(
                    (o: any) => o.name === teamName
                  );
                  if (!outcome) return null;
                  const vs = getValueScore(outcome.price);

                  return (
                    <button
                      key={side}
                      onClick={() =>
                        onAdd({
                          label: `${teamName} ML`,
                          odds: outcome.price,
                          valueGrade: vs.grade,
                        })
                      }
                      style={btn}
                    >
                      {teamName} ML ({outcome.price > 0 ? "+" : ""}
                      {outcome.price}){" "}
                      <span
                        style={{
                          marginLeft: 4,
                          fontSize: "0.75rem",
                          color: vs.color,
                        }}
                      >
                        {vs.grade}
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* SPREADS */}
          {g.spreads && (
            <div style={{ marginTop: "0.5rem" }}>
              {g.spreads.outcomes.map((o: any, i: number) => {
                const vs = getValueScore(o.price);
                return (
                  <button
                    key={i}
                    onClick={() =>
                      onAdd({
                        label: `${o.name} ${o.point}`,
                        odds: o.price,
                        valueGrade: vs.grade,
                      })
                    }
                    style={btn}
                  >
                    {o.name} {o.point} ({o.price > 0 ? "+" : ""}
                    {o.price}){" "}
                    <span
                      style={{
                        marginLeft: 4,
                        fontSize: "0.75rem",
                        color: vs.color,
                      }}
                    >
                      {vs.grade}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TOTALS */}
          {g.totals && (
            <div style={{ marginTop: "0.5rem" }}>
              {g.totals.outcomes.map((o: any, i: number) => {
                const vs = getValueScore(o.price);
                return (
                  <button
                    key={i}
                    onClick={() =>
                      onAdd({
                        label: `${o.name} ${o.point}`,
                        odds: o.price,
                        valueGrade: vs.grade,
                      })
                    }
                    style={btn}
                  >
                    {o.name} {o.point} ({o.price > 0 ? "+" : ""}
                    {o.price}){" "}
                    <span
                      style={{
                        marginLeft: 4,
                        fontSize: "0.75rem",
                        color: vs.color,
                      }}
                    >
                      {vs.grade}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: "5px 10px",
  margin: "4px",
  background: "#222",
  color: "#0ff",
  border: "1px solid #333",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.8rem",
};
