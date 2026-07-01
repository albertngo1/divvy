import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Idea, IdeasFile } from "./types";
import { canonTags } from "./tags";
import { connectPresence, type PresenceHandle } from "./presence";
import Cloud, { type CloudApi } from "./components/Cloud";
import Scoreboard from "./components/Scoreboard";
import TopBar from "./components/TopBar";
import Controls from "./components/Controls";
import TagFilter from "./components/TagFilter";
import ColorKey from "./components/ColorKey";
import Tooltip from "./components/Tooltip";
import FilterBar from "./components/FilterBar";
import IdeaPanel from "./components/IdeaPanel";
import About from "./components/About";

// shallow-equal two vote-count maps, so an unchanged poll doesn't churn the cloud
function sameCounts(a: Record<string, number>, b: Record<string, number>) {
  const ak = Object.keys(a);
  if (ak.length !== Object.keys(b).length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
}

export default function App() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [lastScan, setLastScan] = useState("—");
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<Idea | null>(null);
  const [hoverY, setHoverY] = useState(0);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [votes, setVotes] = useState<Record<string, number>>({}); // net count per idea (can be negative)
  const [voted, setVoted] = useState<Record<string, number>>({}); // this browser's own votes: slug -> 1 | -1
  const [views, setViews] = useState<Record<string, number>>({}); // shared total view counts
  const [seen, setSeen] = useState<Set<string>>(() => {           // slugs THIS browser has opened
    try { return new Set<string>(JSON.parse(localStorage.getItem("divvy_seen") || "[]")); } catch { return new Set(); }
  });
  const votedRef = useRef(voted);
  votedRef.current = voted;
  const votesRef = useRef(votes);
  votesRef.current = votes;
  const cloudRef = useRef<CloudApi>(null);        // push peer cursors in imperatively
  const presenceRef = useRef<PresenceHandle | null>(null);

  // the open idea lives in the URL (?idea=<slug>) via React Router, so back/forward and
  // shared links Just Work. `selected` is derived from it; openIdea pushes a history entry.
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSlug = searchParams.get("idea");
  const selected = useMemo(
    () => (selectedSlug ? ideas.find((i) => i.slug === selectedSlug) || null : null),
    [ideas, selectedSlug],
  );
  const selectedSlugRef = useRef(selectedSlug);
  selectedSlugRef.current = selectedSlug;
  const openIdea = useCallback((idea: Idea | null) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (idea) p.set("idea", idea.slug); else p.delete("idea");
      return p;
    });
  }, [setSearchParams]);

  // realtime presence: live peer cursors + instant vote broadcasts (degrades silently
  // if the realtime Worker isn't deployed yet)
  useEffect(() => {
    const p = connectPresence({
      onPeer: (peer) => cloudRef.current?.setPeer(peer),
      onLeave: (id) => cloudRef.current?.removePeer(id),
      onVote: (slug, count) => setVotes((v) => ({ ...v, [slug]: count })),
    });
    presenceRef.current = p;
    return () => { p.close(); presenceRef.current = null; };
  }, []);

  useEffect(() => {
    fetch("./data/ideas.json", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: IdeasFile) => {
        setIdeas(Array.isArray(data.ideas) ? data.ideas : []);
        setLastScan(data.lastScan || "—");
        // a ?idea=<slug> deep link opens automatically — `selected` is derived from the URL
      })
      .catch(() => setReady(true));
  }, []);

  // opening an idea = a view: bump the shared count, and mark it seen for this browser
  useEffect(() => {
    const slug = selected?.slug;
    if (!slug) return;
    setViews((v) => ({ ...v, [slug]: (v[slug] || 0) + 1 })); // optimistic
    fetch("./api/view", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => { if (res && typeof res.count === "number") setViews((v) => ({ ...v, [slug]: res.count })); })
      .catch(() => {});
    setSeen((prev) => {
      if (prev.has(slug)) return prev;
      const n = new Set(prev); n.add(slug);
      try { localStorage.setItem("divvy_seen", JSON.stringify([...n])); } catch { /* ignore */ }
      return n;
    });
  }, [selected?.slug]);

  useEffect(() => { document.body.classList.toggle("ready", ready); }, [ready]);
  useEffect(() => { document.body.classList.toggle("panel-open", !!selected); }, [selected]);

  // Shift the top controls left ONLY by however much they'd overlap the open panel — if
  // there's already room between them, don't move at all. Recomputed on open + resize.
  useEffect(() => {
    const apply = () => {
      const el = document.getElementById("controls");
      if (!el) return;
      const vw = window.innerWidth;
      if (!selected || vw < 1024) { el.style.transform = ""; return; } // CSS handles the centered/mobile case
      const panelW = Math.min(580, vw * 0.94);
      const cw = el.getBoundingClientRect().width;      // controls sit centered; right edge = vw/2 + cw/2
      const overlap = cw / 2 + 24 + panelW - vw / 2;    // +24 desired gap; <=0 means there's already room
      const shift = Math.max(0, overlap);
      el.style.transform = `translateX(calc(-50% - ${shift}px))`;
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [selected]);

  // Live multi-user sync: poll the shared vote counts every few seconds (and on tab focus)
  // so everyone sees each other's upvotes within seconds — bubbles recolor/resize live.
  // Plenty for a handful of voters; no websockets/Durable Objects needed.
  useEffect(() => {
    let alive = true;
    const pull = (initial = false) =>
      fetch("./api/votes", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { counts: {}, mine: {} }))
        .then((data) => {
          if (!alive) return;
          const next: Record<string, number> = data.counts || {};
          setVotes((prev) => (sameCounts(prev, next) ? prev : next)); // keep ref stable if unchanged
          setViews((prev) => (sameCounts(prev, data.views || {}) ? prev : (data.views || {})));
          if (initial) setVoted(data.mine || {});
        })
        .catch(() => {});
    pull(true);
    const id = window.setInterval(() => { if (document.visibilityState === "visible") pull(); }, 5000);
    const onVis = () => { if (document.visibilityState === "visible") pull(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { alive = false; clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  // dir = +1 (up) or -1 (down); clicking the current direction again clears the vote
  const vote = useCallback((slug: string, dir: 1 | -1) => {
    const cur = votedRef.current[slug] || 0;
    const nextVal = cur === dir ? 0 : dir;
    const delta = nextVal - cur;
    setVoted((prev) => {
      const n = { ...prev };
      if (nextVal === 0) delete n[slug]; else n[slug] = nextVal;
      return n;
    });
    const optimistic = (votesRef.current[slug] || 0) + delta;
    setVotes((v) => ({ ...v, [slug]: optimistic })); // optimistic
    presenceRef.current?.sendVote(slug, optimistic); // let peers see it immediately
    fetch("./api/vote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, dir }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (!res || typeof res.count !== "number") return;
        setVotes((v) => ({ ...v, [slug]: res.count }));
        presenceRef.current?.sendVote(slug, res.count); // reconcile peers to the server count
        setVoted((prev) => {
          const n = { ...prev };
          if (res.val === 0) delete n[slug]; else n[slug] = res.val;
          return n;
        });
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
  const onSelect = useCallback((d: Idea) => openIdea(selectedSlugRef.current === d.slug ? null : d), [openIdea]);
  const onReady = useCallback(() => setReady(true), []);

  const openRandom = useCallback(() => {
    const pool = ideas.filter((d) => !dim(d));
    const arr = pool.length ? pool : ideas;
    if (arr.length) openIdea(arr[Math.floor(Math.random() * arr.length)]);
  }, [ideas, dim, openIdea]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selected) openIdea(null);
      else clearFilters();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, clearFilters, openIdea]);

  return (
    <>
      <div id="loader" className={"loader" + (ready ? " gone" : "")}>
        <div className="spinner" />
        <p>generating idea cloud…</p>
      </div>

      <TopBar count={ideas.length} lastScan={lastScan} onAbout={() => setAboutOpen(true)} />
      <About open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <Controls search={search} onSearch={setSearch} onRandom={openRandom} />

      <main id="stage">
        <Cloud
          ref={cloudRef} ideas={ideas} dim={dim} votes={votes} seen={seen}
          onHover={onHover} onSelect={onSelect} onReady={onReady}
          onCursor={(x, y) => presenceRef.current?.sendCursor(x, y)}
        />
        <Tooltip idea={hovered} votes={hovered ? votes[hovered.slug] || 0 : 0} atBottom={!!hovered && hoverY < 240} />
        <FilterBar search={search} activeTags={activeTags} visible={visibleCount} onClear={clearFilters} />
        <ColorKey />
        <Scoreboard ideas={ideas} votes={votes} views={views} onOpen={openIdea} />
      </main>

      <TagFilter ideas={ideas} activeTags={activeTags} onToggle={toggleTag} onClear={clearFilters} />
      <IdeaPanel
        idea={selected} onClose={() => openIdea(null)} onToggleTag={toggleTag} activeTags={activeTags}
        voteCount={selected ? votes[selected.slug] || 0 : 0}
        viewCount={selected ? views[selected.slug] || 0 : 0}
        myVote={selected ? voted[selected.slug] || 0 : 0}
        onVote={vote}
      />
    </>
  );
}
