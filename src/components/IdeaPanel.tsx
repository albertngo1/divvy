import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import type { Idea } from "../types";
import { colorOf, colorAlpha } from "../cloud";

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
}

export default function IdeaPanel({ idea, onClose, onToggleTag, activeTags }: Props) {
  const [shown, setShown] = useState<Idea | null>(null); // keeps content during slide-out
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const hideTimer = useRef<number>();
  const reqId = useRef(0);

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
        <>
          <div className="panel-head">
            <div id="panel-tags" className="tags">
              <span className="score-chip" style={{ color: accent, borderColor: colorAlpha(shown, 0.6) }}>
                score {Number.isFinite(shown.score) ? shown.score : "—"}
              </span>
              {shown.created && <span className="date-chip">added {fmtDate(shown.created)}</span>}
              {(shown.tags || []).map((t) => (
                <span key={t} className={activeTags.has(t) ? "active" : ""} onClick={() => onToggleTag(t)}>{t}</span>
              ))}
            </div>
            <h2 id="panel-title">{shown.title}</h2>
            <p id="panel-hook" className="hook">{shown.hook}</p>
          </div>
          <article id="panel-prd" className="prd" style={{ opacity: loading ? 0 : 1 }} dangerouslySetInnerHTML={{ __html: html }} />
        </>
      )}
    </aside>
  );
}
