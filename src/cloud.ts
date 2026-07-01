import * as d3 from "d3";
import type { Idea, Node } from "./types";

export type DimPredicate = (d: Idea) => boolean;

export interface CloudHandlers {
  onHover: (d: Idea | null, clientY?: number) => void;
  onSelect: (d: Idea) => void;
  onReady?: () => void;
  onCursor?: (worldX: number, worldY: number) => void; // local cursor moved (world coords)
}

export interface CloudPeer { id: string; name: string; color: string; x: number; y: number; }

export interface CloudHandle {
  setDim: (pred: DimPredicate) => void;
  setVotes: (v: Record<string, number>) => void;
  setSeen: (seen: Set<string>) => void; // mark which bubbles this browser has opened
  setPeer: (p: CloudPeer) => void;   // upsert a remote cursor
  removePeer: (id: string) => void;  // peer left
  destroy: () => void;
}

// ---- color === "heat" (AI score + upvotes, votes weighted higher), spread by
// percentile rank so the full cool-blue → warm-amber spectrum is always used. Raw AI
// scores cluster high (everything looks "good"), so ranking spreads them apart. ----
// Stellar temperature convention (fits the sun/galaxy theme): coolest = red, hottest = blue.
const HUE_LOW = 18;   // lowest-ranked idea → red (cool star)
const HUE_HIGH = 220; // highest-ranked idea → blue-white (hot star)
const hueBySlug = new Map<string, number>(); // populated by the live cloud's paint()

function scoreHue(score: number): number {
  // fallback used before the cloud has ranked everything (e.g. no distribution yet)
  const s = Math.max(30, Math.min(90, Number.isFinite(score) ? score : 55));
  return HUE_LOW - ((s - 30) / 60) * (HUE_LOW - HUE_HIGH);
}
const hueOf = (d: Idea) => hueBySlug.get(d.slug) ?? scoreHue(d.score);
const colorOf = (d: Idea) => `hsl(${hueOf(d)}, 74%, 62%)`;
const colorAlpha = (d: Idea, a: number) => `hsla(${hueOf(d)}, 74%, 62%, ${a})`;

function radiusFor(score: number, n: number): number {
  const s = Number.isFinite(score) ? score : 50;
  const base = 36 + (Math.max(0, Math.min(100, s)) / 100) * 58;
  const scale = Math.min(1, Math.sqrt(70 / Math.max(n || 1, 1)));
  return Math.max(15, base * scale);
}

// fit the title inside the circle
function fitText(el: SVGTextElement, d: Node) {
  const t = d3.select(el);
  const r = d.r;
  const words = String(d.title).split(/\s+/);
  const maxLines = r < 46 ? 2 : r < 72 ? 3 : 4;
  const padW = r * 1.42;
  const padH = r * 1.32;
  let fs = Math.min(16, Math.max(9, r * 0.29));
  let lines: string[] = [];
  while (true) {
    const maxChars = Math.max(3, Math.floor(padW / (fs * 0.6)));
    lines = [];
    let cur = "";
    for (const w of words) {
      if (cur && (cur + " " + w).length > maxChars) { lines.push(cur); cur = w; }
      else cur = cur ? cur + " " + w : w;
    }
    if (cur) lines.push(cur);
    const lineH = fs * 1.08;
    if ((lines.length <= maxLines && lines.length * lineH <= padH) || fs <= 8.5) {
      if (lines.length > maxLines) {
        const kept = lines.slice(0, maxLines);
        kept[maxLines - 1] = kept[maxLines - 1].slice(0, Math.max(1, maxChars - 1)) + "…";
        lines = kept;
      }
      break;
    }
    fs -= 1;
  }
  const lineH = fs * 1.08;
  t.text(null);
  const y0 = -((lines.length - 1) * lineH) / 2;
  lines.forEach((ln, i) => {
    t.append("tspan").attr("x", 0).attr("y", y0 + i * lineH).attr("font-size", fs.toFixed(1)).text(ln);
  });
}

