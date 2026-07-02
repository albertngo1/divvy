import * as d3 from "d3";
import type { Idea, Node } from "./types";

export type DimPredicate = (d: Idea) => boolean;

export interface CloudHandlers {
  onHover: (d: Idea | null, clientY?: number) => void;
  onSelect: (d: Idea) => void;
  onReady?: () => void;
  onCursor?: (worldX: number, worldY: number) => void; // local cursor moved (world coords)
  onView?: (x: number, y: number, k: number) => void;  // pan/zoom transform changed (for parallax bg)
}

export interface CloudPeer { id: string; name: string; color: string; x: number; y: number; }

export interface CloudHandle {
  setDim: (pred: DimPredicate) => void;
  setVotes: (v: Record<string, number>) => void;
  setSeen: (seen: Set<string>) => void; // mark which bubbles this browser has opened
  setPeer: (p: CloudPeer) => void;   // upsert a remote cursor
  removePeer: (id: string) => void;  // peer left
  setPaused: (v: boolean) => void;   // freeze the render loop (e.g. while the PRD panel is open)
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

// ---- canvas text: wrap a title to fit inside its circle, pick a font size. Mirrors the
// old SVG fitText but measures with the 2D context. Result cached on the node (keyed by r). ----
const BUBBLE_FONT = '600 %FSpx "Inter", system-ui, -apple-system, sans-serif';
function fitLines(ctx: CanvasRenderingContext2D, d: Node): { lines: string[]; fs: number } {
  const r = d.r;
  const words = String(d.title).split(/\s+/);
  const maxLines = r < 46 ? 2 : r < 72 ? 3 : 4;
  const padW = r * 1.42;
  const padH = r * 1.32;
  let fs = Math.min(16, Math.max(9, r * 0.29));
  let lines: string[] = [];
  while (true) {
    ctx.font = BUBBLE_FONT.replace("%FS", fs.toFixed(1));
    lines = [];
    let cur = "";
    for (const w of words) {
      const trial = cur ? cur + " " + w : w;
      if (cur && ctx.measureText(trial).width > padW) { lines.push(cur); cur = w; }
      else cur = trial;
    }
    if (cur) lines.push(cur);
    const lineH = fs * 1.08;
    if ((lines.length <= maxLines && lines.length * lineH <= padH) || fs <= 8.5) {
      if (lines.length > maxLines) {
        const kept = lines.slice(0, maxLines);
        let last = kept[maxLines - 1];
        while (last.length > 1 && ctx.measureText(last + "…").width > padW) last = last.slice(0, -1);
        kept[maxLines - 1] = last + "…";
        lines = kept;
      }
      break;
    }
    fs -= 1;
  }
  return { lines, fs };
}

export function createCloud(canvasEl: HTMLCanvasElement, ideas: Idea[], handlers: CloudHandlers): CloudHandle {
  let width = window.innerWidth;
  let height = window.innerHeight;
  const ctx = canvasEl.getContext("2d")!;
  let dpr = Math.min(2, window.devicePixelRatio || 1);
  function sizeCanvas() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvasEl.width = Math.round(width * dpr);
    canvasEl.height = Math.round(height * dpr);
    canvasEl.style.width = width + "px";
    canvasEl.style.height = height + "px";
  }
  sizeCanvas();

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
    { name: "business & work", tags: ["business", "saas", "marketplace", "b2b", "startup", "monetization", "logistics", "crm", "automation", "ops-tool", "side-hustle"] },
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

  // Each idea orbits its galaxy's sun: a firm outward floor keeps the whole bubble beyond
  // the gap (so the center stays empty), and a gentle pull hugs it toward the ring band.
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
    .alphaDecay(0.03)
    .on("tick", () => wake());

  // ---- view transform (pan/zoom). d3-zoom owns it on the canvas element; we read it back. ----
  let transform = d3.zoomIdentity;

  // ---- animation-loop state (declared early: paint()/tick call wake() during setup) ----
  const IDLE_MS = 4000;   // freeze the wobble after this long with no interaction
  const FRAME_MS = 30;    // ~33fps cap for the ambient redraw
  let raf = 0;
  let running = false;
  let paused = false;   // panel open etc. — suppress the ambient wobble (interactions still draw)
  let wobbleAmp = 1;    // ambient-wobble amplitude, eased 1↔0 so motion settles/resumes smoothly
  let lastFrame = 0;
  let lastActivity = performance.now();
  function wake() {
    lastActivity = performance.now();
    if (!running) { running = true; raf = requestAnimationFrame(frame); }
  }

