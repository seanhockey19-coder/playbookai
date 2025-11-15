"use client";

import { useState } from "react";
import { generateBestSGP } from "@/lib/sgpEngine";

export default function BestSGPButton({ game, onGenerate }) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    if (!game) return;
    setLoading(true);

    const result = generateBestSGP(game);

    setTimeout(() => {
      onGenerate(result);
      setLoading(false);
    }, 300);
  };

  return (
    <button
      onClick={handleGenerate}
      style={{
        padding: "12px 16px",
        background: "#0ff",
        color: "#000",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        width: "100%",
        marginBottom: "12px",
      }}
    >
      {loading ? "Generating SGP…" : "🔥 Best SGP Combo"}
    </button>
  );
}
