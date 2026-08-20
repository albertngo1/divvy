// Shared helpers for the Divvy generators (scan.mjs feed-sparked ideas + party.mjs
// parallel party-game agents). Kept dependency-free and side-effect-free on import.

import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

export function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

// Normalized title key for duplicate detection. Slug-only dedup let the model regenerate the
// same TITLE forever (unique slug via the "-2" suffix, but "Table Stakes" x6 in the cloud);
// admission loops must skip any idea whose normTitle already exists.
export function normTitle(s) {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function extractJSON(stdout) {
  const start = stdout.indexOf("[");
  const end = stdout.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("no JSON array in claude output");
  return JSON.parse(stdout.slice(start, end + 1));
}

// One-shot `claude -p`. stdin is ignored so claude doesn't block waiting on it.
export function callClaude(prompt, { timeoutMs = 1000 * 300 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", ["-p", prompt, "--dangerously-skip-permissions"], {
      stdio: ["ignore", "pipe", "inherit"],
      timeout: timeoutMs,
    });
    let out = "";
    child.stdout.on("data", (c) => { out += c; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) reject(new Error(`claude exited ${code}`));
      else resolve(out);
    });
  });
}

export async function loadIdeas(ideasFile) {
  if (!existsSync(ideasFile)) return { lastScan: "", ideas: [] };
  return JSON.parse(await readFile(ideasFile, "utf8"));
}

// --- novelty gate -----------------------------------------------------------------------
//
// Exact-title dedup (normTitle above) stays as the cheap first pass — it costs nothing and
// catches the literal repeats. This is the second pass: semantic near-duplicates, the ones
// that are the same idea under a new name ("Face Out" / "Outward", both Hanabi-where-your-
// phone-shows-everyone-else's-hand).
//
// Threshold: measured over all 3,360,528 pairs of the 2,593-idea corpus (see
// scanner/embed-corpus.mjs --report). Nearest-neighbour cosine percentiles: p50 0.742,
// p90 0.828, p99 0.870, max 0.897. Hand-inspecting random pairs by band: in [0.795,0.815)
// roughly half are genuinely distinct, so the paper's 0.80 over-rejects here; in
// [0.820,0.835) ~85% are the same idea renamed. 0.82 is therefore the knee. Tunable via
// DIVVY_NOVELTY_MAX for a run that wants to be stricter or looser.
export const NOVELTY_MAX = Number(process.env.DIVVY_NOVELTY_MAX || 0.82);

// Build the novelty checker. ALWAYS resolves; `enabled:false` means embeddings were
// unavailable and every candidate passes — generation must never stop because the model
// didn't load.
export async function openNovelty(dataDir) {
  let embed;
  try {
    embed = await import("./embed.mjs");
  } catch (e) {
    console.error(`  [novelty] off — ${e.message}`);
    return disabledNovelty();
  }
  const index = await embed.loadIndex(dataDir);
  const probe = await embed.embedOne("novelty gate warmup");
  if (!index || !probe) {
    if (!index) console.error("  [novelty] off — no embedding index (run scanner/embed-corpus.mjs)");
    return disabledNovelty();
  }
  return {
    enabled: true,
    threshold: NOVELTY_MAX,
    size: index.slugs.length,
    // Nearest existing ideas to an arbitrary piece of text (a feed digest, a theme).
    async near(text, k = 40) {
      const v = await embed.embedOne(text);
      return v ? embed.nearest(index, v, k) : [];
    },
    // Verdict on a candidate: { ok, score, nearestSlug, vec }. ok=true when embeddings failed.
    async check(idea, prd) {
      const v = await embed.embedOne(embed.ideaText(idea, prd));
      if (!v) return { ok: true, score: null, nearestSlug: null, vec: null };
      const [best] = embed.nearest(index, v, 1);
      const score = best ? best.score : 0;
      return { ok: score < NOVELTY_MAX, score, nearestSlug: best ? best.slug : null, vec: v };
    },
    // Admit a vector so two candidates in the SAME run can't be near-duplicates of each other.
    admit(slug, vec) { embed.appendToIndex(index, slug, vec); },
    async persist() {
      try { await embed.saveIndex(dataDir, index); }
      catch (e) { console.error(`  [novelty] could not persist index — ${e.message}`); }
    },
  };
}

function disabledNovelty() {
  return {
    enabled: false, threshold: null, size: 0,
    async near() { return []; },
    async check() { return { ok: true, score: null, nearestSlug: null, vec: null }; },
    admit() {},
    async persist() {},
  };
}

// Render retrieved neighbours as the prompt's avoid-list. Falls back to `fallbackTitles`
// (the old newest+random sample) whenever retrieval produced nothing.
export function avoidBlock(neighbours, byslug, fallbackTitles) {
  const lines = neighbours.length
    ? neighbours.map((n) => {
        const i = byslug.get(n.slug);
        return i ? `- ${i.title} — ${i.hook || ""}`.trim() : null;
      }).filter(Boolean)
    : fallbackTitles.map((t) => `- ${t}`);
  if (!lines.length) return "";
  const how = neighbours.length
    ? "These are the ideas ALREADY in the cloud that sit CLOSEST to what you are about to generate (retrieved by embedding similarity to this run's inputs). Do not repeat them and do not produce a near-duplicate under a different name — a renamed cousin will be rejected automatically:"
    : "Already in the cloud — do NOT repeat these or produce near-duplicates of them (this is a sample, so also avoid obvious cousins):";
  return `\n\n${how}\n${lines.join("\n")}`;
}
