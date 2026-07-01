interface Props { count: number; lastScan: string; }

export default function TopBar({ count, lastScan }: Props) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="mark">◍</span>
        <h1>Divvy</h1>
        <span className="tagline">an idea cloud that grows itself</span>
      </div>
      <div className="meta">
        <span id="idea-count">{count || "—"}</span> ideas
        <span className="scan-meta"> <span className="sep">·</span> last scan <span id="last-scan">{lastScan}</span></span>
      </div>
    </header>
  );
}
