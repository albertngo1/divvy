// Divvy — static bubble-cloud front-end.
// Color === source. Reads data/ideas.json, renders a d3 force cloud with glow,
// a source legend that doubles as a filter, hover tooltips, and clickable tags.
// Click a bubble -> fetch data/prds/<slug>.md and render it.

// Color === score (heat scale). Low score = cool blue, high score = warm amber.
function scoreHue(score) {
  const s = Math.max(30, Math.min(90, Number.isFinite(score) ? score : 55));
  return 220 - ((s - 30) / 60) * 190; // 220 (blue) -> 30 (amber)
}
const colorOf = (d) => `hsl(${scoreHue(d.score)}, 72%, 62%)`;
const colorAlpha = (d, a) => `hsla(${scoreHue(d.score)}, 72%, 62%, ${a})`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || ""));
  if (!m) return String(s || "");
  return `${MONTHS[+m[2] - 1] || "?"} ${+m[3]}, ${m[1]}`;
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
const activeTags = new Set(); // tags selected in the tag popover / legend
let searchQuery = "";
let allNodes = [];

function radiusFor(score, n) {
  const s = Number.isFinite(score) ? score : 50;
  const base = 36 + (Math.max(0, Math.min(100, s)) / 100) * 58; // 36..94
  // shrink as the cloud grows so ~N bubbles stay spread instead of packing into a blob
  const scale = Math.min(1, Math.sqrt(70 / Math.max(n || 1, 1)));
  return Math.max(15, base * scale);
}

