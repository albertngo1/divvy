import { useCallback, useEffect, useMemo, useState } from "react";
import type { Idea, IdeasFile } from "./types";
import Cloud from "./components/Cloud";
import TopBar from "./components/TopBar";
import Controls from "./components/Controls";
import TagFilter from "./components/TagFilter";
import ColorKey from "./components/ColorKey";
import Tooltip from "./components/Tooltip";
import FilterBar from "./components/FilterBar";
import IdeaPanel from "./components/IdeaPanel";

export default function App() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [lastScan, setLastScan] = useState("—");
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Idea | null>(null);
  const [hovered, setHovered] = useState<Idea | null>(null);

  useEffect(() => {
    fetch("./data/ideas.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: IdeasFile) => {
        setIdeas(Array.isArray(data.ideas) ? data.ideas : []);
        setLastScan(data.lastScan || "—");
      })
      .catch(() => setReady(true));
  }, []);

  useEffect(() => { document.body.classList.toggle("ready", ready); }, [ready]);

  // filter predicate: a bubble is dimmed if it fails the active tags OR the search
  const dim = useCallback((d: Idea) => {
    if (activeTags.size && !(d.tags || []).some((t) => activeTags.has(t))) return true;
    const q = search.trim().toLowerCase();
    if (q && !(
      d.title.toLowerCase().includes(q) ||
      (d.hook || "").toLowerCase().includes(q) ||
      (d.tags || []).some((t) => t.toLowerCase().includes(q))
    )) return true;
    return false;
  }, [activeTags, search]);

  const visibleCount = useMemo(() => ideas.filter((d) => !dim(d)).length, [ideas, dim]);

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  }, []);
  const clearFilters = useCallback(() => { setActiveTags(new Set()); setSearch(""); }, []);

  const onHover = useCallback((d: Idea | null) => setHovered(d), []);
  const onSelect = useCallback((d: Idea) => setSelected((cur) => (cur && cur.slug === d.slug ? null : d)), []);
  const onReady = useCallback(() => setReady(true), []);

  const openRandom = useCallback(() => {
    const pool = ideas.filter((d) => !dim(d));
    const arr = pool.length ? pool : ideas;
    if (arr.length) setSelected(arr[Math.floor(Math.random() * arr.length)]);
  }, [ideas, dim]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selected) setSelected(null);
      else clearFilters();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, clearFilters]);

  return (
    <>
      <div id="loader" className={"loader" + (ready ? " gone" : "")}>
        <div className="spinner" />
        <p>generating idea cloud…</p>
      </div>

      <TopBar count={ideas.length} lastScan={lastScan} />
      <Controls search={search} onSearch={setSearch} onRandom={openRandom} />

      <main id="stage">
        <Cloud ideas={ideas} dim={dim} onHover={onHover} onSelect={onSelect} onReady={onReady} />
        <Tooltip idea={hovered} />
        <FilterBar search={search} activeTags={activeTags} visible={visibleCount} onClear={clearFilters} />
        <ColorKey />
      </main>

      <TagFilter ideas={ideas} activeTags={activeTags} onToggle={toggleTag} onClear={clearFilters} />
      <IdeaPanel idea={selected} onClose={() => setSelected(null)} onToggleTag={toggleTag} activeTags={activeTags} />
    </>
  );
}
