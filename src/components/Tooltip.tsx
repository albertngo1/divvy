import { useEffect, useRef, useState } from "react";
import type { Idea } from "../types";
import { colorOf } from "../cloud";

// Fixed hover tooltip. Sits top-center by default, but flips to the bottom when the
// hovered bubble is up in the tooltip's zone — so it never hides what you're pointing at.
export default function Tooltip({ idea, votes, atBottom }: { idea: Idea | null; votes: number; atBottom: boolean }) {
  const [shown, setShown] = useState<Idea | null>(null);
  const timer = useRef<number>();

  useEffect(() => {
    if (idea) {
      if (timer.current) clearTimeout(timer.current);
      setShown(idea);
    } else {
      timer.current = window.setTimeout(() => setShown(null), 200);
    }
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [idea]);

  const style = shown ? ({ ["--tt-accent" as never]: colorOf(shown) }) : undefined;
  const cls = "tooltip" + (idea ? " show" : "") + (atBottom ? " at-bottom" : "");

  return (
    <div id="tooltip" className={cls} style={style}>
      {shown && (
        <>
          <div className="tt-title">{shown.title}</div>
          {shown.hook && <div className="tt-hook">{shown.hook}</div>}
          <div className="tt-tags">
            <span className="tt-votes">▲ {votes}</span>
            {(shown.tags || []).map((t) => <span key={t}>{t}</span>)}
          </div>
        </>
      )}
    </div>
  );
}
