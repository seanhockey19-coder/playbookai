import type { SimplifiedGame } from "../../api/nfl/odds/route";

interface OddsCardProps {
  game?: SimplifiedGame;
}

export default function OddsCard({ game }: OddsCardProps) {
  if (!game) {
    return (
      <div
        style={{
          padding: "1rem",
          background: "#111",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ color: "#0ff", marginBottom: "1rem" }}>Game Odds</h2>
        <p>No game selected.</p>
      </div>
    );
  }

  const formatMarket = (key: "h2h" | "spreads" | "totals") => {
    const market = game[key];
    if (!market || !market.outcomes?.length) return "N/A";

    return market.outcomes
      .map((o) => {
        const base = `${o.name} ${o.price > 0 ? "+" : ""}${o.price}`;
        if (o.point !== undefined && o.point !== null) {
          return `${base} (${o.point})`;
        }
        return base;
      })
      .join(" | ");
  };

  return (
    <div
      style={{
        padding: "1rem",
        background: "#111",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ color: "#0ff", marginBottom: "0.5rem" }}>Game Odds</h2>
      <p style={{ marginBottom: "0.5rem" }}>
        {game.awayTeam} @ {game.homeTeam}
      </p>
      <p>Moneyline: {formatMarket("h2h")}</p>
      <p>Spread: {formatMarket("spreads")}</p>
      <p>Total: {formatMarket("totals")}</p>
      <p style={{ marginTop: "0.5rem", opacity: 0.7, fontSize: "0.85rem" }}>
        Data: The Odds API
      </p>
    </div>
  );
}