export function createCloud(svgEl: SVGSVGElement, ideas: Idea[], handlers: CloudHandlers): CloudHandle {
  let width = window.innerWidth;
  let height = window.innerHeight;
  const svg = d3.select(svgEl);
  svg.selectAll("*").remove();

  // seed a spread sunflower layout so the initial settle only refines spacing
  const nodes: Node[] = ideas.map((d, i) => {
    const angle = i * 2.3999632;
    const rr = 22 * Math.sqrt(i + 0.5);
    const r0 = radiusFor(d.score, ideas.length);
    return {
      ...d, r: r0, _baseR: r0, _ph: i * 1.7,
      x: width / 2 + rr * Math.cos(angle),
      y: height / 2 + rr * Math.sin(angle),
    };
  });

  // --- galaxies: cluster ideas by DOMAIN (what the idea is about), not source/medium ---
  const DOMAINS: { name: string; tags: string[] }[] = [
    { name: "games", tags: ["game", "games", "gamedev", "roguelike", "deckbuilder", "arpg", "autobattler", "idle", "tycoon", "sim", "management-sim", "farm-sim", "cozy-sim", "pet-sim", "procedural", "procgen", "permadeath", "speedrun", "browser-game", "party-game", "field-game", "racer", "crpg", "survival", "survival-horror", "horror", "fantasy", "grimdark", "sandbox", "puzzle", "physics-puzzle", "stealth-puzzle", "daily-game", "wordgame", "guessing", "geoguess", "teardown-sim", "trucking-sim", "detective", "narrative"] },
    { name: "data viz", tags: ["data-viz", "dataviz", "map", "animated-map", "choropleth", "glyph-small-multiples", "spatial-join", "polar-clock", "timeline-tower", "silhouette-ribbons", "map-pillar", "map-spectrogram", "3d-viz", "playable-data", "gis", "osm"] },
    { name: "dev & ops", tags: ["devtool", "devtools", "git", "ci", "docker", "kubernetes", "rust", "sql", "postgres", "code", "code-review", "refactor", "testing", "coverage", "homelab", "sysadmin", "ops", "self-hosted", "incident", "logs", "telemetry", "cron", "dns", "bandwidth", "processes", "assembly", "ast", "reverse-engineering", "engineering", "hardware", "teardown", "inspection"] },
    { name: "ai & ml", tags: ["llm", "ml", "language-model", "agents", "agent-loop", "prompt-craft", "turing-test", "perplexity", "ai-forensics"] },
    { name: "science & nature", tags: ["science", "physics", "physics-toy", "audio-physics", "astronomy", "geology", "nature", "mycology", "materials", "dendro", "morphogen", "cellular-automata", "phenology-drift", "entropy", "radar", "sonar", "computer-vision", "color-science", "biometrics"] },
    { name: "finance", tags: ["finance", "economics", "economy", "prediction-market", "prediction", "risk-reward"] },
    { name: "language & text", tags: ["language", "nlp", "corporate-linguistics", "literary-rhythm", "wordgame", "unicode", "steganography", "japanese", "ocr", "compression"] },
    { name: "art & sound", tags: ["generative", "generative-art", "art", "canvas", "webgl", "graphics", "three-js", "wallpaper", "screensaver", "color", "animation", "audio", "audio-waveform-grid", "generative-music", "rhythm", "pop-music", "webaudio", "morse"] },
    { name: "life & self", tags: ["productivity", "calendar", "contacts", "email", "focus", "quantified-self", "self-tracking", "chores", "receipts", "relationships", "roommates", "care-sim", "wearable", "sleep", "treadmill", "strava", "location"] },
    { name: "ambient & toys", tags: ["ambient", "ambient-dashboard", "whimsy", "desktop-toy", "desktop", "menubar", "macos", "tamagotchi", "systems-toy", "ritual", "memento-mori", "screensaver"] },
    { name: "social & party", tags: ["social", "party", "multiplayer", "coop", "co-op", "deduction", "social-deduction", "competitive", "leaderboard", "matchmaking", "fantasy-league", "voting", "community", "party-game"] },
    { name: "security & privacy", tags: ["security", "privacy", "forensics", "anti-cheat", "adtech", "provenance", "heritage", "identification"] },
  ];
  const domTag = new Map<string, string>();
  DOMAINS.forEach((dom) => dom.tags.forEach((t) => { if (!domTag.has(t)) domTag.set(t, dom.name); }));
  nodes.forEach((d) => {
    const score: Record<string, number> = {};
    (d.tags || []).forEach((t) => { const dom = domTag.get(t); if (dom) score[dom] = (score[dom] || 0) + 1; });
    let best = "other", bestC = 0;
    for (const [dom, c] of Object.entries(score)) if (c > bestC) { bestC = c; best = dom; }
    d.galaxy = best;
  });
  const galaxyKeys = DOMAINS.map((d) => d.name).filter((g) => nodes.some((n) => n.galaxy === g));
  if (nodes.some((n) => n.galaxy === "other")) galaxyKeys.push("other");
  // Give each galaxy a packing radius from its members, then lay the galaxies out as
  // NON-OVERLAPPING blobs via a mini force-sim on the cluster centers — so the clusters
  // read as separate islands with whitespace between, not one continuous ring.
  // Each galaxy is a big central "sun", an empty GAP, then a ring/band of orbiting ideas
  // (Saturn-style). Size the sun by member count, leave the gap, and give the cluster an
  // outer radius that holds the ideas' packed area in the annulus beyond the gap.
  const GAP = 52; // empty space between a sun's edge and the innermost ideas (the "ring gap")
  const gmembers: Record<string, Node[]> = {};
  nodes.forEach((d) => (gmembers[d.galaxy!] = gmembers[d.galaxy!] || []).push(d));
  const clusterR: Record<string, number> = {};
  const sunR: Record<string, number> = {};
  const ringInner: Record<string, number> = {}; // sun center → inner edge of the ring (gap boundary)
  const orbitR: Record<string, number> = {};    // sun center → the ring band the ideas hug
  galaxyKeys.forEach((gk) => {
    const mem = gmembers[gk];
    const area = mem.reduce((s, m) => s + Math.PI * (m.r + 5) * (m.r + 5), 0);
    sunR[gk] = Math.max(44, Math.min(96, 36 + Math.sqrt(mem.length) * 8));
    const inner = sunR[gk] + GAP;
    ringInner[gk] = inner;
    const outer = Math.sqrt(inner * inner + area / Math.PI); // annulus that holds the ideas
    orbitR[gk] = (inner + outer) / 2; // middle of the band
    clusterR[gk] = outer * 1.12 + 34; // + whitespace between galaxies
  });
  const seedR = Math.min(width, height) * 0.5;
  const centers = galaxyKeys.map((gk, i) => {
    const a = (i / galaxyKeys.length) * 2 * Math.PI - Math.PI / 2;
    return { gk, r: clusterR[gk], x: width / 2 + seedR * Math.cos(a), y: height / 2 + seedR * Math.sin(a) };
  });
  const SPREAD = 1.5; // extra whitespace between galaxies (collide radius > actual cluster radius)
  d3.forceSimulation(centers as unknown as d3.SimulationNodeDatum[])
    .force("collide", d3.forceCollide<{ r: number } & d3.SimulationNodeDatum>((c) => c.r * SPREAD).strength(1).iterations(8))
    .force("x", d3.forceX(width / 2).strength(0.05))
    .force("y", d3.forceY(height / 2).strength(0.05))
    .stop()
    .tick(320);
  const gpos: Record<string, { x: number; y: number }> = {};
  centers.forEach((c) => { gpos[c.gk] = { x: c.x, y: c.y }; });
  // seed each idea in the ring (annulus beyond the gap) so the settle only tightens packing
  nodes.forEach((d) => {
    const p = gpos[d.galaxy!];
    const inner = ringInner[d.galaxy!] + d.r;
    const rr = inner + Math.sqrt(Math.random()) * Math.max(0, clusterR[d.galaxy!] - inner);
    const a = Math.random() * 2 * Math.PI;
    d.x = p.x + rr * Math.cos(a); d.y = p.y + rr * Math.sin(a);
  });

  // gradient + glow defs, one per node (score-hued)
  const defs = svg.append("defs");
  const neb = defs.append("radialGradient").attr("id", "nebula-grad").attr("cx", "0.5").attr("cy", "0.5").attr("r", "0.5");
  neb.append("stop").attr("offset", "0%").attr("stop-color", "rgba(130,150,255,0.10)");
  neb.append("stop").attr("offset", "68%").attr("stop-color", "rgba(120,140,255,0.035)");
  neb.append("stop").attr("offset", "100%").attr("stop-color", "rgba(120,140,255,0)");
  const sunGlow = defs.append("radialGradient").attr("id", "sun-grad").attr("cx", "0.5").attr("cy", "0.5").attr("r", "0.5");
  sunGlow.append("stop").attr("offset", "0%").attr("stop-color", "rgba(255,247,224,0.85)");
  sunGlow.append("stop").attr("offset", "45%").attr("stop-color", "rgba(255,222,158,0.4)");
  sunGlow.append("stop").attr("offset", "100%").attr("stop-color", "rgba(255,205,130,0)");
  // the sun's solid "bubble" body (warm, with a defined edge) — distinct from the cool ideas
  const sunBody = defs.append("radialGradient").attr("id", "sun-body-grad").attr("cx", "0.38").attr("cy", "0.33").attr("r", "0.75");
  sunBody.append("stop").attr("offset", "0%").attr("stop-color", "rgba(255,250,236,0.96)");
  sunBody.append("stop").attr("offset", "55%").attr("stop-color", "rgba(255,223,150,0.5)");
  sunBody.append("stop").attr("offset", "100%").attr("stop-color", "rgba(250,198,120,0.22)");
  // per-node body gradient + glow; their stop colors are recolored live by paint()
  const GRAD_STOPS = [{ o: "0%", a: 0.5 }, { o: "55%", a: 0.16 }, { o: "100%", a: 0.05 }];
  const GLOW_STOPS = [{ o: "0%", a: 0.4 }, { o: "62%", a: 0.1 }, { o: "100%", a: 0 }];
  type StopSel = d3.Selection<SVGStopElement, unknown, SVGRadialGradientElement, unknown>;
  const gradStops = new Map<string, StopSel>();
  const glowStops = new Map<string, StopSel>();
  nodes.forEach((d) => {
    const grad = defs.append("radialGradient").attr("id", `grad-${d.slug}`).attr("cx", "0.35").attr("cy", "0.3").attr("r", "0.85");
    GRAD_STOPS.forEach((s) => grad.append("stop").attr("offset", s.o));
    const glow = defs.append("radialGradient").attr("id", `glow-${d.slug}`).attr("cx", "0.5").attr("cy", "0.5").attr("r", "0.5");
    GLOW_STOPS.forEach((s) => glow.append("stop").attr("offset", s.o));
    gradStops.set(d.slug, grad.selectAll<SVGStopElement, unknown>("stop"));
    glowStops.set(d.slug, glow.selectAll<SVGStopElement, unknown>("stop"));
  });

  // Each idea orbits its galaxy's sun: a firm outward floor keeps the whole bubble beyond
  // the gap (so the center stays empty), and a gentle pull hugs it toward the ring band
  // (so the cluster stays compact and doesn't drift into its neighbours). No center pull —
  // that was collapsing the gap by dragging bubbles onto the sun.
  const orbit = (alpha: number) => {
    for (const d of nodes) {
      const c = gpos[d.galaxy!];
      const dx = d.x - c.x, dy = d.y - c.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      const ux = dx / dist, uy = dy / dist;
      const floor = ringInner[d.galaxy!] + d.r; // whole bubble stays outside the gap
      if (dist < floor) {
        const push = (floor - dist) * alpha; // firm floor
        d.vx = (d.vx || 0) + ux * push;
        d.vy = (d.vy || 0) + uy * push;
      } else {
        const pull = (orbitR[d.galaxy!] - dist) * 0.12 * alpha; // gentle hug toward the band
        d.vx = (d.vx || 0) + ux * pull;
        d.vy = (d.vy || 0) + uy * pull;
      }
    }
  };

  const sim = d3.forceSimulation<Node>(nodes)
    .force("collide", d3.forceCollide<Node>().radius((d) => d.r + 3).strength(1).iterations(4))
    .force("orbit", orbit)
    .alphaDecay(0.03);

  const viewport = svg.append("g").attr("class", "viewport");
  const galaxyG = viewport.append("g").attr("class", "galaxies"); // nebula discs, backmost
  const linkG = viewport.append("g").attr("class", "links");
  const sunG = viewport.append("g").attr("class", "suns"); // stars sit above links, below ideas

  const g = viewport.selectAll<SVGGElement, Node>("g.bubble")
    .data(nodes, (d) => d.slug)
    .join("g")
    .attr("class", "bubble")
    .on("click", (_e, d) => handlers.onSelect(d))
    .on("mouseenter", (e: MouseEvent, d) => handlers.onHover(d, e.clientY))
    .on("mouseleave", () => handlers.onHover(null));

  g.append("circle").attr("class", "halo").attr("r", (d) => d.r * 1.5)
    .attr("fill", (d) => `url(#glow-${d.slug})`).style("pointer-events", "none");
  g.append("circle").attr("class", "body").attr("r", (d) => d.r)
    .attr("fill", (d) => `url(#grad-${d.slug})`)
    .attr("stroke", (d) => colorAlpha(d, 0.85)).attr("stroke-width", 1.4);
  g.append("text").each(function (this: SVGTextElement, d) { fitText(this, d); });
  // "unseen" pip (top-right); hidden once the bubble is marked seen
  g.append("circle").attr("class", "newpip").attr("r", 4)
    .attr("cx", (d) => d.r * 0.72).attr("cy", (d) => -d.r * 0.72).style("pointer-events", "none");

  // recolor every bubble from its "heat" (AI score + weighted upvotes), spread by
  // percentile rank so the spectrum is fully used. Cheap enough to re-run on each vote.
  let curVotes: Record<string, number> = {};
  function paint() {
    const scoreOf = (n: Node) => (Number.isFinite(n.score) ? n.score : 50);
    // single pass (spreading a huge array into Math.min/max would blow the arg limit as the cloud grows)
    let minS = Infinity, maxS = -Infinity;
    for (const n of nodes) {
      const s = scoreOf(n);
      if (s < minS) minS = s;
      if (s > maxS) maxS = s;
    }
    // heat = normalized AI score (0-1) + a big absolute bump per upvote. With only a
    // handful of voters, each vote outweighs the whole score range, so ANY upvoted idea
    // jumps to the hot end of the spectrum — votes clearly dominate.
    const heat = new Map<string, number>();
    nodes.forEach((n) => {
      const ns = maxS > minS ? (scoreOf(n) - minS) / (maxS - minS) : 0.5;
      heat.set(n.slug, ns + 2 * (curVotes[n.slug] || 0));
    });
    const order = [...nodes].sort((a, b) => heat.get(a.slug)! - heat.get(b.slug)!);
    const last = Math.max(1, order.length - 1);
    order.forEach((n, i) => { n._hue = HUE_LOW - (i / last) * (HUE_LOW - HUE_HIGH); n._p = i / last; });
    nodes.forEach((n) => {
      const h = n._hue!;
      const p = n._p ?? 0.5;
      const shine = 0.82 + 0.55 * p; // subtle: hotter ideas glow a little brighter to catch the eye
      hueBySlug.set(n.slug, h);
      gradStops.get(n.slug)!.each(function (_d, i) { d3.select(this).attr("stop-color", `hsla(${h},74%,62%,${GRAD_STOPS[i].a})`); });
      glowStops.get(n.slug)!.each(function (_d, i) { d3.select(this).attr("stop-color", `hsla(${h},76%,64%,${(GLOW_STOPS[i].a * shine).toFixed(3)})`); });
    });
    g.selectAll<SVGCircleElement, Node>("circle.halo").attr("r", (n) => n.r * (1.4 + (n._p ?? 0.5) * 0.5));
    g.selectAll<SVGCircleElement, Node>("circle.body").attr("stroke", (n) => `hsla(${n._hue},74%,62%,${(0.7 + 0.3 * (n._p ?? 0.5)).toFixed(2)})`);
  }

  // upvotes visibly grow the bubble too (+16% radius each, capped) — high impact for a few voters
  const VOTE_SIZE = 0.16;
  function resize() {
    let changed = false;
    for (const n of nodes) {
      const v = Math.max(-4, Math.min(8, curVotes[n.slug] || 0)); // downvotes shrink, upvotes grow
      const nr = n._baseR! * Math.max(0.55, 1 + VOTE_SIZE * v);
      if (Math.abs(nr - n.r) > 0.5) { n.r = nr; changed = true; }
    }
    if (!changed) return;
    g.select<SVGCircleElement>("circle.halo").attr("r", (d) => d.r * 1.5);
    g.select<SVGCircleElement>("circle.body").attr("r", (d) => d.r);
    g.select<SVGCircleElement>("circle.newpip").attr("cx", (d) => d.r * 0.72).attr("cy", (d) => -d.r * 0.72);
    g.select<SVGTextElement>("text").each(function (this: SVGTextElement, d) { fitText(this, d); });
    sim.alpha(0.4).restart(); // let collide re-space around the grown bubbles
  }
  paint();

  const drag = d3.drag<SVGGElement, Node>()
    .clickDistance(12)
    .on("start", (event, d) => { if (event.sourceEvent) event.sourceEvent.stopPropagation(); d.fx = d.x; d.fy = d.y; })
    .on("drag", (event, d) => { sim.alphaTarget(0.35).restart(); d.fx = event.x; d.fy = event.y; })
    .on("end", () => { sim.alphaTarget(0).alpha(0.35).restart(); });
  g.call(drag);

  // --- live cursors overlay (topmost, drawn in world coords so they track pan/zoom) ---
  interface Peer { id: string; name: string; color: string; x: number; y: number; }
  const cursorsG = viewport.append("g").attr("class", "cursors").style("pointer-events", "none");
  const peerMap = new Map<string, Peer>();
  const CURSOR_PATH = "M0 0 L0 15 L4 11.5 L6.6 17.2 L8.7 16.2 L6.1 10.6 L11 10.4 Z";
  function renderCursors() {
    const k = d3.zoomTransform(svgEl).k || 1;
    const sel = cursorsG.selectAll<SVGGElement, Peer>("g.cursor").data([...peerMap.values()], (d) => d.id);
    const ent = sel.enter().append("g").attr("class", "cursor");
    ent.append("path").attr("class", "cursor-arrow").attr("d", CURSOR_PATH);
    ent.append("text").attr("class", "cursor-name").attr("x", 14).attr("y", 13);
    sel.exit().remove();
    const all = ent.merge(sel);
    all.attr("transform", (d) => `translate(${d.x},${d.y}) scale(${1 / k})`); // constant on-screen size
    all.select<SVGPathElement>(".cursor-arrow").attr("fill", (d) => d.color);
    all.select<SVGTextElement>(".cursor-name").attr("fill", (d) => d.color).text((d) => d.name);
  }

  const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.02, 4])
    .on("zoom", (event) => { viewport.attr("transform", event.transform.toString()); renderCursors(); });
  svg.call(zoom).on("dblclick.zoom", null);

  // stream this browser's cursor (in world coords) to peers, throttled
  let lastCursor = 0;
  svg.on("mousemove.cursor", (event: MouseEvent) => {
    if (!handlers.onCursor) return;
    const now = event.timeStamp;
    if (now - lastCursor < 45) return;
    lastCursor = now;
    const [lx, ly] = d3.pointer(event, svgEl);
    const [wx, wy] = d3.zoomTransform(svgEl).invert([lx, ly]);
    handlers.onCursor(wx, wy);
  });

  // pre-settle synchronously
  sim.stop();
  for (let i = 0; i < 360; i++) sim.tick();

  // fit the settled cloud into view
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach((d) => {
    minX = Math.min(minX, d.x - d.r); maxX = Math.max(maxX, d.x + d.r);
    minY = Math.min(minY, d.y - d.r); maxY = Math.max(maxY, d.y + d.r);
  });
  const pad = width < 640 ? 24 : 80;
  const k = Math.max(0.15, Math.min(1, (width - pad) / (maxX - minX), (height - pad) / (maxY - minY)));
  const tx = width / 2 - (k * (minX + maxX)) / 2;
  const ty = height / 2 - (k * (minY + maxY)) / 2;
  svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(k));

  // faint nebula disc behind each galaxy so the clusters read at a glance
  galaxyG.selectAll("circle.nebula").data(galaxyKeys).join("circle")
    .attr("class", "nebula")
    .attr("cx", (gk) => gpos[gk].x).attr("cy", (gk) => gpos[gk].y)
    .attr("r", (gk) => clusterR[gk] * 0.94)
    .attr("fill", "url(#nebula-grad)")
    .style("pointer-events", "none");

  // each galaxy's "sun": a big uninteractable bubble the ideas ring around, naming its domain
  const suns = sunG.selectAll<SVGGElement, string>("g.sun").data(galaxyKeys).join("g")
    .attr("class", "sun")
    .attr("transform", (gk) => `translate(${gpos[gk].x},${gpos[gk].y})`)
    .style("pointer-events", "none");
  suns.append("circle").attr("class", "sun-halo").attr("r", (gk) => sunR[gk] * 1.5).attr("fill", "url(#sun-grad)");
  suns.append("circle").attr("class", "sun-body").attr("r", (gk) => sunR[gk]).attr("fill", "url(#sun-body-grad)");
  suns.append("text").attr("class", "sun-label").attr("text-anchor", "middle").attr("dy", "0.32em").text((gk) => gk);

  // a faint spoke from each idea to its galaxy's sun — rays toward the domain, never across
  // galaxies. The inner end tucks behind the sun (linkG sits below sunG), so it reads as a ray.
  const linkSel = linkG.selectAll<SVGLineElement, Node>("line").data(nodes, (d) => d.slug).join("line").attr("class", "link");

  let dimPred: DimPredicate = () => false;
  function applyDim() {
    g.classed("dim", (d) => dimPred(d));
    linkSel.style("opacity", (d) => (dimPred(d) ? 0.1 : 1));
  }

  // WASD / arrow keys pan the viewport (each vector nudges the camera; applied per frame)
  const panKeys = new Set<string>();
  const PAN_MAP: Record<string, [number, number]> = {
    arrowup: [0, 1], w: [0, 1], arrowdown: [0, -1], s: [0, -1],
    arrowleft: [1, 0], a: [1, 0], arrowright: [-1, 0], d: [-1, 0],
  };
  const isTyping = (el: EventTarget | null) => {
    const t = el as HTMLElement | null;
    return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
    const k = e.key.toLowerCase();
    if (!PAN_MAP[k]) return;
    e.preventDefault();
    panKeys.add(k);
  };
  const onKeyUp = (e: KeyboardEvent) => { panKeys.delete(e.key.toLowerCase()); };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  // The static (sun) end of each spoke never moves — set it once, not every frame.
  linkSel.attr("x2", (d) => gpos[d.galaxy!].x).attr("y2", (d) => gpos[d.galaxy!].y);
  // Cache raw DOM nodes (parallel to `nodes`) so the hot loop bypasses d3's per-element
  // machinery, and place everything once so culled/offscreen bubbles still sit correctly.
  const gEls = g.nodes();
  const lineEls = linkSel.nodes();
  for (let i = 0; i < nodes.length; i++) {
    const d = nodes[i];
    d._rx = d.x; d._ry = d.y;
    gEls[i].setAttribute("transform", `translate(${d.x},${d.y})`);
    lineEls[i].setAttribute("x1", `${d.x}`); lineEls[i].setAttribute("y1", `${d.y}`);
  }

  // On phones / coarse pointers, skip the continuous ambient wobble (it's the main per-frame
  // cost). There we only redraw while the sim is actively moving (drag/settle) or panning.
  const reduceMotion = window.matchMedia?.("(pointer: coarse)")?.matches || window.innerWidth <= 640;

  let raf = 0;
  let lastWobble = 0;
  function floatFrame(ts: number) {
    // pan every frame so key-held panning stays smooth
    if (panKeys.size) {
      let dx = 0, dy = 0;
      panKeys.forEach((k) => { dx += PAN_MAP[k][0]; dy += PAN_MAP[k][1]; });
      if (dx || dy) {
        const step = 7 / d3.zoomTransform(svgEl).k; // constant on-screen speed at any zoom
        svg.call(zoom.translateBy, dx * step, dy * step);
      }
    }
    // draw at ~33fps, viewport-culled. On reduced-motion, only when something's actually moving.
    const shouldDraw = !reduceMotion || sim.alpha() > 0.02 || panKeys.size > 0;
    if (shouldDraw && ts - lastWobble >= 30) {
      lastWobble = ts;
      const t = ts / 1000;
      const tf = d3.zoomTransform(svgEl);
      const pad = 90 / tf.k;
      const [vx0, vy0] = tf.invert([0, 0]);
      const [vx1, vy1] = tf.invert([width, height]);
      const minX = vx0 - pad, minY = vy0 - pad, maxX = vx1 + pad, maxY = vy1 + pad;
      for (let i = 0; i < nodes.length; i++) {
        const d = nodes[i];
        if (d.x < minX || d.x > maxX || d.y < minY || d.y > maxY) continue; // offscreen → skip
        let rx = d.x, ry = d.y;
        if (!reduceMotion) {
          const sx = 0.45 + (d._ph % 0.7);
          const sy = 0.4 + ((d._ph * 1.3) % 0.7);
          rx = d.x + Math.sin(t * sx + d._ph) * 8;
          ry = d.y + Math.cos(t * sy + d._ph * 1.3) * 7;
        }
        d._rx = rx; d._ry = ry;
        gEls[i].setAttribute("transform", `translate(${rx},${ry})`);
        lineEls[i].setAttribute("x1", `${rx}`); lineEls[i].setAttribute("y1", `${ry}`);
      }
    }
    raf = requestAnimationFrame(floatFrame);
  }
  raf = requestAnimationFrame(floatFrame);

  const onResize = () => { width = window.innerWidth; height = window.innerHeight; };
  window.addEventListener("resize", onResize);

  handlers.onReady?.();

  return {
    setDim(pred: DimPredicate) { dimPred = pred; applyDim(); },
    setVotes(v: Record<string, number>) { curVotes = v || {}; resize(); paint(); },
    setSeen(seen: Set<string>) { g.classed("seen", (d) => seen.has(d.slug)); },
    setPeer(p: CloudPeer) {
      const ex = peerMap.get(p.id);
      if (ex) { ex.x = p.x; ex.y = p.y; if (p.name) ex.name = p.name; if (p.color) ex.color = p.color; }
      else peerMap.set(p.id, { id: p.id, x: p.x, y: p.y, name: p.name || "someone", color: p.color || "#8ab4ff" });
      renderCursors();
    },
    removePeer(id: string) { peerMap.delete(id); renderCursors(); },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      svg.on("mousemove.cursor", null);
      sim.stop();
      hueBySlug.clear();
      svg.selectAll("*").remove();
    },
  };
}

export { colorOf, colorAlpha };
