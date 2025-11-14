export const metadata = {
  title: "CoachesPlaybookAI – Dashboard",
};

export default function DashboardLayout({ children }) {
  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#0b0b0d",
      color: "white"
    }}>
      <aside style={{
        width: "240px",
        background: "#111",
        padding: "2rem 1rem",
        borderRight: "1px solid #222"
      }}>
        <h2 style={{ color: "#0ff", marginBottom: "2rem" }}>CoachesPlaybookAI</h2>

        <nav>
          <ul style={{ listStyle: "none", padding: 0, lineHeight: "2.2rem" }}>
            <li>🏠 Dashboard</li>
            <li>🏈 Props</li>
            <li>📊 Ladder Challenge</li>
            <li>📁 My Parlays</li>
          </ul>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
}
