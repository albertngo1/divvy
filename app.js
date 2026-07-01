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
const activeTags = new Set(); // tags selected in the tag popover
let searchQuery = "";
let allNodes = [];

function radiusFor(score) {
  const s = Number.isFinite(score) ? score : 50;
  return 36 + (Math.max(0, Math.min(100, s)) / 100) * 58;
}

// Fit the title inside the circle: shrink font + wrap until it fits width AND height,
// truncating with an ellipsis only as a last resort. Keeps text off the circumference.
function fitText(t, d) {
  const r = d.r;
  const words = String(d.title).split(/\s+/);
  const maxLines = r < 44 ? 2 : (r < 70 ? 3 : 4);
  const padW = r * 1.5;   // usable width (leaves rim padding)
  const padH = r * 1.45;  // usable height
  let fs = Math.min(17, Math.max(9, r * 0.3));
  let lines = [];
  while (true) {
    const maxChars = Math.max(3, Math.floor(padW / (fs * 0.56)));
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

function buildDefs() {
  const defs = svg.append("defs");
  Object.entries(SOURCE_META).forEach(([key, meta]) => {
    const g = defs.append("radialGradient")
      .attr("id", `grad-${key}`).attr("cx", "0.35").attr("cy", "0.3").attr("r", "0.85");
    g.append("stop").attr("offset", "0%").attr("stop-color", hexToRgba(meta.color, 0.5));
    g.append("stop").attr("offset", "55%").attr("stop-color", hexToRgba(meta.color, 0.16));
    g.append("stop").attr("offset", "100%").attr("stop-color", hexToRgba(meta.color, 0.05));
    // cheap glow (pure gradient, no expensive blur filter)
    const gl = defs.append("radialGradient").attr("id", `glow-${key}`).attr("cx", "0.5").attr("cy", "0.5").attr("r", "0.5");
    gl.append("stop").attr("offset", "0%").attr("stop-color", hexToRgba(meta.color, 0.45));
    gl.append("stop").attr("offset", "62%").attr("stop-color", hexToRgba(meta.color, 0.12));
    gl.append("stop").attr("offset", "100%").attr("stop-color", hexToRgba(meta.color, 0));
  });
}

// ---- tooltip ----
function showTooltip(event, d) {
  tooltip.innerHTML =
    `<div class="tt-title">${d.title}</div>` +
    (d.hook ? `<div class="tt-hook">${d.hook}</div>` : "") +
    `<div class="tt-tags">${(d.tags || []).map((t) => `<span>${t}</span>`).join("")}</div>`;
  tooltip.style.setProperty("--tt-accent", colorOf(d));
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
  const accent = colorOf(d);
  panel.style.setProperty("--accent", accent);
  panel.style.setProperty("--accent-soft", hexToRgba(accent, 0.14));
  document.getElementById("panel-title").textContent = d.title;
  document.getElementById("panel-hook").textContent = d.hook || "";
  const tags = document.getElementById("panel-tags");
  tags.innerHTML = "";
  const src = document.createElement("span");
  src.className = "source-tag";
  src.textContent = SOURCE_META[sourceOf(d)].label;
  src.style.borderColor = hexToRgba(accent, 0.6);
  src.style.color = accent;
  src.title = "source (color)";
  tags.appendChild(src);
  (d.tags || []).forEach((tg) => {
    const el = document.createElement("span");
    el.textContent = tg;
    if (activeTags.has(tg)) el.classList.add("active");
    el.addEventListener("click", () => toggleTag(tg));
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
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePanel();
    const pop = document.getElementById("tag-pop");
    if (pop && !pop.hidden) { pop.hidden = true; document.getElementById("tags-btn").setAttribute("aria-expanded", "false"); }
    else clearFilters();
  }
});

// ---- filtering ----
function matchesSearch(d) {
  if (!searchQuery) return true;
  const q = searchQuery.toLowerCase();
  return String(d.title).toLowerCase().includes(q) ||
    String(d.hook || "").toLowerCase().includes(q) ||
    (d.tags || []).some((t) => t.toLowerCase().includes(q));
}
function isDimmed(d) {
  if (offSources.has(sourceOf(d))) return true;
  if (activeTags.size && !(d.tags || []).some((t) => activeTags.has(t))) return true;
  if (!matchesSearch(d)) return true;
  return false;
}
function applyFilter() {
  svg.selectAll("g.bubble").classed("dim", isDimmed);
  legendEl.querySelectorAll(".chip").forEach((chip) => chip.classList.toggle("off", offSources.has(chip.dataset.source)));
  document.querySelectorAll("#tag-pop .tp").forEach((el) => el.classList.toggle("on", activeTags.has(el.dataset.tag)));
  document.querySelectorAll("#panel-tags span:not(.source-tag)").forEach((el) => el.classList.toggle("active", activeTags.has(el.textContent)));

  const chips = [];
  if (searchQuery) chips.push(`“${searchQuery}”`);
  activeTags.forEach((t) => chips.push("#" + t));
  if (chips.length) {
    const visible = allNodes.filter((d) => !isDimmed(d)).length;
    filterbar.hidden = false;
    filterbar.innerHTML = `<b>${visible}</b> shown — ${chips.join(", ")} <button class="clear" aria-label="clear filters">✕</button>`;
    filterbar.querySelector(".clear").addEventListener("click", clearFilters);
  } else {
    filterbar.hidden = true;
  }
}
function clearFilters() {
  activeTags.clear();
  searchQuery = "";
  const s = document.getElementById("search"); if (s) s.value = "";
  document.querySelectorAll("#panel-tags .active").forEach((el) => el.classList.remove("active"));
  applyFilter();
}
// radio-style: click a tag -> filter to only it; click the sole active tag -> back to all
function toggleTag(tag) {
  if (activeTags.has(tag) && activeTags.size === 1) activeTags.clear();
  else { activeTags.clear(); activeTags.add(tag); }
  applyFilter();
}
function toggleSource(src) { if (offSources.has(src)) offSources.delete(src); else offSources.add(src); applyFilter(); }

function buildLegend(nodes) {
  const counts = {};
  nodes.forEach((d) => { const s = sourceOf(d); counts[s] = (counts[s] || 0) + 1; });
  const order = Object.keys(SOURCE_META).filter((s) => counts[s]);
  legendEl.innerHTML = "";
  const cap = document.createElement("span");
  cap.className = "legend-cap";
  cap.textContent = "color = source · click to filter";
  legendEl.appendChild(cap);
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

function buildTagPop(nodes) {
  const counts = {};
  nodes.forEach((d) => (d.tags || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
  const tags = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
  const pop = document.getElementById("tag-pop");
  pop.innerHTML = "";
  tags.forEach((t) => {
    const el = document.createElement("button");
    el.className = "tp";
    el.dataset.tag = t;
    el.innerHTML = `${t}<span class="n">${counts[t]}</span>`;
    el.addEventListener("click", () => toggleTag(t));
    pop.appendChild(el);
  });
}

// control wiring (elements exist at load)
document.getElementById("search").addEventListener("input", (e) => { searchQuery = e.target.value.trim(); applyFilter(); });
(function () {
  const btn = document.getElementById("tags-btn");
  const pop = document.getElementById("tag-pop");
  btn.addEventListener("click", () => {
    const willOpen = pop.hidden;
    pop.hidden = !willOpen;
    btn.setAttribute("aria-expanded", String(willOpen));
  });
})();

function render(ideas) {
  document.getElementById("idea-count").textContent = ideas.length;
  document.getElementById("empty").hidden = ideas.length > 0;

  allNodes = ideas.map((d) => ({ ...d, r: radiusFor(d.score) }));
  buildDefs();
  buildLegend(allNodes);
  buildTagPop(allNodes);

  const sim = d3.forceSimulation(allNodes)
    .force("charge", d3.forceManyBody().strength(12))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius((d) => d.r + 7).iterations(3))
    .force("x", d3.forceX(width / 2).strength(0.035))
    .force("y", d3.forceY(height / 2).strength(0.035));

  // viewport group so we can pan/zoom the whole cloud
  const viewport = svg.selectAll("g.viewport").data([0]).join("g").attr("class", "viewport");
  const g = viewport.selectAll("g.bubble")
    .data(allNodes, (d) => d.slug)
    .join("g")
    .attr("class", "bubble")
    .on("click", (_, d) => openPanel(d))
    .on("mouseenter", (e, d) => showTooltip(e, d))
    .on("mousemove", (e) => moveTooltip(e))
    .on("mouseleave", hideTooltip);

  g.append("circle")
    .attr("class", "halo")
    .attr("r", (d) => d.r * 1.5)
    .attr("fill", (d) => `url(#glow-${sourceOf(d)})`)
    .style("pointer-events", "none");

  g.append("circle")
    .attr("class", "body")
    .attr("r", (d) => d.r)
    .attr("fill", (d) => `url(#grad-${sourceOf(d)})`)
    .attr("stroke", (d) => hexToRgba(colorOf(d), 0.85))
    .attr("stroke-width", 1.4);

  g.append("text").call((sel) => sel.each(function (d) { fitText(d3.select(this), d); }));

  const drag = d3.drag()
    .on("start", (event, d) => {
      if (event.sourceEvent) event.sourceEvent.stopPropagation(); // don't pan while dragging a bubble
      if (!event.active) sim.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y;
    })
    .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
    .on("end", (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });
  g.call(drag);

  // point-and-hold on empty space to pan; wheel to zoom
  const zoom = d3.zoom().scaleExtent([0.35, 3])
    .on("zoom", (event) => viewport.attr("transform", event.transform));
  svg.call(zoom).on("dblclick.zoom", null);
  // start slightly zoomed out so there's a grabbable margin around the dense cloud
  svg.call(zoom.transform, d3.zoomIdentity.translate(width * 0.09, height * 0.09).scale(0.82));

  // "random idea" button opens a random PRD
  const randomBtn = document.getElementById("random-btn");
  if (randomBtn) randomBtn.onclick = () => {
    const pool = allNodes.filter((d) => !isDimmed(d));
    const pick = (pool.length ? pool : allNodes)[Math.floor(Math.random() * (pool.length ? pool.length : allNodes.length))];
    if (pick) openPanel(pick);
  };

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
