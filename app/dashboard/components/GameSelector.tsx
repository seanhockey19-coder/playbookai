import type { SimplifiedGame } from "../../api/nfl/odds/route";

interface GameSelectorProps {
  games: SimplifiedGame[];
  selectedGameId: string | null;
  onChange: (id: string) => void;
}

export default function GameSelector({
  games,
  selectedGameId,
  onChange,
}: GameSelectorProps) {
  return (
    <div
      style={{
        padding: "1rem",
        background: "#111",
        borderRadius: "8px",
        marginBottom: "2rem",
      }}
    >
      <h2 style={{ color: "#0ff", marginBottom: "1rem" }}>Select Game</h2>

      <select
        style={{
          width: "100%",
          padding: "0.8rem",
          background: "#1a1a1a",
          color: "white",
          borderRadius: "6px",
          border: "1px solid #333",
        }}
        value={selectedGameId ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={games.length === 0}
      >
        {games.length === 0 && <option>No upcoming games found</option>}

        {games.length > 0 && (
          <>
            <option value="">Choose a matchup…</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.awayTeam} @ {g.homeTeam}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
}
