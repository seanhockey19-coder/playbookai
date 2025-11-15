"use client";

import { useState } from "react";

export default function LadderGenerator() {
  const [player, setPlayer] = useState("");
  const [loading, setLoading] = useState(false);
  const [propsData, setPropsData] = useState<any[]>([]);
  const [ladderPicks, setLadderPicks] = useState<any[]>([]);
  const [error, setError] = useState("");

  // ----------------------------------------------
  // Fetch player props from Action Network scraper
  // ----------------------------------------------
  const fetchProps = async () => {
    if (!player) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/props-scraped?player=${player}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Could not load props.");
        setPropsData([]);
        return;
      }

      setPropsData(json.props || []);
    } catch (err: any) {
      setError("Failed to load props.");
      setPropsData([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------
  // Build Ladder Picks (filters -500 to -1000 prop odds)
  // ------------------------------------------------------
  const generateLadder = () => {
    if (propsData.length === 0) {
      setError("No props available for this player.");
      return;
    }

    // Clean & filter props into proper ladder range
    const parsed = propsData
      .map((p) => {
        const overNum = p.over ? parseInt(p.over.replace("-", "")) : null;
        const underNum = p.under ? parseInt(p.under.replace("-", "")) : null;

        // We only want bets with strong likelihood (ladder-safe)
        const validOver =
          overNum && overNum >= 500 && overNum <= 1000
            ? { ...p, type: "Over", odds: -overNum }
            : null;

        const validUnder =
          underNum && underNum >= 500 && underNum <= 1000
            ? { ...p, type: "Under", odds: -underNum }
            : null;

        return [validOver, validUnder].filter(Boolean);
      })
      .flat();

    if (parsed.length === 0) {
      setError("No ladder-safe props (–500 to –1000 odds).");
      return;
    }

    // Sort props by safest → highest odds
    const sorted = parsed.sort((a, b) => Math.abs(a.odds) - Math.abs(b.odds));

    // Pick top 3–4 safest props
    const ladderLegs = sorted.slice(0, 4);

    setLadderPicks(ladderLegs);
  };

  return (
    <div
      style={{
        background: "#0a0a0a",
        border: "1px solid #0ff",
        padding: "1rem",
        borderRadius: "10px",
        color: "#0ff",
      }}
    >
      <h2 style={{ marginBottom: "0.5rem" }}>Ladder Generator (Props)</h2>

      <input
        value={player}
        onChange={(e) => setPlayer(e.target.value)}
        placeholder="Enter player (ex: Tyreek Hill)"
        style={{
          width: "100%",
          padding: "0.6rem",
          marginBottom: "0.8rem",
          background: "#111",
          border: "1px solid #0ff",
          color: "#0ff",
          borderRadius: "6px",
        }}
      />

      {/* Fetch Props Button */}
      <button
        onClick={fetchProps}
        style={{
          width: "100%",
          padding: "0.6rem",
          background: "#0ff",
          color: "#000",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: "0.8rem",
        }}
      >
        Load Props
      </button>

      {loading && <p>Loading props…</p>}
      {error && <p style={{ color: "salmon" }}>{error}</p>}

      {/* Generate Ladder Button */}
      {propsData.length > 0 && (
        <button
          onClick={generateLadder}
          style={{
            width: "100%",
            padding: "0.6rem",
            background: "#ff0",
            color: "#000",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            marginTop: "0.5rem",
          }}
        >
          Generate Ladder Picks
        </button>
      )}

      {/* Display Ladder Picks */}
      {ladderPicks.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <h3>🔥 Ladder Picks</h3>
          {ladderPicks.map((leg, i) => (
            <div
              key={i}
              style={{
                background: "#111",
                padding: "0.6rem",
                marginBottom: "0.8rem",
                borderRadius: "6px",
                border: "1px solid #333",
              }}
            >
              <strong>
                {leg.category} – {leg.propName}
              </strong>
              <br />
              Line: {leg.line}
              <br />
              Type: {leg.type}
              <br />
              Odds: {leg.odds}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
