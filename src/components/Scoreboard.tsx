import { useMemo, useState } from "react";
import type { Idea } from "../types";

interface Props {
  ideas: Idea[];
  votes: Record<string, number>;
  onOpen: (d: Idea) => void;
}

// Ranked leaderboard of the hottest ideas — by net votes, tie-broken by AI score.
export default function Scoreboard({ ideas, votes, onOpen }: Props) {
  const [open, setOpen] = useState(true);
  const top = useMemo(
    () =>
      ideas
        .map((d) => ({ d, v: votes[d.slug] || 0 }))
        .sort((a, b) => b.v - a.v || (b.d.score || 0) - (a.d.score || 0))
        .slice(0, 8),
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
        {top.map(({ d, v }, i) => (
          <li key={d.slug}>
            <button className="sb-row" onClick={() => onOpen(d)} title={d.title}>
              <span className="sb-rank">{i + 1}</span>
              <span className="sb-name">{d.title}</span>
              <span className={"sb-votes" + (v > 0 ? " pos" : v < 0 ? " neg" : "")}>{v > 0 ? `+${v}` : v}</span>
            </button>
          </li>
        ))}
      </ol>
    </aside>
  );
}
