import { useEffect, useRef, useState } from "react";
import type { Idea } from "../types";
import { colorOf } from "../cloud";

// keeps the last idea briefly so the fade-out shows content instead of blanking
export default function Tooltip({ idea }: { idea: Idea | null }) {
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

  return (
    <div id="tooltip" className={"tooltip" + (idea ? " show" : "")} style={style}>
      {shown && (
        <>
          <div className="tt-title">{shown.title}</div>
          {shown.hook && <div className="tt-hook">{shown.hook}</div>}
          <div className="tt-tags">{(shown.tags || []).map((t) => <span key={t}>{t}</span>)}</div>
        </>
      )}
    </div>
  );
}
