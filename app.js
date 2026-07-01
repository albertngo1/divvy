// Divvy — static bubble-cloud front-end.
// Color === source. Reads data/ideas.json, renders a d3 force cloud with glow,
// a source legend that doubles as a filter, hover tooltips, and clickable tags.
// Click a bubble -> fetch data/prds/<slug>.md and render it.

const SOURCE_META = {
  self:            { label: "self",          color: "#ffd166" },
  "weekend-ideas": { label: "weekend-ideas", color: "#b794f6" },
  hn:              { label: "hacker news",   color: "#ff9d5c" },
  github:          { label: "github",        color: "#7cc4ff" },
  steam:           { label: "steam",         color: "#66e0c2" },
  wild:            { label: "wild",          color: "#f97ba3" },
  games:           { label: "games",         color: "#c3f27b" },
  scan:            { label: "scan",          color: "#9aa0b4" },
};
const sourceOf = (d) => (SOURCE_META[d.source] ? d.source : "scan");
const colorOf = (d) => SOURCE_META[sourceOf(d)].color;

function hexToRgba(hex, a) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const svg = d3.select("#cloud");
const panel = document.getElementById("panel");
const scrim = document.getElementById("scrim");
const tooltip = document.getElementById("tooltip");
const legendEl = document.getElementById("legend");
const filterbar = document.getElementById("filterbar");

let width = window.innerWidth;
let height = window.innerHeight;

// filter state
const offSources = new Set(); // sources toggled OFF in the legend
let activeTag = null;
let allNodes = [];

function radiusFor(score) {
  const s = Number.isFinite(score) ? score : 50;
  return 36 + (Math.max(0, Math.min(100, s)) / 100) * 58;
}

function wrap(textSel, radius) {
  textSel.each(function (d) {
    const t = d3.select(this);
    const words = String(d.title).split(/\s+/);
    const lineHeight = 15;
    const maxChars = Math.max(6, Math.floor(radius / 4.4));
    let lines = [], cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > maxChars) {
        if (cur) lines.push(cur);
        cur = w;
      } else cur = (cur + " " + w).trim();
    }
    if (cur) lines.push(cur);
    lines = lines.slice(0, 3);
    t.text(null);
    const fs = Math.max(11, Math.min(16, radius / 4.4));
    const y0 = -((lines.length - 1) * lineHeight) / 2;
    lines.forEach((ln, i) => {
      t.append("tspan").attr("x", 0).attr("y", y0 + i * lineHeight).attr("font-size", fs).text(ln);
    });
  });
}

function buildDefs() {
  const defs = svg.append("defs");
  Object.entries(SOURCE_META).forEach(([key, meta]) => {
    const g = defs.append("radialGradient")
      .attr("id", `grad-${key}`).attr("cx", "0.35").attr("cy", "0.3").attr("r", "0.85");
    g.append("stop").attr("offset", "0%").attr("stop-color", hexToRgba(meta.color, 0.5));
    g.append("stop").attr("offset", "55%").attr("stop-color", hexToRgba(meta.color, 0.16));
    g.append("stop").attr("offset", "100%").attr("stop-color", hexToRgba(meta.color, 0.05));
  });
}

// ---- tooltip ----
function showTooltip(event, d) {
  tooltip.innerHTML =
    `<div class="tt-title">${d.title}</div>` +
    `<div class="tt-tags">${(d.tags || []).map((t) => `<span>${t}</span>`).join("")}</div>`;
  tooltip.hidden = false;
  moveTooltip(event);
}
function moveTooltip(event) {
  tooltip.style.left = event.clientX + "px";
  tooltip.style.top = event.clientY + "px";
}
function hideTooltip() { tooltip.hidden = true; }

// ---- PRD panel ----
async function openPanel(d) {
  document.getElementById("panel-title").textContent = d.title;
  document.getElementById("panel-hook").textContent = d.hook || "";
  const tags = document.getElementById("panel-tags");
  tags.innerHTML = "";
  const src = document.createElement("span");
  src.className = "source-tag";
  src.textContent = SOURCE_META[sourceOf(d)].label;
  src.style.borderColor = hexToRgba(colorOf(d), 0.6);
  src.style.color = colorOf(d);
  src.title = "source (color)";
  tags.appendChild(src);
  (d.tags || []).forEach((tg) => {
    const el = document.createElement("span");
    el.textContent = tg;
    el.addEventListener("click", () => { setTag(tg); });
    tags.appendChild(el);
  });

  const prdEl = document.getElementById("panel-prd");
  prdEl.innerHTML = "<p style='color:var(--ink-dim)'>loading PRD…</p>";
  panel.hidden = false;
  scrim.hidden = false;
  requestAnimationFrame(() => panel.classList.add("open"));

  try {
    const res = await fetch(`./data/prds/${d.slug}.md`, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    // strip a leading H1 that just repeats the title (the panel already shows it)
    const md = (await res.text()).replace(/^\s*#\s+.*\r?\n+/, "");
    prdEl.innerHTML = marked.parse(md);
  } catch (e) {
    prdEl.innerHTML = "<p style='color:var(--ink-dim)'>No PRD written yet for this idea.</p>";
  }
}
function closePanel() {
  panel.classList.remove("open");
  scrim.hidden = true;
  setTimeout(() => { panel.hidden = true; }, 320);
}
document.getElementById("panel-close").addEventListener("click", closePanel);
scrim.addEventListener("click", closePanel);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closePanel(); if (activeTag) setTag(null); } });