// Fit the title inside the circle: shrink font + wrap until it fits width AND height,
// truncating with an ellipsis only as a last resort. Keeps text off the circumference.
function fitText(t, d) {
  const r = d.r;
  const words = String(d.title).split(/\s+/);
  const maxLines = r < 46 ? 2 : (r < 72 ? 3 : 4);
  const padW = r * 1.42;  // usable width (leaves rim padding)
  const padH = r * 1.32;  // usable height
  let fs = Math.min(16, Math.max(9, r * 0.29));
  let lines = [];
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

function buildDefs(nodes) {
  svg.selectAll("defs").remove();
  const defs = svg.append("defs");
  nodes.forEach((d) => {
    const h = scoreHue(d.score);
    const g = defs.append("radialGradient")
      .attr("id", `grad-${d.slug}`).attr("cx", "0.35").attr("cy", "0.3").attr("r", "0.85");
    g.append("stop").attr("offset", "0%").attr("stop-color", `hsla(${h},72%,62%,0.5)`);
    g.append("stop").attr("offset", "55%").attr("stop-color", `hsla(${h},72%,62%,0.16)`);
    g.append("stop").attr("offset", "100%").attr("stop-color", `hsla(${h},72%,62%,0.05)`);
    const gl = defs.append("radialGradient").attr("id", `glow-${d.slug}`).attr("cx", "0.5").attr("cy", "0.5").attr("r", "0.5");
    gl.append("stop").attr("offset", "0%").attr("stop-color", `hsla(${h},72%,62%,0.4)`);
    gl.append("stop").attr("offset", "62%").attr("stop-color", `hsla(${h},72%,62%,0.1)`);
    gl.append("stop").attr("offset", "100%").attr("stop-color", `hsla(${h},72%,62%,0)`);
  });
}

// ---- hover tooltip (fixed at bottom-center, not cursor-following) ----
let ttTimer = null;
function showTooltip(d) {
  if (ttTimer) { clearTimeout(ttTimer); ttTimer = null; }
  tooltip.innerHTML =
    `<div class="tt-title">${d.title}</div>` +
    (d.hook ? `<div class="tt-hook">${d.hook}</div>` : "") +
    `<div class="tt-tags">${(d.tags || []).map((t) => `<span>${t}</span>`).join("")}</div>`;
  tooltip.style.setProperty("--tt-accent", colorOf(d));
  tooltip.classList.add("show");
}
function hideTooltip() {
  if (ttTimer) clearTimeout(ttTimer);
  ttTimer = setTimeout(() => { tooltip.classList.remove("show"); ttTimer = null; }, 140);
}

// ---- PRD panel ----
let hideTimer = null;
function togglePanel(d) {
  if (panel.classList.contains("open") && panel.dataset.slug === d.slug) closePanel();
  else openPanel(d);
}
async function openPanel(d) {
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } // cancel a pending close
  if (window.getSelection) window.getSelection().removeAllRanges(); // don't leave a click-drag text selection
  panel.dataset.slug = d.slug;
  const accent = colorOf(d);
  panel.style.setProperty("--accent", accent);
  panel.style.setProperty("--accent-soft", colorAlpha(d, 0.14));
  document.getElementById("panel-title").textContent = d.title;
  document.getElementById("panel-hook").textContent = d.hook || "";
  const tags = document.getElementById("panel-tags");
  tags.innerHTML = "";
  const sc = document.createElement("span");
  sc.className = "score-chip";
  sc.textContent = "score " + (Number.isFinite(d.score) ? d.score : "—");
  sc.style.color = accent;
  sc.style.borderColor = colorAlpha(d, 0.6);
  tags.appendChild(sc);
  if (d.created) {
    const dc = document.createElement("span");
    dc.className = "date-chip";
    dc.textContent = "added " + fmtDate(d.created);
    tags.appendChild(dc);
  }
  (d.tags || []).forEach((tg) => {
    const el = document.createElement("span");
    el.textContent = tg;
    if (activeTags.has(tg)) el.classList.add("active");
    el.addEventListener("click", () => toggleTag(tg));
    tags.appendChild(el);
  });

  const prdEl = document.getElementById("panel-prd");
  prdEl.style.opacity = "0"; // fade current content out to blank
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add("open"));

  try {
    const res = await fetch(`./data/prds/${d.slug}.md`, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    // strip a leading H1 that just repeats the title (the panel already shows it)
    const md = (await res.text()).replace(/^\s*#\s+.*\r?\n+/, "");
    if (panel.dataset.slug !== d.slug) return; // a newer click won the race — don't clobber it
    prdEl.innerHTML = marked.parse(md);
  } catch (e) {
    if (panel.dataset.slug !== d.slug) return;
    prdEl.innerHTML = "<p style='color:var(--ink-dim)'>No PRD written yet for this idea.</p>";
  }
  prdEl.scrollTop = 0;
  requestAnimationFrame(() => { prdEl.style.opacity = "1"; }); // fade new content in
}
function closePanel() {
  panel.classList.remove("open");
  panel.dataset.slug = "";
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => { panel.hidden = true; hideTimer = null; }, 320);
}
document.getElementById("panel-close").addEventListener("click", closePanel);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (panel.classList.contains("open")) closePanel();
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
  if (activeTags.size && !(d.tags || []).some((t) => activeTags.has(t))) return true;
  if (!matchesSearch(d)) return true;
  return false;
}
function applyFilter() {
  svg.selectAll("g.bubble").classed("dim", isDimmed);
  document.querySelectorAll("#tagfilter-list .tp").forEach((el) => el.classList.toggle("on", activeTags.has(el.dataset.tag)));
  document.querySelectorAll("#panel-tags span:not(.score-chip):not(.date-chip)").forEach((el) => el.classList.toggle("active", activeTags.has(el.textContent)));
  const tfClear = document.getElementById("tf-clear");
  if (tfClear) tfClear.hidden = activeTags.size === 0;

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
// multi-select: toggle each tag independently; a bubble stays lit if it has ANY active tag
function toggleTag(tag) {
  if (activeTags.has(tag)) activeTags.delete(tag);
  else activeTags.add(tag);
  applyFilter();
}
// bottom-left = a small color-scale key (color === score)
function buildColorKey() {
  legendEl.innerHTML = `<span class="legend-cap">color = score</span><span class="score-bar" title="low → high"></span>`;
}

// fixed left panel = full tag filter (all tags, sorted by frequency)
function buildTagFilter(nodes) {
  const counts = {};
  nodes.forEach((d) => (d.tags || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
  const tags = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
  const list = document.getElementById("tagfilter-list");
  list.innerHTML = "";
  tags.forEach((t) => {
    const el = document.createElement("button");
    el.className = "tp";
    el.dataset.tag = t;
    el.innerHTML = `${t}<span class="n">${counts[t]}</span>`;
    el.addEventListener("click", () => toggleTag(t));
    list.appendChild(el);
  });
}

// control wiring (elements exist at load)
document.getElementById("search").addEventListener("input", (e) => { searchQuery = e.target.value.trim(); applyFilter(); });
document.getElementById("tf-clear").addEventListener("click", clearFilters);
// tag panel collapse (used on mobile, where it's a bottom sheet)
(function () {
  const panelEl = document.getElementById("tagfilter");
  // whole panel is the toggle target (wide hit area) — except clicking a tag chip or clear
  panelEl.addEventListener("click", (e) => {
    if (e.target.closest("#tf-clear") || e.target.closest(".tp")) return;
    panelEl.classList.toggle("collapsed");
  });
  panelEl.classList.add("collapsed"); // start closed — click "Filter by tag" to open
})();

function render(ideas) {
  document.getElementById("idea-count").textContent = ideas.length;
  document.getElementById("empty").hidden = ideas.length > 0;

  // seed a spread phyllotaxis (sunflower) layout around center so the initial settle
  // only has to refine spacing — not un-crunch a tight pile (which left overlaps).
  allNodes = ideas.map((d, i) => {
    const angle = i * 2.3999632; // golden angle
    const rr = 22 * Math.sqrt(i + 0.5);
    return {
      ...d, r: radiusFor(d.score, ideas.length), _ph: i * 1.7,
      x: width / 2 + rr * Math.cos(angle),
      y: height / 2 + rr * Math.sin(angle),
    };
  });
  buildDefs(allNodes);
  buildColorKey();
  buildTagFilter(allNodes);

  // Cohesion model: gentle pull toward center + collision packing => bubbles nestle
  // together with no gaps. Pull one out and neighbors flow in to fill the hole; the
  // dragged bubble gently rejoins instead of snapping to a fixed home.
  const sim = d3.forceSimulation(allNodes)
    .force("collide", d3.forceCollide().radius((d) => d.r + 4).strength(1).iterations(4))
    .force("x", d3.forceX(width / 2).strength(0.02))  // weak cohesion: fills gaps gently, no squeeze
    .force("y", d3.forceY(height / 2).strength(0.02))
    .alphaDecay(0.02);

  // viewport group so we can pan/zoom the whole cloud
  const viewport = svg.selectAll("g.viewport").data([0]).join("g").attr("class", "viewport");
  const g = viewport.selectAll("g.bubble")
    .data(allNodes, (d) => d.slug)
    .join("g")
    .attr("class", "bubble")
    .on("click", (_, d) => togglePanel(d))
    .on("mouseenter", (_, d) => showTooltip(d))
    .on("mouseleave", hideTooltip);

  g.append("circle")
    .attr("class", "halo")
    .attr("r", (d) => d.r * 1.5)
    .attr("fill", (d) => `url(#glow-${d.slug})`)
    .style("pointer-events", "none");

  g.append("circle")
    .attr("class", "body")
    .attr("r", (d) => d.r)
    .attr("fill", (d) => `url(#grad-${d.slug})`)
    .attr("stroke", (d) => colorAlpha(d, 0.85))
    .attr("stroke-width", 1.4);

  g.append("text").call((sel) => sel.each(function (d) { fitText(d3.select(this), d); }));

  // Drag moves ONLY the grabbed bubble. The sim is never reheated after the initial
  // settle, so the rest of the constellation stays put (no re-pack into a rectangle).
  const drag = d3.drag()
    .clickDistance(12) // a small hand-wobble still counts as a click, not a drag
    .on("start", (event, d) => { if (event.sourceEvent) event.sourceEvent.stopPropagation(); d.fx = d.x; d.fy = d.y; })
    .on("drag", (event, d) => { sim.alphaTarget(0.35).restart(); d.fx = event.x; d.fy = event.y; }) // wake collide -> shove neighbors
    // leave d.fx/d.fy PINNED at the drop point so the bubble stays where you dropped it;
    // gentle reheat so neighbors ease in to fill the gap without the cloud squeezing.
    .on("end", (event, d) => { sim.alphaTarget(0).alpha(0.35).restart(); });
  g.call(drag);

  // point-and-hold on empty space to pan; wheel to zoom
  const zoom = d3.zoom().scaleExtent([0.02, 4])
    .on("zoom", (event) => viewport.attr("transform", event.transform));
  svg.call(zoom).on("dblclick.zoom", null);

  // "random idea" button opens a random PRD
  const randomBtn = document.getElementById("random-btn");
  if (randomBtn) randomBtn.onclick = () => {
    const pool = allNodes.filter((d) => !isDimmed(d));
    const pick = (pool.length ? pool : allNodes)[Math.floor(Math.random() * (pool.length ? pool.length : allNodes.length))];
    if (pick) openPanel(pick);
  };

  // pre-settle the layout synchronously so bubbles don't visibly jump on load.
  // (No position clamp — clamping only fires on the sim timer, so it used to SNAP the
  // cloud into the viewport band on the first drag. The fit-zoom below frames it instead.)
  sim.stop();
  for (let i = 0; i < 360; i++) sim.tick();

  // fit the settled constellation into view (auto-scales as the cloud grows)
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  allNodes.forEach((d) => {
    minX = Math.min(minX, d.x - d.r); maxX = Math.max(maxX, d.x + d.r);
    minY = Math.min(minY, d.y - d.r); maxY = Math.max(maxY, d.y + d.r);
  });
  const pad = width < 640 ? 24 : 80;
  const k = Math.max(0.35, Math.min(1, (width - pad) / (maxX - minX), (height - pad) / (maxY - minY)));
  const tx = width / 2 - k * (minX + maxX) / 2;
  const ty = height / 2 - k * (minY + maxY) / 2;
  svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(k));

  function floatFrame(ts) {
    const t = ts / 1000;
    g.attr("transform", (d) => {
      // per-bubble amplitude/frequency so the cloud drifts organically, not in lockstep
      const sx = 0.45 + (d._ph % 0.7);
      const sy = 0.4 + ((d._ph * 1.3) % 0.7);
      const fx = Math.sin(t * sx + d._ph) * 8;
      const fy = Math.cos(t * sy + d._ph * 1.3) * 7;
      return `translate(${d.x + fx},${d.y + fy})`;
    });
    requestAnimationFrame(floatFrame);
  }
  requestAnimationFrame(floatFrame);

  // reveal: fade the settled cloud in and dismiss the loader
  document.body.classList.add("ready");
  const loader = document.getElementById("loader");
  if (loader) { loader.classList.add("gone"); setTimeout(() => loader.remove(), 550); }

  // keep dims current for bounds math, but don't reheat the sim (that would re-pack the cloud)
  window.addEventListener("resize", () => {
    width = window.innerWidth; height = window.innerHeight;
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
