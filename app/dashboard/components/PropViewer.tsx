"use client";

import { useState } from "react";

export default function PropViewer() {
  const [player, setPlayer] = useState("");
  const [loading, setLoading] = useState(false);
  const [propsData, setPropsData] = useState<any[]>([]);
  const [error, setError] = useState("");

  const fetchProps = async () => {
    if (!player) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/props-scraped?player=${player}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Could not load props");
        setPropsData([]);
        return;
      }

      setPropsData(json.props || []);
    } catch (err: any) {
      setError("Failed to load props");
      setPropsData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "#0a0a0a",
      border: "1px solid #0ff",
      padding: "1rem",
      borderRadius: "10px",
      color: "#0ff",
      minHeight: "200px"
    }}>
      <h2 style={{ marginBottom: "0.5rem" }}>Player Props</h2>

      <input
        value={player}
        onChange={(e) => setPlayer(e.target.value)}
        placeholder="Enter player name (ex: Patrick Mahomes)"
        style={{
          width: "100%",
          padding: "0.6rem",
          marginBottom: "0.8rem",
          background: "#111",
          border: "1px solid #0ff",
          color: "#0ff",
          borderRadius: "6px"
        }}
      />

      <button
        onClick={fetchProps}
        style={{
          width: "100%",
          padding: "0.6rem",
          background: "#0ff",
          color: "#000",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Load Props
      </button>

      {loading && <p>Loading props…</p>}
      {error && <p style={{ color: "salmon" }}>{error}</p>}

      <div style={{ marginTop: "1rem" }}>
        {propsData.length === 0 && !loading && <p>No props found.</p>}

        {propsData.map((p: any, i: number) => (
          <div key={i} style={{
            marginBottom: "0.8rem",
            padding: "0.6rem",
            background: "#111",
            borderRadius: "6px",
            border: "1px solid #333"
          }}>
            <strong>{p.category}: {p.propName}</strong>
            <br />
            Line: {p.line}
            <br />
            Over: {p.over ?? "N/A"}
            <br />
            Under: {p.under ?? "N/A"}
          </div>
        ))}
      </div>
    </div>
  );
}
