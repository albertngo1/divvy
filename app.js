// Divvy — static bubble-cloud front-end.
// Reads data/ideas.json, renders a d3 force-directed cloud,
// click a bubble -> fetch data/prds/<slug>.md and render it.

const PALETTE = ["#ffd166", "#6ee7d0", "#b794f6", "#f78da7", "#7cc4ff"];

const svg = d3.select("#cloud");
const panel = document.getElementById("panel");
const scrim = document.getElementById("scrim");

let width = window.innerWidth;
let height = window.innerHeight;

function colorFor(idea, i) {
  return PALETTE[i % PALETTE.length];
}

// radius scales with score (fallback 50)
function radiusFor(score) {
  const s = Number.isFinite(score) ? score : 50;
  return 34 + (Math.max(0, Math.min(100, s)) / 100) * 56;
}

function wrap(text, radius) {
  text.each(function () {
    const t = d3.select(this);
    const words = t.text().split(/\s+/);
    const lineHeight = 15;
    const maxChars = Math.max(6, Math.floor(radius / 4.2));
    let lines = [], cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > maxChars) {
        if (cur) lines.push(cur);
        cur = w;
      } else {
        cur = (cur + " " + w).trim();
      }
    }
    if (cur) lines.push(cur);
    lines = lines.slice(0, 3);
    t.text(null);
    const y0 = -((lines.length - 1) * lineHeight) / 2;
    lines.forEach((ln, i) => {
      t.append("tspan")
        .attr("x", 0)
        .attr("y", y0 + i * lineHeight)
        .attr("font-size", Math.max(10, Math.min(15, radius / 4.5)))
        .text(ln);
    });
  });
}

async function openPanel(idea) {
  document.getElementById("panel-title").textContent = idea.title;
  document.getElementById("panel-hook").textContent = idea.hook || "";
  const tags = document.getElementById("panel-tags");
  tags.innerHTML = "";
  (idea.tags || []).forEach((tg) => {
    const el = document.createElement("span");
    el.textContent = tg;
    tags.appendChild(el);
  });

  const prdEl = document.getElementById("panel-prd");
  prdEl.innerHTML = "<p style='color:var(--ink-dim)'>loading PRD…</p>";
  panel.hidden = false;
  scrim.hidden = false;
  requestAnimationFrame(() => panel.classList.add("open"));

  try {
    const res = await fetch(`./data/prds/${idea.slug}.md`);
    if (!res.ok) throw new Error(res.status);
    const md = await res.text();
    prdEl.innerHTML = marked.parse(md);
  } catch (e) {
    prdEl.innerHTML = "<p style='color:var(--ink-dim)'>No PRD written yet for this idea.</p>";
  }
}

function closePanel() {
  panel.classList.remove("open");
  scrim.hidden = true;
  setTimeout(() => { panel.hidden = true; }, 280);
}

document.getElementById("panel-close").addEventListener("click", closePanel);
scrim.addEventListener("click", closePanel);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePanel(); });

function render(ideas) {
  document.getElementById("idea-count").textContent = ideas.length;
  document.getElementById("empty").hidden = ideas.length > 0;

  const nodes = ideas.map((d, i) => ({
    ...d,
    r: radiusFor(d.score),
    fill: colorFor(d, i),
  }));

  const sim = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(8))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius((d) => d.r + 6).iterations(2))
    .force("x", d3.forceX(width / 2).strength(0.03))
    .force("y", d3.forceY(height / 2).strength(0.03));

  const g = svg.selectAll("g.bubble")
    .data(nodes, (d) => d.slug)
    .join("g")
    .attr("class", "bubble")
    .on("click", (_, d) => openPanel(d));

  g.append("circle")
    .attr("r", (d) => d.r)
    .attr("fill", (d) => d.fill)
    .attr("fill-opacity", 0.12)
    .attr("stroke", (d) => d.fill)
    .attr("stroke-width", 1.25);

  g.append("text")
    .text((d) => d.title)
    .call((sel) => sel.each(function (d) { wrap(d3.select(this), d.r); }));

  const drag = d3.drag()
    .on("start", (event, d) => { if (!event.active) sim.alphaTarget(0.2).restart(); d.fx = d.x; d.fy = d.y; })
    .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
    .on("end", (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });
  g.call(drag);

  sim.on("tick", () => {
    g.attr("transform", (d) => {
      d.x = Math.max(d.r, Math.min(width - d.r, d.x));
      d.y = Math.max(d.r + 50, Math.min(height - d.r, d.y));
      return `translate(${d.x},${d.y})`;
    });
  });

  window.addEventListener("resize", () => {
    width = window.innerWidth; height = window.innerHeight;
    sim.force("center", d3.forceCenter(width / 2, height / 2));
    sim.alpha(0.3).restart();
  });
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
