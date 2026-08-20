#!/usr/bin/env node
// Build/refresh the embedding index the novelty gate reads. Incremental by default: only
// embeds slugs that aren't in the index yet, so the 3-hourly scanner run costs ~1s, not 2min.
//
//   node scanner/embed-corpus.mjs             incremental (what run.sh calls)
//   node scanner/embed-corpus.mjs --all       rebuild from scratch (~2 min for 2.6k ideas)
//   node scanner/embed-corpus.mjs --report    also print the near-duplicate distribution
//
// Writes public/data/embeddings.{bin,json} — both gitignored; a rebuildable local cache.
// Exits 0 even when embeddings are unavailable: this must never block a scanner run.

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { embedTexts, ideaText, loadIndex, emptyIndex, appendToIndex, saveIndex } from "./embed.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "public", "data");
const PRDS = join(DATA, "prds");
const IDEAS_FILE = join(DATA, "ideas.json");

const ALL = process.argv.includes("--all");
const REPORT = process.argv.includes("--report");

const prdFor = async (slug) => {
  const p = join(PRDS, `${slug}.md`);
  return existsSync(p) ? readFile(p, "utf8") : "";
};

async function main() {
  const { ideas } = JSON.parse(await readFile(IDEAS_FILE, "utf8"));
  const index = (!ALL && (await loadIndex(DATA))) || emptyIndex();

  const todo = ideas.filter((i) => !index.rows.has(i.slug));
  console.log(`corpus ${ideas.length} ideas; index ${index.slugs.length}; ${todo.length} to embed`);

  if (todo.length) {
    const t0 = Date.now();
    const texts = [];
    for (const i of todo) texts.push(ideaText(i, await prdFor(i.slug)));
    const vecs = await embedTexts(texts, (n) => { if (n % 200 === 0) process.stderr.write(`  ${n}/${todo.length}\r`); });
    if (!vecs.length) {
      console.error("embed-corpus: embeddings unavailable — index left as-is");
      if (REPORT) process.exitCode = 1;
      return;
    }
    todo.forEach((i, k) => appendToIndex(index, i.slug, vecs[k]));
    console.log(`embedded ${vecs.length} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }

  // Drop rows for slugs no longer in the corpus (rebuild the matrix without them).
  const live = new Set(ideas.map((i) => i.slug));
  if (index.slugs.some((s) => !live.has(s))) {
    const keep = index.slugs.map((s, i) => [s, i]).filter(([s]) => live.has(s));
    const next = emptyIndex();
    for (const [s, i] of keep) appendToIndex(next, s, index.mat.subarray(i * index.dim, (i + 1) * index.dim));
    index.slugs = next.slugs; index.rows = next.rows; index.mat = next.mat;
  }

  await saveIndex(DATA, index);
  console.log(`index: ${index.slugs.length} vectors -> public/data/embeddings.bin`);

  if (REPORT) report(ideas, index);
}

function report(ideas, index) {
  const byslug = new Map(ideas.map((i) => [i.slug, i]));
  const { slugs, mat, dim } = index;
  const n = slugs.length;
  const BUCKETS = [0.95, 0.9, 0.85, 0.82, 0.8, 0.75, 0.7, 0.65];
  const counts = new Array(BUCKETS.length).fill(0);
  const maxSim = new Float32Array(n).fill(-1);
  const top = [];

  for (let i = 0; i < n; i++) {
    const oi = i * dim;
    for (let j = i + 1; j < n; j++) {
      const oj = j * dim;
      let s = 0;
      for (let d = 0; d < dim; d++) s += mat[oi + d] * mat[oj + d];
      if (s > maxSim[i]) maxSim[i] = s;
      if (s > maxSim[j]) maxSim[j] = s;
      for (let b = 0; b < BUCKETS.length; b++) if (s >= BUCKETS[b]) counts[b]++;
      if (s >= 0.85) top.push([s, i, j]);
    }
    if (i % 250 === 0) process.stderr.write(`  pairs ${i}/${n}\r`);
  }
  top.sort((a, b) => b[0] - a[0]);
  const totalPairs = (n * (n - 1)) / 2;

  console.log(`\n=== near-duplicate distribution (${n} ideas, ${totalPairs.toLocaleString()} pairs) ===`);
  BUCKETS.forEach((t, b) => {
    let ideasOver = 0;
    for (let i = 0; i < n; i++) if (maxSim[i] >= t) ideasOver++;
    console.log(`  cos >= ${t.toFixed(2)}: ${String(counts[b]).padStart(7)} pairs   ${String(ideasOver).padStart(5)} ideas with such a neighbour (${((ideasOver / n) * 100).toFixed(2)}%)`);
  });

  const sorted = Array.from(maxSim).sort((a, b) => a - b);
  const pct = (p) => sorted[Math.floor((p / 100) * (n - 1))].toFixed(4);
  console.log(`\nper-idea nearest-neighbour cosine: p50=${pct(50)} p75=${pct(75)} p90=${pct(90)} p95=${pct(95)} p99=${pct(99)} max=${pct(100)}`);

  console.log(`\n=== top ${Math.min(15, top.length)} pairs ===`);
  for (const [s, i, j] of top.slice(0, 15)) {
    const a = byslug.get(slugs[i]), b = byslug.get(slugs[j]);
    console.log(`  ${s.toFixed(4)}  "${a.title}" <-> "${b.title}"`);
  }
}

main().catch((e) => { console.error("embed-corpus failed:", e.message); process.exit(1); });
