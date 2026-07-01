import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import type { Idea } from "../types";
import { colorOf, colorAlpha } from "../cloud";
import { canonTags } from "../tags";
import { heuristicScore } from "../score";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(s: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || ""));
  return m ? `${MONTHS[+m[2] - 1] || "?"} ${+m[3]}, ${m[1]}` : String(s || "");
}

interface Props {
  idea: Idea | null;
  onClose: () => void;
  onToggleTag: (tag: string) => void;
  activeTags: Set<string>;
  voteCount: number;
  viewCount: number;
  myVote: number; // 1, -1, or 0
  onVote: (slug: string, dir: 1 | -1) => void;
}

export default function IdeaPanel({ idea, onClose, onToggleTag, activeTags, voteCount, viewCount, myVote, onVote }: Props) {
  const [shown, setShown] = useState<Idea | null>(null); // keeps content during slide-out
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const hideTimer = useRef<number>();
  const reqId = useRef(0);

  const copyLink = () => {
    if (!shown) return;
    const url = `${window.location.origin}${window.location.pathname}?idea=${shown.slug}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }).catch(() => {});
  };

  useEffect(() => {
    if (idea) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setShown(idea);
      setLoading(true);
      const id = ++reqId.current;
      window.getSelection?.()?.removeAllRanges();
      fetch(`./data/prds/${idea.slug}.md`, { cache: "no-store" })
        .then((r) => (r.ok ? r.text() : Promise.reject()))
        .then((md) => {
          if (reqId.current !== id) return; // a newer selection won
          setHtml(marked.parse(md.replace(/^\s*#\s+.*\r?\n+/, "")) as string);
          setLoading(false);
        })
        .catch(() => { if (reqId.current === id) { setHtml("<p style='color:var(--ink-dim)'>No PRD written yet for this idea.</p>"); setLoading(false); } });
    } else {
      hideTimer.current = window.setTimeout(() => setShown(null), 340);
    }
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [idea]);

  const accent = shown ? colorOf(shown) : undefined;
  const style = shown ? ({ ["--accent" as never]: accent, ["--accent-soft" as never]: colorAlpha(shown, 0.14) }) : undefined;

  return (
    <aside id="panel" className={"panel" + (idea ? " open" : "")} style={style} aria-hidden={!idea}>
      <button id="panel-close" className="panel-close" aria-label="close" onClick={onClose}>✕</button>
      {shown && (
        <div className="panel-scroll">
          <div className="panel-head">
            <div id="panel-tags" className="tags">
              <span
                className="score-chip" style={{ color: accent, borderColor: colorAlpha(shown, 0.6) }}
                title={`AI ${Number.isFinite(shown.score) ? shown.score : "—"} + ${voteCount} votes`}
              >
                score {heuristicScore(shown.score, voteCount)}
              </span>
              {shown.created && <span className="date-chip">added {fmtDate(shown.created)}</span>}
              <span className="date-chip">👁 {viewCount} {viewCount === 1 ? "view" : "views"}</span>
              {canonTags(shown.tags).map((t) => (
                <span key={t} className={activeTags.has(t) ? "active" : ""} onClick={() => onToggleTag(t)}>{t}</span>
              ))}
            </div>
            <h2 id="panel-title">{shown.title}</h2>
            <p id="panel-hook" className="hook">{shown.hook}</p>
            <div className="panel-actions">
              <div className="votebox" role="group" aria-label="vote">
                <button
                  className={"votebtn up" + (myVote === 1 ? " on" : "")}
                  onClick={() => onVote(shown.slug, 1)}
                  aria-pressed={myVote === 1} aria-label="upvote"
                >▲</button>
                <span className={"votebox-count" + (voteCount > 0 ? " pos" : voteCount < 0 ? " neg" : "")}>{voteCount}</span>
                <button
                  className={"votebtn down" + (myVote === -1 ? " on" : "")}
                  onClick={() => onVote(shown.slug, -1)}
                  aria-pressed={myVote === -1} aria-label="downvote"
                >▼</button>
              </div>
              <button className={"copylink" + (copied ? " copied" : "")} onClick={copyLink}>
                {copied ? "✓ copied" : "🔗 copy link"}
              </button>
            </div>
          </div>
          <article id="panel-prd" className="prd" style={{ opacity: loading ? 0 : 1 }} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}
    </aside>
  );
}
