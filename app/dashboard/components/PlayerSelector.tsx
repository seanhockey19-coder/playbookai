export default function PlayerSelector() {
  return (
    <div style={{
      padding: "1rem",
      background: "#111",
      borderRadius: "8px"
    }}>
      <h2 style={{ color: "#0ff", marginBottom: "1rem" }}>Select Player</h2>

      <select style={{
        width: "100%",
        padding: "0.8rem",
        background: "#1a1a1a",
        color: "white",
        borderRadius: "6px",
        border: "1px solid #333"
      }}>
        <option>Choose player...</option>
        <option>Patrick Mahomes</option>
        <option>Josh Allen</option>
        <option>Christian McCaffrey</option>
      </select>
    </div>
  );
}
