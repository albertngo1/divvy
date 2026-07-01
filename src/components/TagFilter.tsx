import { useMemo, useState } from "react";
import type { Idea } from "../types";
import { consolidatedTags } from "../tags";

interface Props {
  ideas: Idea[];
  activeTags: Set<string>;
  onToggle: (tag: string) => void;
  onClear: () => void;
}

export default function TagFilter({ ideas, activeTags, onToggle, onClear }: Props) {
  const [open, setOpen] = useState(false);

  const tags = useMemo(() => consolidatedTags(ideas.map((d) => d.tags || [])), [ideas]);

  // whole panel toggles open/closed, except clicks on a chip or the clear button
  const onPanelClick = (e: React.MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.closest(".tp") || el.closest("#tf-clear")) return;
    setOpen((o) => !o);
  };

  return (
    <aside id="tagfilter" className={"tagfilter" + (open ? "" : " collapsed")} aria-label="filter by tag" onClick={onPanelClick}>
      <div className="tf-head" id="tf-head">
        <span>Filter by tag</span>
        <span className="tf-right">
          {activeTags.size > 0 && (
            <button id="tf-clear" className="tf-clear" onClick={(e) => { e.stopPropagation(); onClear(); }}>clear</button>
          )}
          <span className="tf-chevron" aria-hidden="true">▾</span>
        </span>
      </div>
      <div id="tagfilter-list" className="tf-list">
        {tags.map(({ t, n }) => (
          <button
            key={t}
            className={"tp" + (activeTags.has(t) ? " on" : "")}
            data-tag={t}
            onClick={(e) => { e.stopPropagation(); onToggle(t); }}
          >
            {t}<span className="n">{n}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