  // ---- heat coloring: recompute each node's hue + rank fraction from AI score + votes ----
  let curVotes: Record<string, number> = {};
  function paint() {
    const scoreOf = (n: Node) => (Number.isFinite(n.score) ? n.score : 50);
    let minS = Infinity, maxS = -Infinity;
    for (const n of nodes) {
      const s = scoreOf(n);
      if (s < minS) minS = s;
      if (s > maxS) maxS = s;
    }
    const heat = new Map<string, number>();
    nodes.forEach((n) => {
      const ns = maxS > minS ? (scoreOf(n) - minS) / (maxS - minS) : 0.5;
      heat.set(n.slug, ns + 2 * (curVotes[n.slug] || 0));
    });
    const order = [...nodes].sort((a, b) => heat.get(a.slug)! - heat.get(b.slug)!);
    const last = Math.max(1, order.length - 1);
    order.forEach((n, i) => { n._hue = HUE_LOW - (i / last) * (HUE_LOW - HUE_HIGH); n._p = i / last; });
    nodes.forEach((n) => { hueBySlug.set(n.slug, n._hue!); n._gradKey = undefined; }); // invalidate cached gradients
    wake();
  }

  // upvotes visibly grow the bubble too (+16% radius each, capped)
  const VOTE_SIZE = 0.16;
  function resize() {
    let changed = false;
    for (const n of nodes) {
      const v = Math.max(-4, Math.min(8, curVotes[n.slug] || 0));
      const nr = n._baseR! * Math.max(0.55, 1 + VOTE_SIZE * v);
      if (Math.abs(nr - n.r) > 0.5) { n.r = nr; changed = true; n._lines = undefined; n._gradKey = undefined; }
    }
    if (changed) sim.alpha(0.4).restart();
  }
  paint();

