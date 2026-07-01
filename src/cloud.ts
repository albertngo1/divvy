import * as d3 from "d3";
import type { Idea, Node } from "./types";

export type DimPredicate = (d: Idea) => boolean;

export interface CloudHandlers {
  onHover: (d: Idea | null, clientY?: number) => void;
  onSelect: (d: Idea) => void;
  onReady?: () => void;
}

export interface CloudHandle {
  setDim: (pred: DimPredicate) => void;
  setVotes: (v: Record<string, number>) => void;
  destroy: () => void;
}

// ---- color === "heat" (AI score + upvotes, votes weighted higher), spread by
// percentile rank so the full cool-blue → warm-amber spectrum is always used. Raw AI
// scores cluster high (everything looks "good"), so ranking spreads them apart. ----
const HUE_LOW = 250;  // coldest (lowest-ranked) idea
const HUE_HIGH = 22;  // hottest (highest-ranked) idea
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
    return {
      ...d, r: radiusFor(d.score, ideas.length), _ph: i * 1.7,
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
  const gmembers: Record<string, Node[]> = {};
  nodes.forEach((d) => (gmembers[d.galaxy!] = gmembers[d.galaxy!] || []).push(d));
  const clusterR: Record<string, number> = {};
  const sunR: Record<string, number> = {};
  galaxyKeys.forEach((gk) => {
    const area = gmembers[gk].reduce((s, m) => s + Math.PI * (m.r + 5) * (m.r + 5), 0);
    clusterR[gk] = Math.sqrt(area / Math.PI) * 1.5 + 46; // inflate → gap between galaxies
    sunR[gk] = Math.max(26, Math.min(52, clusterR[gk] * 0.16)); // central star the ideas orbit
  });
  const seedR = Math.min(width, height) * 0.5;
  const centers = galaxyKeys.map((gk, i) => {
    const a = (i / galaxyKeys.length) * 2 * Math.PI - Math.PI / 2;
    return { gk, r: clusterR[gk], x: width / 2 + seedR * Math.cos(a), y: height / 2 + seedR * Math.sin(a) };
  });
  d3.forceSimulation(centers as unknown as d3.SimulationNodeDatum[])
    .force("collide", d3.forceCollide<{ r: number } & d3.SimulationNodeDatum>((c) => c.r).strength(1).iterations(8))
    .force("x", d3.forceX(width / 2).strength(0.06))
    .force("y", d3.forceY(height / 2).strength(0.06))
    .stop()
    .tick(320);
  const gpos: Record<string, { x: number; y: number }> = {};
  centers.forEach((c) => { gpos[c.gk] = { x: c.x, y: c.y }; });
  // seed each idea in a ring around its galaxy's sun so the settle only tightens packing
  nodes.forEach((d) => {
    const p = gpos[d.galaxy!];
    const inner = sunR[d.galaxy!] + d.r + 6;
    const rr = inner + Math.sqrt(Math.random()) * clusterR[d.galaxy!] * 0.5;
    const a = Math.random() * 2 * Math.PI;
    d.x = p.x + rr * Math.cos(a); d.y = p.y + rr * Math.sin(a);
  });

  // gradient + glow defs, one per node (score-hued)
  const defs = svg.append("defs");
  const neb = defs.append("radialGradient").attr("id", "nebula-grad").attr("cx", "0.5").attr("cy", "0.5").attr("r", "0.5");
  neb.append("stop").attr("offset", "0%").attr("stop-color", "rgba(130,150,255,0.10)");
  neb.append("stop").attr("offset", "68%").attr("stop-color", "rgba(120,140,255,0.035)");
  neb.append("stop").attr("offset", "100%").attr("stop-color", "rgba(120,140,255,0)");
  const sun = defs.append("radialGradient").attr("id", "sun-grad").attr("cx", "0.5").attr("cy", "0.5").attr("r", "0.5");
  sun.append("stop").attr("offset", "0%").attr("stop-color", "rgba(255,247,224,0.98)");
  sun.append("stop").attr("offset", "42%").attr("stop-color", "rgba(255,222,158,0.62)");
  sun.append("stop").attr("offset", "100%").attr("stop-color", "rgba(255,205,130,0)");
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

  // keep each idea outside its galaxy's sun, so the ideas orbit the star instead of burying it
  const sunOrbit = (alpha: number) => {
    for (const d of nodes) {
      const c = gpos[d.galaxy!];
      const dx = d.x - c.x, dy = d.y - c.y;
      const dist = Math.hypot(dx, dy) || 0.01;
      const min = sunR[d.galaxy!] + d.r + 5;
      if (dist < min) {
        const push = (min - dist) * alpha * 0.9;
        d.vx = (d.vx || 0) + (dx / dist) * push;
        d.vy = (d.vy || 0) + (dy / dist) * push;
      }
    }
  };

  const sim = d3.forceSimulation<Node>(nodes)
    .force("collide", d3.forceCollide<Node>().radius((d) => d.r + 3).strength(1).iterations(4))
    .force("x", d3.forceX<Node>((d) => gpos[d.galaxy!].x).strength(0.55)) // localize the cluster
    .force("y", d3.forceY<Node>((d) => gpos[d.galaxy!].y).strength(0.55))
    .force("sun", sunOrbit) // clear the center for the star
    .alphaDecay(0.03);

  const viewport = svg.append("g").attr("class", "viewport");
  const galaxyG = viewport.append("g").attr("class", "galaxies"); // labels, backmost
  const linkG = viewport.append("g").attr("class", "links");

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

  // recolor every bubble from its "heat" (AI score + weighted upvotes), spread by
  // percentile rank so the spectrum is fully used. Cheap enough to re-run on each vote.
  let curVotes: Record<string, number> = {};
  function paint() {
    const scoreOf = (n: Node) => (Number.isFinite(n.score) ? n.score : 50);
    // single pass (spreading a huge array into Math.min/max would blow the arg limit as the cloud grows)
    let minS = Infinity, maxS = -Infinity, maxV = 1;
    for (const n of nodes) {
      const s = scoreOf(n);
      if (s < minS) minS = s;
      if (s > maxS) maxS = s;
      maxV = Math.max(maxV, curVotes[n.slug] || 0);
    }
    const heat = new Map<string, number>();
    nodes.forEach((n) => {
      const ns = maxS > minS ? (scoreOf(n) - minS) / (maxS - minS) : 0.5;
      const nv = (curVotes[n.slug] || 0) / maxV;
      heat.set(n.slug, ns + 3 * nv); // upvotes weighted 3× the AI score
    });
    const order = [...nodes].sort((a, b) => heat.get(a.slug)! - heat.get(b.slug)!);
    const last = Math.max(1, order.length - 1);
    order.forEach((n, i) => { n._hue = HUE_LOW - (i / last) * (HUE_LOW - HUE_HIGH); });
    nodes.forEach((n) => {
      const h = n._hue!;
      hueBySlug.set(n.slug, h);
      gradStops.get(n.slug)!.each(function (_d, i) { d3.select(this).attr("stop-color", `hsla(${h},74%,62%,${GRAD_STOPS[i].a})`); });
      glowStops.get(n.slug)!.each(function (_d, i) { d3.select(this).attr("stop-color", `hsla(${h},74%,62%,${GLOW_STOPS[i].a})`); });
    });
    g.selectAll<SVGCircleElement, Node>("circle.body").attr("stroke", (n) => `hsla(${n._hue},74%,62%,0.85)`);
  }
  paint();

  const drag = d3.drag<SVGGElement, Node>()
    .clickDistance(12)
    .on("start", (event, d) => { if (event.sourceEvent) event.sourceEvent.stopPropagation(); d.fx = d.x; d.fy = d.y; })
    .on("drag", (event, d) => { sim.alphaTarget(0.35).restart(); d.fx = event.x; d.fy = event.y; })
    .on("end", () => { sim.alphaTarget(0).alpha(0.35).restart(); });
  g.call(drag);

  const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.02, 4])
    .on("zoom", (event) => viewport.attr("transform", event.transform.toString()));
  svg.call(zoom).on("dblclick.zoom", null);

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

  // each galaxy's "sun": a labeled central star the ideas orbit, naming its domain
  const sunG = viewport.append("g").attr("class", "suns"); // frontmost overlay
  const suns = sunG.selectAll<SVGGElement, string>("g.sun").data(galaxyKeys).join("g")
    .attr("class", "sun")
    .attr("transform", (gk) => `translate(${gpos[gk].x},${gpos[gk].y})`)
    .style("pointer-events", "none");
  suns.append("circle").attr("class", "sun-halo").attr("r", (gk) => sunR[gk] * 1.7).attr("fill", "url(#sun-grad)");
  suns.append("circle").attr("class", "sun-core").attr("r", (gk) => sunR[gk] * 0.5);
  suns.append("text").attr("class", "sun-label").attr("text-anchor", "middle").attr("dy", "0.32em").text((gk) => gk);

  // constellation links: same-tag ideas (small groups) as nearest-neighbor chains
  const groups: Record<string, Node[]> = {};
  nodes.forEach((d) => (d.tags || []).forEach((tg) => { (groups[tg] = groups[tg] || []).push(d); }));
  const linkMap = new Map<string, { a: Node; b: Node }>();
  Object.values(groups).forEach((members) => {
    if (members.length < 2 || members.length > 5) return;
    const rem = members.slice();
    const chain = [rem.shift()!];
    while (rem.length) {
      const last = chain[chain.length - 1];
      let bi = 0, bd = Infinity;
      rem.forEach((m, i) => { const dd = Math.hypot(m.x - last.x, m.y - last.y); if (dd < bd) { bd = dd; bi = i; } });
      chain.push(rem.splice(bi, 1)[0]);
    }
    for (let i = 0; i < chain.length - 1; i++) {
      const a = chain[i], b = chain[i + 1];
      const key = a.slug < b.slug ? a.slug + "|" + b.slug : b.slug + "|" + a.slug;
      if (!linkMap.has(key)) linkMap.set(key, { a, b });
    }
  });
  const links = [...linkMap.values()].slice(0, 340);
  const linkSel = linkG.selectAll<SVGLineElement, { a: Node; b: Node }>("line").data(links).join("line").attr("class", "link");

  let dimPred: DimPredicate = () => false;
  function applyDim() {
    g.classed("dim", (d) => dimPred(d));
    linkSel.style("opacity", (l) => (dimPred(l.a) || dimPred(l.b) ? 0.12 : 1));
  }

  let raf = 0;
  function floatFrame(ts: number) {
    const t = ts / 1000;
    nodes.forEach((d) => {
      const sx = 0.45 + (d._ph % 0.7);
      const sy = 0.4 + ((d._ph * 1.3) % 0.7);
      d._rx = d.x + Math.sin(t * sx + d._ph) * 8;
      d._ry = d.y + Math.cos(t * sy + d._ph * 1.3) * 7;
    });
    g.attr("transform", (d) => `translate(${d._rx},${d._ry})`);
    linkSel.attr("x1", (l) => l.a._rx!).attr("y1", (l) => l.a._ry!).attr("x2", (l) => l.b._rx!).attr("y2", (l) => l.b._ry!);
    raf = requestAnimationFrame(floatFrame);
  }
  raf = requestAnimationFrame(floatFrame);

  const onResize = () => { width = window.innerWidth; height = window.innerHeight; };
  window.addEventListener("resize", onResize);

  handlers.onReady?.();

  return {
    setDim(pred: DimPredicate) { dimPred = pred; applyDim(); },
    setVotes(v: Record<string, number>) { curVotes = v || {}; paint(); },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      sim.stop();
      hueBySlug.clear();
      svg.selectAll("*").remove();
    },
  };
}

export { colorOf, colorAlpha };
