export const metadata = {
  title: "CoachesPlaybookAI",
  description: "Sports analytics platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: "#000", color: "#0ff" }}>{children}</body>
    </html>
  );
}