  // ---- hit-testing (replaces per-element SVG events). Reverse scan so the topmost
  // (last-drawn) bubble wins; dimmed & tiny bubbles are non-interactive. ----
  let dimPred: DimPredicate = () => false;
  function hitTest(wx: number, wy: number): Node | null {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const d = nodes[i];
      if (dimPred(d)) continue;
      const rx = d._rx ?? d.x, ry = d._ry ?? d.y;
      const dx = wx - rx, dy = wy - ry;
      if (dx * dx + dy * dy <= d.r * d.r) return d;
    }
    return null;
  }
  const worldFromEvent = (ev: { clientX: number; clientY: number }) => {
    const rect = canvasEl.getBoundingClientRect();
    return transform.invert([ev.clientX - rect.left, ev.clientY - rect.top]);
  };

  // ---- zoom (pan + wheel). Coexists with node-drag: pan only fires on empty space. ----
  const zoom = d3.zoom<HTMLCanvasElement, unknown>()
    .scaleExtent([0.02, 4])
    .filter((event: any) => {
      if (event.type === "wheel") return !event.ctrlKey; // wheel always zooms
      if (event.button) return false;
      const [wx, wy] = worldFromEvent(event.touches ? event.touches[0] : event);
      return !hitTest(wx, wy); // pan only when NOT on a bubble (bubbles are dragged instead)
    })
    .on("zoom", (event) => {
      transform = event.transform;
      handlers.onView?.(transform.x, transform.y, transform.k);
      wake();
    });
  const canvas = d3.select(canvasEl);
  canvas.call(zoom).on("dblclick.zoom", null);

  // ---- node drag: subject returns the bubble under the pointer (in screen coords so
  // d3-drag's event.x/y stay in screen space); we invert to world to pin fx/fy. ----
  const drag = d3.drag<HTMLCanvasElement, unknown>()
    .clickDistance(12)
    .subject((event) => {
      const [wx, wy] = worldFromEvent(event.sourceEvent);
      const n = hitTest(wx, wy);
      if (!n) return null as any;
      const [sx, sy] = transform.apply([n._rx ?? n.x, n._ry ?? n.y]);
      return { node: n, x: sx, y: sy };
    })
    .on("start", (event) => {
      const n = (event.subject as any).node as Node;
      n.fx = n.x; n.fy = n.y;
      wake();
    })
    .on("drag", (event) => {
      const n = (event.subject as any).node as Node;
      const [wx, wy] = transform.invert([event.x, event.y]);
      sim.alphaTarget(0.35).restart();
      n.fx = wx; n.fy = wy;
      wake();
    })
    .on("end", (event) => {
      const n = (event.subject as any).node as Node;
      // pin the bubble where it was dropped (matches the old behavior: no snap-back)
      n.fx = n.x; n.fy = n.y;
      sim.alphaTarget(0).alpha(0.35).restart();
      wake();
    });
  canvas.call(drag);

  // click → select (d3-drag suppresses this when the pointer moved past clickDistance)
  canvasEl.addEventListener("click", (ev) => {
    const [wx, wy] = worldFromEvent(ev);
    const n = hitTest(wx, wy);
    if (n) handlers.onSelect(n);
  });

  // ---- hover + local cursor streaming ----
  let hovered: Node | null = null;
  let lastCursor = 0;
  canvasEl.addEventListener("mousemove", (ev) => {
    wake();
    const [wx, wy] = worldFromEvent(ev);
    const n = hitTest(wx, wy);
    if (n !== hovered) {
      hovered = n;
      handlers.onHover(n ? n : null, ev.clientY);
      canvasEl.style.cursor = n ? "pointer" : "";
    }
    if (handlers.onCursor && ev.timeStamp - lastCursor > 45) {
      lastCursor = ev.timeStamp;
      handlers.onCursor(wx, wy);
    }
  });
  canvasEl.addEventListener("mouseleave", () => {
    if (hovered) { hovered = null; handlers.onHover(null); }
  });

  // ---- live peer cursors ----
  const peerMap = new Map<string, CloudPeer>();
  const CURSOR_PATH = new Path2D("M0 0 L0 15 L4 11.5 L6.6 17.2 L8.7 16.2 L6.1 10.6 L11 10.4 Z");

  // ---- WASD / arrow-key panning ----
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
    wake();
  };
  const onKeyUp = (e: KeyboardEvent) => { panKeys.delete(e.key.toLowerCase()); };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  // pre-settle synchronously, then freeze the sim (drag/vote reheat it)
  sim.stop();
  for (let i = 0; i < 360; i++) sim.tick();
  nodes.forEach((d) => { d._rx = d.x; d._ry = d.y; });

  // fit the settled cloud into view
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach((d) => {
    minX = Math.min(minX, d.x - d.r); maxX = Math.max(maxX, d.x + d.r);
    minY = Math.min(minY, d.y - d.r); maxY = Math.max(maxY, d.y + d.r);
  });
  const pad = width < 640 ? 24 : 80;
  const fitK = Math.max(0.15, Math.min(1, (width - pad) / (maxX - minX), (height - pad) / (maxY - minY)));
  const tx = width / 2 - (fitK * (minX + maxX)) / 2;
  const ty = height / 2 - (fitK * (minY + maxY)) / 2;
  canvas.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(fitK));

  let seenSet = new Set<string>();

  // ---- rendering ----
  // On phones / coarse pointers OR very large clouds, drop the continuous ambient wobble
  // (the main per-frame cost). Elsewhere it plays until the cloud goes idle.
  const reduceMotion = window.matchMedia?.("(pointer: coarse)")?.matches
    || window.innerWidth <= 640 || nodes.length > 600;

  function bodyGradient(n: Node): CanvasGradient {
    const key = `${Math.round(n._hue ?? 0)}|${Math.round(n.r)}`;
    if (n._gradKey === key && n._grad) return n._grad;
    const r = n.r, h = n._hue ?? 200;
    const g = ctx.createRadialGradient(-r * 0.15, -r * 0.2, r * 0.06, 0, 0, r * 1.05);
    g.addColorStop(0, `hsla(${h},74%,62%,0.5)`);
    g.addColorStop(0.55, `hsla(${h},74%,62%,0.16)`);
    g.addColorStop(1, `hsla(${h},74%,62%,0.05)`);
    n._grad = g; n._gradKey = key;
    return g;
  }

  function draw(t: number) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);
    const k = transform.k;

    // viewport bounds in world coords (for culling)
    const [vx0, vy0] = transform.invert([0, 0]);
    const [vx1, vy1] = transform.invert([width, height]);
    const cullPad = 120 / k;
    const cMinX = vx0 - cullPad, cMinY = vy0 - cullPad, cMaxX = vx1 + cullPad, cMaxY = vy1 + cullPad;

    // 1) nebula discs behind each galaxy
    for (const gk of galaxyKeys) {
      const p = gpos[gk], R = clusterR[gk] * 0.94;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
      g.addColorStop(0, "rgba(130,150,255,0.10)");
      g.addColorStop(0.68, "rgba(120,140,255,0.035)");
      g.addColorStop(1, "rgba(120,140,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, 2 * Math.PI); ctx.fill();
    }

    // 2) rays from each idea to its galaxy sun (skip when dimmed / far offscreen)
    ctx.lineWidth = 1.1;
    for (const d of nodes) {
      const rx = d._rx ?? d.x, ry = d._ry ?? d.y;
      if (rx < cMinX || rx > cMaxX || ry < cMinY || ry > cMaxY) continue;
      const c = gpos[d.galaxy!];
      ctx.strokeStyle = dimPred(d) ? "rgba(198,214,255,0.05)" : "rgba(198,214,255,0.32)";
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(c.x, c.y); ctx.stroke();
    }

    // 3) galaxy suns (glow + warm body + label)
    for (const gk of galaxyKeys) {
      const p = gpos[gk], R = sunR[gk];
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R * 1.5);
      glow.addColorStop(0, "rgba(255,247,224,0.85)");
      glow.addColorStop(0.45, "rgba(255,222,158,0.4)");
      glow.addColorStop(1, "rgba(255,205,130,0)");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(p.x, p.y, R * 1.5, 0, 2 * Math.PI); ctx.fill();
      const body = ctx.createRadialGradient(p.x - R * 0.24, p.y - R * 0.34, R * 0.05, p.x, p.y, R);
      body.addColorStop(0, "rgba(255,250,236,0.96)");
      body.addColorStop(0.55, "rgba(255,223,150,0.5)");
      body.addColorStop(1, "rgba(250,198,120,0.22)");
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, 2 * Math.PI); ctx.fill();
      ctx.lineWidth = 1.4; ctx.strokeStyle = "rgba(255,224,150,0.55)"; ctx.stroke();
      if (k > 0.12) {
        ctx.font = '700 17px "Fraunces", serif';
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.lineWidth = 4.5; ctx.strokeStyle = "rgba(46,26,4,0.9)";
        ctx.strokeText(gk.toUpperCase(), p.x, p.y);
        ctx.fillStyle = "rgba(255,252,245,0.98)";
        ctx.fillText(gk.toUpperCase(), p.x, p.y);
      }
    }

    // 4a) BLOOM pass — hot (high-heat) bubbles blow out and bleed light into their
    // neighbours. globalCompositeOperation "lighter" sums overlapping glows, so the hottest
    // clusters glow brightest and the very hottest go white-hot. Cool bubbles add ~nothing.
    ctx.globalCompositeOperation = "lighter";
    for (const d of nodes) {
      if (dimPred(d)) continue;
      const rx = d._rx ?? d.x, ry = d._ry ?? d.y;
      if (rx < cMinX || rx > cMaxX || ry < cMinY || ry > cMaxY) continue;
      if (d.r * k < 6) continue; // LOD: no bloom for tiny bubbles
      const p = d._p ?? 0.5;
      const hv = d._hv ?? 0;
      // only the hot HALF blooms, ramping steeply — cool bubbles stay dark so the hot ones
      // pop by contrast (they're still visible via their body + stroke).
      let heat = (p - 0.5) / 0.5;
      heat = heat > 0 ? heat * heat : 0; // quadratic ramp, 0 below the midline
      if (heat < 0.015 && hv < 0.01) continue;
      const h = d._hue ?? 200;
      const glowA = 0.6 * heat + 0.22 * hv;          // saturated colored bloom, no white haze
      const R = d.r * (1.3 + 1.7 * heat + 0.3 * hv); // tighter than before
      const L = 60 + 16 * heat;
      const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, R);
      g.addColorStop(0, `hsla(${h},88%,${L}%,${glowA.toFixed(3)})`);
      g.addColorStop(0.4, `hsla(${h},88%,${L}%,${(glowA * 0.3).toFixed(3)})`);
      g.addColorStop(1, `hsla(${h},88%,${L}%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(rx, ry, R, 0, 2 * Math.PI); ctx.fill();
      // white-hot core for the very hottest handful
      if (p > 0.82) {
        const t = (p - 0.82) / 0.18;
        const cr = d.r * (0.8 + 0.4 * hv);
        const cg = ctx.createRadialGradient(rx, ry, 0, rx, ry, cr);
        cg.addColorStop(0, `hsla(${h},70%,97%,${(0.5 * t).toFixed(3)})`);
        cg.addColorStop(1, `hsla(${h},70%,97%,0)`);
        ctx.fillStyle = cg;
        ctx.beginPath(); ctx.arc(rx, ry, cr, 0, 2 * Math.PI); ctx.fill();
      }
    }
    ctx.globalCompositeOperation = "source-over";

    // 4b) idea bubbles (bodies, titles, pips)
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const d of nodes) {
      const rx = d._rx ?? d.x, ry = d._ry ?? d.y;
      if (rx < cMinX || rx > cMaxX || ry < cMinY || ry > cMaxY) continue;
      const dim = dimPred(d);
      const hv = d._hv ?? 0;                 // hover animation 0..1
      const er = d.r * k;                    // effective on-screen radius (LOD gate)
      const alpha = dim ? 0.06 : 1;
      ctx.globalAlpha = alpha;
      const h = d._hue ?? 200;
      const p = d._p ?? 0.5;

      // tiny at this zoom → cheap flat dot, no gradient/halo/text
      if (er < 5) {
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = `hsl(${h},74%,60%)`;
        ctx.beginPath(); ctx.arc(rx, ry, d.r, 0, 2 * Math.PI); ctx.fill();
        ctx.globalAlpha = 1;
        continue;
      }

      ctx.save();
      ctx.translate(rx, ry);

      // body (glassy gradient + bright stroke ring), spring-scaled on hover
      const bodyScale = 1 + 0.075 * hv;
      ctx.save();
      ctx.scale(bodyScale, bodyScale);
      ctx.fillStyle = bodyGradient(d);
      ctx.beginPath(); ctx.arc(0, 0, d.r, 0, 2 * Math.PI); ctx.fill();
      ctx.lineWidth = (1.4 + 0.8 * hv);
      ctx.strokeStyle = `hsla(${h},74%,62%,${(0.7 + 0.3 * p).toFixed(2)})`;
      ctx.stroke();
      ctx.restore();

      // title (skip when too small to read)
      if (er > 15 && !dim) {
        if (!d._lines) { const fit = fitLines(ctx, d); d._lines = fit.lines; d._fs = fit.fs; }
        const fs = d._fs!, lineH = fs * 1.08;
        ctx.font = BUBBLE_FONT.replace("%FS", fs.toFixed(1));
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 1;
        const y0 = -((d._lines.length - 1) * lineH) / 2;
        d._lines.forEach((ln, i) => ctx.fillText(ln, 0, y0 + i * lineH));
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      }

      // "unseen" pip
      if (er > 12 && !dim && !seenSet.has(d.slug)) {
        ctx.fillStyle = "#ffd166";
        ctx.shadowColor = "rgba(255,209,102,0.9)"; ctx.shadowBlur = 3;
        ctx.beginPath(); ctx.arc(d.r * 0.72, -d.r * 0.72, 4, 0, 2 * Math.PI); ctx.fill();
        ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
      }

      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // 5) peer cursors (constant on-screen size)
    if (peerMap.size) {
      for (const peer of peerMap.values()) {
        ctx.save();
        ctx.translate(peer.x, peer.y);
        ctx.scale(1 / k, 1 / k);
        ctx.fillStyle = peer.color || "#8ab4ff";
        ctx.lineWidth = 1; ctx.strokeStyle = "rgba(4,5,10,0.6)";
        ctx.fill(CURSOR_PATH); ctx.stroke(CURSOR_PATH);
        if (peer.name) {
          ctx.font = '600 12px "Inter", system-ui, sans-serif';
          ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
          ctx.lineWidth = 3; ctx.strokeStyle = "rgba(4,5,10,0.82)";
          ctx.strokeText(peer.name, 14, 13);
          ctx.fillStyle = peer.color || "#8ab4ff";
          ctx.fillText(peer.name, 14, 13);
        }
        ctx.restore();
      }
    }
  }

  // ---- animation loop: pan, wobble, hover ease, idle-stop ----
  function frame(ts: number) {
    // key-held panning (every frame for smoothness)
    if (panKeys.size) {
      let dx = 0, dy = 0;
      panKeys.forEach((key) => { dx += PAN_MAP[key][0]; dy += PAN_MAP[key][1]; });
      if (dx || dy) {
        const step = 20 / transform.k; // ~1200px/s on-screen, constant at any zoom
        canvas.call(zoom.translateBy, dx * step, dy * step);
      }
    }

    // ease hover scale toward its target; note if anything is still animating
    let hoverAnimating = false;
    for (const d of nodes) {
      const target = d === hovered ? 1 : 0;
      const cur = d._hv ?? 0;
      if (Math.abs(cur - target) > 0.005) {
        d._hv = cur + (target - cur) * 0.25;
        hoverAnimating = true;
      } else d._hv = target;
    }

    const idle = ts - lastActivity > IDLE_MS;
    // wobble is suppressed while the panel is open (paused), when idle, on reduced-motion,
    // or zoomed way out. Ease the amplitude toward the target so it settles/resumes smoothly
    // instead of snapping (the snap looked "funky" as the panel opened).
    const wobbleWanted = !reduceMotion && !paused && !idle && transform.k > 0.08;
    wobbleAmp += ((wobbleWanted ? 1 : 0) - wobbleAmp) * 0.16;
    if (wobbleAmp < 0.01) wobbleAmp = 0;
    const simActive = sim.alpha() > 0.005;
    const recentlyActive = ts - lastActivity < 160; // keep drawing right after any interaction

    if (ts - lastFrame >= FRAME_MS) {
      lastFrame = ts;
      const tsec = ts / 1000;
      const [vx0, vy0] = transform.invert([0, 0]);
      const [vx1, vy1] = transform.invert([width, height]);
      const pad2 = 90 / transform.k;
      const wMinX = vx0 - pad2, wMinY = vy0 - pad2, wMaxX = vx1 + pad2, wMaxY = vy1 + pad2;
      for (const d of nodes) {
        if (d.fx != null) { d._rx = d.x; d._ry = d.y; continue; } // pinned/dragged: exact
        if (wobbleAmp > 0 && d.x >= wMinX && d.x <= wMaxX && d.y >= wMinY && d.y <= wMaxY) {
          const sx = 0.45 + (d._ph % 0.7);
          const sy = 0.4 + ((d._ph * 1.3) % 0.7);
          d._rx = d.x + Math.sin(tsec * sx + d._ph) * 8 * wobbleAmp;
          d._ry = d.y + Math.cos(tsec * sy + d._ph * 1.3) * 7 * wobbleAmp;
        } else { d._rx = d.x; d._ry = d.y; }
      }
      draw(ts);
    }

    // keep looping while anything can still change; otherwise idle-stop (0 fps)
    if (simActive || panKeys.size || hoverAnimating || wobbleAmp > 0 || recentlyActive) {
      raf = requestAnimationFrame(frame);
    } else {
      running = false; // any interaction (incl. wheel-zoom while the panel is open) calls wake()
    }
  }

  handlers.onReady?.();
  draw(performance.now());
  wake();

  const onResize = () => {
    width = window.innerWidth; height = window.innerHeight;
    sizeCanvas();
    wake();
  };
  window.addEventListener("resize", onResize);

  function applyDim() { wake(); }

  return {
    setDim(pred: DimPredicate) { dimPred = pred; applyDim(); },
    setVotes(v: Record<string, number>) { curVotes = v || {}; resize(); paint(); },
    setSeen(seen: Set<string>) { seenSet = seen; wake(); },
    setPeer(p: CloudPeer) {
      const ex = peerMap.get(p.id);
      if (ex) { ex.x = p.x; ex.y = p.y; if (p.name) ex.name = p.name; if (p.color) ex.color = p.color; }
      else peerMap.set(p.id, { id: p.id, x: p.x, y: p.y, name: p.name || "someone", color: p.color || "#8ab4ff" });
      wake();
    },
    removePeer(id: string) { peerMap.delete(id); wake(); },
    setPaused(v: boolean) {
      if (paused === v) return;
      paused = v;
      // don't hard-stop: interactions (wheel-zoom/pan/drag) must still redraw while the panel
      // is open. Pausing only eases the ambient wobble to rest, then the loop idle-stops on its
      // own; unpausing eases it back. Clear hover so no bubble stays stuck at hover scale.
      if (v) hovered = null;
      wake();
    },
    destroy() {
      cancelAnimationFrame(raf);
      running = false;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      sim.stop();
      hueBySlug.clear();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    },
  };
}

export { colorOf, colorAlpha };
