import * as d3 from "d3";
import type { Idea, Node } from "./types";

export type DimPredicate = (d: Idea) => boolean;

export interface CloudHandlers {
  onHover: (d: Idea | null) => void;
  onSelect: (d: Idea) => void;
  onReady?: () => void;
}

export interface CloudHandle {
  setDim: (pred: DimPredicate) => void;
  destroy: () => void;
}

// ---- color === score (cool blue = low, warm amber = high) ----
function scoreHue(score: number): number {
  const s = Math.max(30, Math.min(90, Number.isFinite(score) ? score : 55));
  return 220 - ((s - 30) / 60) * 190;
}
const colorOf = (d: Idea) => `hsl(${scoreHue(d.score)}, 72%, 62%)`;
const colorAlpha = (d: Idea, a: number) => `hsla(${scoreHue(d.score)}, 72%, 62%, ${a})`;

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

  // gradient + glow defs, one per node (score-hued)
  const defs = svg.append("defs");
  nodes.forEach((d) => {
    const h = scoreHue(d.score);
    const g = defs.append("radialGradient").attr("id", `grad-${d.slug}`).attr("cx", "0.35").attr("cy", "0.3").attr("r", "0.85");
    g.append("stop").attr("offset", "0%").attr("stop-color", `hsla(${h},72%,62%,0.5)`);
    g.append("stop").attr("offset", "55%").attr("stop-color", `hsla(${h},72%,62%,0.16)`);
    g.append("stop").attr("offset", "100%").attr("stop-color", `hsla(${h},72%,62%,0.05)`);
    const gl = defs.append("radialGradient").attr("id", `glow-${d.slug}`).attr("cx", "0.5").attr("cy", "0.5").attr("r", "0.5");
    gl.append("stop").attr("offset", "0%").attr("stop-color", `hsla(${h},72%,62%,0.4)`);
    gl.append("stop").attr("offset", "62%").attr("stop-color", `hsla(${h},72%,62%,0.1)`);
    gl.append("stop").attr("offset", "100%").attr("stop-color", `hsla(${h},72%,62%,0)`);
  });

  const sim = d3.forceSimulation<Node>(nodes)
    .force("collide", d3.forceCollide<Node>().radius((d) => d.r + 4).strength(1).iterations(4))
    .force("x", d3.forceX<Node>(width / 2).strength(0.02))
    .force("y", d3.forceY<Node>(height / 2).strength(0.02))
    .alphaDecay(0.02);

  const viewport = svg.append("g").attr("class", "viewport");
  const linkG = viewport.append("g").attr("class", "links");

  const g = viewport.selectAll<SVGGElement, Node>("g.bubble")
    .data(nodes, (d) => d.slug)
    .join("g")
    .attr("class", "bubble")
    .on("click", (_e, d) => handlers.onSelect(d))
    .on("mouseenter", (_e, d) => handlers.onHover(d))
    .on("mouseleave", () => handlers.onHover(null));

  g.append("circle").attr("class", "halo").attr("r", (d) => d.r * 1.5)
    .attr("fill", (d) => `url(#glow-${d.slug})`).style("pointer-events", "none");
  g.append("circle").attr("class", "body").attr("r", (d) => d.r)
    .attr("fill", (d) => `url(#grad-${d.slug})`)
    .attr("stroke", (d) => colorAlpha(d, 0.85)).attr("stroke-width", 1.4);
  g.append("text").each(function (this: SVGTextElement, d) { fitText(this, d); });

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
  const k = Math.max(0.35, Math.min(1, (width - pad) / (maxX - minX), (height - pad) / (maxY - minY)));
  const tx = width / 2 - (k * (minX + maxX)) / 2;
  const ty = height / 2 - (k * (minY + maxY)) / 2;
  svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(k));

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
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      sim.stop();
      svg.selectAll("*").remove();
    },
  };
}

export { colorOf, colorAlpha, scoreHue };
