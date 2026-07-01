import { useMemo, useState } from "react";
import type { Idea } from "../types";
import { heuristicScore } from "../score";

interface Props {
  ideas: Idea[];
  votes: Record<string, number>;
  views: Record<string, number>;
  onOpen: (d: Idea) => void;
}

// Ranked leaderboard of the hottest ideas — by heuristic score (AI score + votes).
// Scrollable; shows each idea's total view count.
export default function Scoreboard({ ideas, votes, views, onOpen }: Props) {
  const [open, setOpen] = useState(() => !(typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches));
  const ranked = useMemo(
    () =>
      ideas
        .map((d) => ({ d, h: heuristicScore(d.score, votes[d.slug] || 0) }))
        .sort((a, b) => b.h - a.h)
        .slice(0, 30),
    [ideas, votes],
  );
  if (!ideas.length) return null;

  return (
    <aside id="scoreboard" className={"scoreboard" + (open ? "" : " collapsed")} aria-label="top ideas">
      <button className="sb-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="sb-title-cap">🏆 Top ideas</span>
        <span className="sb-chevron" aria-hidden="true">▾</span>
      </button>
      <ol className="sb-list">
        {ranked.map(({ d, h }, i) => (
          <li key={d.slug}>
            <button className="sb-row" onClick={() => onOpen(d)} title={d.title}>
              <span className="sb-rank">{i + 1}</span>
              <span className="sb-name">{d.title}</span>
              <span className="sb-views" title="views">👁 {views[d.slug] || 0}</span>
              <span className="sb-votes">{h}</span>
            </button>
          </li>
        ))}
      </ol>
    </aside>
  );
}
