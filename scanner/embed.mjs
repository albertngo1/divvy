// On-device sentence embeddings powering Divvy's novelty gate + retrieved avoid-list.
//
// Model: Xenova/all-MiniLM-L6-v2 (384-d, quantized ONNX, cached under ~/.cache/huggingface —
// NOT in the repo). Chosen because Si et al. (ICLR 2025, arxiv 2409.04109) used the same model
// at cosine 0.8 to measure duplication in LLM-generated idea pools.
//
// EVERYTHING HERE FAILS SOFT. The scanner runs unattended every 3h; if the model can't load
// (no weights cached and no network, package missing, OOM) every export returns null/[] and
// the generators fall back to the pre-existing exact-title dedup + random avoid-list. Set
// DIVVY_NO_EMBED=1 to force that path (used to test it).
//
// Index on disk (both gitignored — a rebuildable local cache, not source):
//   public/data/embeddings.bin   raw little-endian Float32, n * 384, row i = slugs[i]
//   public/data/embeddings.json  { model, dim, slugs: [...] }

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

export const EMBED_MODEL = "Xenova/all-MiniLM-L6-v2";
export const EMBED_DIM = 384;

let pipePromise = null;

// Feature-extraction pipeline, or null if embeddings are unavailable.
export async function getEmbedder() {
  if (process.env.DIVVY_NO_EMBED === "1") return null;
  if (!pipePromise) {
    pipePromise = (async () => {
      const { pipeline } = await import("@xenova/transformers");
      return pipeline("feature-extraction", EMBED_MODEL, { quantized: true });
    })().catch((e) => {
      console.error(`  [embed] disabled — ${e.message}`);
      return null;
    });
  }
  return pipePromise;
}

// Embed strings -> array of Float32Array unit vectors. Returns [] if embeddings are off.
export async function embedTexts(texts, onProgress) {
  if (!texts.length) return [];
  const pipe = await getEmbedder();
  if (!pipe) return [];
  const out = [];
  try {
    for (let i = 0; i < texts.length; i += 32) {
      const batch = texts.slice(i, i + 32);
      const res = await pipe(batch, { pooling: "mean", normalize: true });
      const dim = res.dims[res.dims.length - 1];
      for (let k = 0; k < batch.length; k++) out.push(res.data.slice(k * dim, (k + 1) * dim));
      if (onProgress) onProgress(out.length);
    }
  } catch (e) {
    console.error(`  [embed] failed mid-batch — ${e.message}`);
    return [];
  }
  return out;
}

export async function embedOne(text) {
  const v = await embedTexts([text]);
  return v[0] || null;
}

const firstWords = (s, n) => (s || "").split(/\s+/).filter(Boolean).slice(0, n).join(" ");

// The canonical text an idea is embedded as: title + hook + first 200 words of its PRD.
export function ideaText(idea, prd = "") {
  return `${idea.title || ""}. ${idea.hook || ""} ${firstWords(String(prd).replace(/^#+ /gm, ""), 200)}`.trim();
}

const binPath = (dataDir) => join(dataDir, "embeddings.bin");
const metaPath = (dataDir) => join(dataDir, "embeddings.json");

// Load the persisted index -> { slugs, rows: Map<slug,int>, mat: Float32Array, dim }.
// null when missing, stale (different model), or unreadable — the caller MUST handle null.
export async function loadIndex(dataDir) {
  try {
    if (!existsSync(binPath(dataDir)) || !existsSync(metaPath(dataDir))) return null;
    const meta = JSON.parse(await readFile(metaPath(dataDir), "utf8"));
    if (meta.model !== EMBED_MODEL || !Array.isArray(meta.slugs)) return null;
    const dim = meta.dim || EMBED_DIM;
    const buf = await readFile(binPath(dataDir));
    if (buf.byteLength !== meta.slugs.length * dim * 4) return null;
    const mat = new Float32Array(buf.buffer, buf.byteOffset, meta.slugs.length * dim);
    const rows = new Map(meta.slugs.map((s, i) => [s, i]));
    return { slugs: meta.slugs.slice(), rows, mat, dim };
  } catch (e) {
    console.error(`  [embed] index unreadable — ${e.message}`);
    return null;
  }
}

export function emptyIndex() {
  return { slugs: [], rows: new Map(), mat: new Float32Array(0), dim: EMBED_DIM };
}

// Append a vector in memory so candidates within one run are checked against each other too.
export function appendToIndex(index, slug, vec) {
  if (!index || !vec) return;
  const next = new Float32Array(index.mat.length + index.dim);
  next.set(index.mat);
  next.set(vec, index.mat.length);
  index.mat = next;
  index.rows.set(slug, index.slugs.length);
  index.slugs.push(slug);
}

export async function saveIndex(dataDir, index) {
  const meta = { model: EMBED_MODEL, dim: index.dim, built: new Date().toISOString(), slugs: index.slugs };
  await writeFile(binPath(dataDir), Buffer.from(index.mat.buffer, index.mat.byteOffset, index.mat.length * 4));
  await writeFile(metaPath(dataDir), JSON.stringify(meta));
}

// k nearest corpus neighbours of a unit vector -> [{ slug, score }]. [] if either is missing.
export function nearest(index, vec, k = 40) {
  if (!index || !vec || !index.slugs.length) return [];
  const { slugs, mat, dim } = index;
  const scored = new Array(slugs.length);
  for (let i = 0; i < slugs.length; i++) {
    let s = 0;
    const o = i * dim;
    for (let d = 0; d < dim; d++) s += mat[o + d] * vec[d];
    scored[i] = { slug: slugs[i], score: s };
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}
