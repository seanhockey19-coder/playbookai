"use client";

import { useEffect, useState } from "react";
import { SimplifiedGame } from "../../api/nfl/odds/route";

interface PropLine {
  player: string;
  team?: string;
  market: string;
  dkLine: number;
  dkOdds: number;
  fdLine: number;
  fdOdds: number;
  projection: number;
  edgePct: number;
  confidence: number;
}

interface Props {
  game: SimplifiedGame | undefined;
  sport: "nfl" | "nba";
}

export default function PropBookPanel({ game, sport }: Props) {
  const [propsData, setPropsData] = useState<PropLine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!game) {
        setPropsData([]);
        return;
      }

      try {
        setLoading(true);
        const q = new URLSearchParams({
          sport,
          gameId: game.id,
        }).toString();

        const res = await fetch(`/api/props/model?${q}`);
        if (!res.ok) {
          setPropsData([]);
          return;
        }
        const json = await res.json();
        setPropsData(json.props || []);
      } catch {
        setPropsData([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [game?.id, sport]);

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 10,
        border: "1px solid #333",
        background: "#0b0b0b",
        color: "#eee",
      }}
    >
      <h3 style={{ color: "#0ff", marginBottom: 10 }}>
        DK + FD Player Prop Engine
      </h3>

      {loading && <p style={{ color: "#999" }}>Loading model props…</p>}

      {!loading && propsData.length === 0 && (
        <p style={{ color: "#777", fontSize: 13 }}>
          No props available yet for this game. (Model / feed not wired or game
          too far out.)
        </p>
      )}

      {!loading && propsData.length > 0 && (
        <div
          style={{
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    paddingBottom: 6,
                    borderBottom: "1px solid #444",
                  }}
                >
                  Player
                </th>
                <th
                  style={{
                    textAlign: "left",
                    paddingBottom: 6,
                    borderBottom: "1px solid #444",
                  }}
                >
                  Market
                </th>
                <th
                  style={{
                    textAlign: "center",
                    paddingBottom: 6,
                    borderBottom: "1px solid #444",
                  }}
                >
                  DK
                </th>
                <th
                  style={{
                    textAlign: "center",
                    paddingBottom: 6,
                    borderBottom: "1px solid #444",
                  }}
                >
                  FD
                </th>
                <th
                  style={{
                    textAlign: "center",
                    paddingBottom: 6,
                    borderBottom: "1px solid #444",
                  }}
                >
                  Model
                </th>
                <th
                  style={{
                    textAlign: "center",
                    paddingBottom: 6,
                    borderBottom: "1px solid #444",
                  }}
                >
                  Edge
                </th>
              </tr>
            </thead>
            <tbody>
              {propsData.map((p, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      padding: "6px 4px",
                      borderBottom: "1px solid #222",
                    }}
                  >
                    <strong>{p.player}</strong>
                    {p.team && (
                      <span style={{ color: "#999", marginLeft: 4 }}>
                        ({p.team})
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "6px 4px",
                      borderBottom: "1px solid #222",
                    }}
                  >
                    {p.market}
                  </td>
                  <td
                    style={{
                      padding: "6px 4px",
                      borderBottom: "1px solid #222",
                      textAlign: "center",
                    }}
                  >
                    {p.dkLine} ({p.dkOdds})
                  </td>
                  <td
                    style={{
                      padding: "6px 4px",
                      borderBottom: "1px solid #222",
                      textAlign: "center",
                    }}
                  >
                    {p.fdLine} ({p.fdOdds})
                  </td>
                  <td
                    style={{
                      padding: "6px 4px",
                      borderBottom: "1px solid #222",
                      textAlign: "center",
                    }}
                  >
                    {p.projection.toFixed(1)}
                  </td>
                  <td
                    style={{
                      padding: "6px 4px",
                      borderBottom: "1px solid #222",
                      textAlign: "center",
                      color: p.edgePct >= 0 ? "#0f0" : "#f66",
                    }}
                  >
                    {p.edgePct >= 0 ? "+" : ""}
                    {p.edgePct.toFixed(1)}%
                    <div
                      style={{
                        fontSize: 10,
                        color: "#0ff",
                        marginTop: 2,
                      }}
                    >
                      {(p.confidence * 100).toFixed(0)}% conf
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
