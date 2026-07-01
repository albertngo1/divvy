import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Idea, IdeasFile } from "./types";
import { canonTags } from "./tags";
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
  const [hoverY, setHoverY] = useState(0);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<Set<string>>(new Set()); // server-authoritative (anon cookie identity)
  const votedRef = useRef(voted);
  votedRef.current = voted;

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

  // load vote counts + which slugs this browser has voted (degrades to empty if backend unwired)
  useEffect(() => {
    fetch("./api/votes", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { counts: {}, voted: [] }))
      .then((data) => { setVotes(data.counts || {}); setVoted(new Set<string>(data.voted || [])); })
      .catch(() => {});
  }, []);

  const upvote = useCallback((slug: string) => {
    const has = votedRef.current.has(slug);
    const next = new Set(votedRef.current);
    has ? next.delete(slug) : next.add(slug);
    setVoted(next);
    setVotes((v) => ({ ...v, [slug]: Math.max(0, (v[slug] || 0) + (has ? -1 : 1)) })); // optimistic
    fetch("./api/vote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (!res || typeof res.count !== "number") return;
        setVotes((v) => ({ ...v, [slug]: res.count }));
        setVoted((prev) => { const s = new Set(prev); res.voted ? s.add(slug) : s.delete(slug); return s; });
      })
      .catch(() => { /* keep optimistic value */ });
  }, []);

  // filter predicate: a bubble is dimmed if it fails the active tags OR the search
  const dim = useCallback((d: Idea) => {
    const tags = canonTags(d.tags);
    if (activeTags.size && !tags.some((t) => activeTags.has(t))) return true;
    const q = search.trim().toLowerCase();
    if (q && !(
      d.title.toLowerCase().includes(q) ||
      (d.hook || "").toLowerCase().includes(q) ||
      tags.some((t) => t.includes(q))
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

  const onHover = useCallback((d: Idea | null, y?: number) => { setHovered(d); if (d && typeof y === "number") setHoverY(y); }, []);
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
        <Cloud ideas={ideas} dim={dim} votes={votes} onHover={onHover} onSelect={onSelect} onReady={onReady} />
        <Tooltip idea={hovered} votes={hovered ? votes[hovered.slug] || 0 : 0} atBottom={!!hovered && hoverY < 240} />
        <FilterBar search={search} activeTags={activeTags} visible={visibleCount} onClear={clearFilters} />
        <ColorKey />
      </main>

      <TagFilter ideas={ideas} activeTags={activeTags} onToggle={toggleTag} onClear={clearFilters} />
      <IdeaPanel
        idea={selected} onClose={() => setSelected(null)} onToggleTag={toggleTag} activeTags={activeTags}
        voteCount={selected ? votes[selected.slug] || 0 : 0}
        hasVoted={selected ? voted.has(selected.slug) : false}
        onUpvote={upvote}
      />
    </>
  );
}