// ---- filtering ----
function isDimmed(d) {
  if (offSources.has(sourceOf(d))) return true;
  if (activeTag && !(d.tags || []).includes(activeTag)) return true;
  return false;
}
function applyFilter() {
  svg.selectAll("g.bubble").classed("dim", isDimmed);
  legendEl.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("off", offSources.has(chip.dataset.source));
  });
  if (activeTag) {
    filterbar.hidden = false;
    filterbar.innerHTML = `filtering by <b>#${activeTag}</b> <button class="clear" aria-label="clear">✕</button>`;
    filterbar.querySelector(".clear").addEventListener("click", () => setTag(null));
  } else {
    filterbar.hidden = true;
  }
}
function setTag(tag) { activeTag = activeTag === tag ? null : tag; applyFilter(); }
function toggleSource(src) { if (offSources.has(src)) offSources.delete(src); else offSources.add(src); applyFilter(); }

function buildLegend(nodes) {
  const counts = {};
  nodes.forEach((d) => { const s = sourceOf(d); counts[s] = (counts[s] || 0) + 1; });
  const order = Object.keys(SOURCE_META).filter((s) => counts[s]);
  legendEl.innerHTML = "";
  order.forEach((s) => {
    const meta = SOURCE_META[s];
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.dataset.source = s;
    chip.innerHTML = `<span class="dot" style="background:${meta.color};color:${meta.color}"></span>${meta.label} <span class="n">${counts[s]}</span>`;
    chip.addEventListener("click", () => toggleSource(s));
    legendEl.appendChild(chip);
  });
}

function render(ideas) {
  document.getElementById("idea-count").textContent = ideas.length;
  document.getElementById("empty").hidden = ideas.length > 0;

  allNodes = ideas.map((d) => ({ ...d, r: radiusFor(d.score) }));
  buildDefs();
  buildLegend(allNodes);

  const sim = d3.forceSimulation(allNodes)
    .force("charge", d3.forceManyBody().strength(12))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius((d) => d.r + 7).iterations(3))
    .force("x", d3.forceX(width / 2).strength(0.035))
    .force("y", d3.forceY(height / 2).strength(0.035));

  const g = svg.selectAll("g.bubble")
    .data(allNodes, (d) => d.slug)
    .join("g")
    .attr("class", "bubble")
    .on("click", (_, d) => openPanel(d))
    .on("mouseenter", (e, d) => showTooltip(e, d))
    .on("mousemove", (e) => moveTooltip(e))
    .on("mouseleave", hideTooltip);

  g.append("circle")
    .attr("class", "halo")
    .attr("r", (d) => d.r * 1.02)
    .attr("fill", (d) => colorOf(d))
    .attr("fill-opacity", 0.28)
    .style("filter", "blur(16px)")
    .style("pointer-events", "none");

  g.append("circle")
    .attr("class", "body")
    .attr("r", (d) => d.r)
    .attr("fill", (d) => `url(#grad-${sourceOf(d)})`)
    .attr("stroke", (d) => hexToRgba(colorOf(d), 0.85))
    .attr("stroke-width", 1.4);

  g.append("text").call((sel) => sel.each(function (d) { wrap(d3.select(this), d.r); }));

  const drag = d3.drag()
    .on("start", (event, d) => { if (!event.active) sim.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y; })
    .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
    .on("end", (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });
  g.call(drag);

  sim.on("tick", () => {
    g.attr("transform", (d) => {
      d.x = Math.max(d.r, Math.min(width - d.r, d.x));
      d.y = Math.max(d.r + 60, Math.min(height - d.r - 10, d.y));
      return `translate(${d.x},${d.y})`;
    });
  });

  window.addEventListener("resize", () => {
    width = window.innerWidth; height = window.innerHeight;
    sim.force("center", d3.forceCenter(width / 2, height / 2));
    sim.alpha(0.3).restart();
  });

  applyFilter();
}

(async function init() {
  try {
    const res = await fetch("./data/ideas.json", { cache: "no-store" });
    const data = await res.json();
    const ideas = Array.isArray(data.ideas) ? data.ideas : (Array.isArray(data) ? data : []);
    document.getElementById("last-scan").textContent = data.lastScan || "—";
    render(ideas);
  } catch (e) {
    document.getElementById("empty").hidden = false;
    document.getElementById("empty").textContent = "Could not load ideas.json.";
    console.error(e);
  }
})();
