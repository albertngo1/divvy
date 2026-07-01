import { useEffect } from "react";

// App-level "what is this" — an executive summary of Divvy, opened from the wordmark.
export default function About({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={"about-overlay" + (open ? " open" : "")} onClick={onClose} aria-hidden={!open}>
      <div className="about-card" role="dialog" aria-label="About Divvy" onClick={(e) => e.stopPropagation()}>
        <button className="about-close" aria-label="close" onClick={onClose}>✕</button>
        <div className="about-eyebrow">Executive summary</div>
        <h2 className="about-title">Divvy</h2>
        <p className="about-lead">A cloud of ideas that grows itself.</p>
        <p>
          An autonomous agent scans the internet a few times a day — Hacker News, trending GitHub
          repos, the most-played Steam games — and riffs fresh, buildable weekend-project, game, and
          business ideas, writing a full PRD for every one. The cloud keeps growing between visits.
        </p>
        <p>
          Ideas cluster into <b>galaxies</b> by domain, each orbiting a labeled sun. A bubble's
          color and size are its <b>heat</b> — the AI's score plus everyone's votes (cooler red →
          hotter blue-white). Click any bubble for its PRD, vote it up or down, or copy a link to it.
        </p>
        <p>
          It's meant to be explored together: you and your friends move through it in <b>real time</b>
          — you'll see each other's cursors and votes as they happen.
        </p>
        <div className="about-foot">Built with Claude · grows on its own · <span>divvy</span></div>
      </div>
    </div>
  );
}
