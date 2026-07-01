interface Props { count: number; lastScan: string; onAbout: () => void; }

export default function TopBar({ count, lastScan, onAbout }: Props) {
  return (
    <header className="topbar">
      <button className="brand" onClick={onAbout} title="what is Divvy?">
        <span className="mark">◍</span>
        <h1>Divvy</h1>
        <span className="tagline">an idea cloud that grows itself</span>
      </button>
      <div className="meta">
        <span id="idea-count">{count || "—"}</span> ideas
        <span className="scan-meta"> <span className="sep">·</span> last scan <span id="last-scan">{lastScan}</span></span>
      </div>
    </header>
  );
}
