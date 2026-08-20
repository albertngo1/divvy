#!/usr/bin/env node
// Divvy party-game generator: spawn several `claude` agents IN PARALLEL, each riffing a
// themed round of concurrent-room party games (a shared host TV/laptop + every player's
// phone as a PRIVATE controller, Jackbox-shaped), then merge the winners into
// public/data/ideas.json and write public/data/prds/<slug>.md.
//
// Runs as part of the scheduled Divvy worker (com.divvy-scanner) alongside scan.mjs.
// Knobs: DIVVY_PARTY_AGENTS (parallel agents/run, default 3), DIVVY_PARTY_N (ideas each,
// default 2), DIVVY_DRY=1 (call the agents but write nothing — for verification),
// DIVVY_AVOID_K (retrieved neighbours per agent prompt, default 40), DIVVY_NOVELTY_MAX
// (semantic near-duplicate threshold), DIVVY_NO_EMBED=1 (force the no-embeddings fallback).

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { slugify, normTitle, shuffle, extractJSON, callClaude, loadIdeas, openNovelty, avoidBlock } from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const DATA = join(ROOT, "public", "data");
const PRDS = join(DATA, "prds");
const IDEAS_FILE = join(DATA, "ideas.json");

const AGENTS = Number(process.env.DIVVY_PARTY_AGENTS || 3); // parallel agents per run
const PER_AGENT = Number(process.env.DIVVY_PARTY_N || 2);   // ideas each agent returns
const DRY = process.env.DIVVY_DRY === "1";
const AVOID_K = Number(process.env.DIVVY_AVOID_K || 40); // retrieved neighbours per agent

// Rotating themes — each parallel agent gets a DIFFERENT lens so a run fans out instead
// of converging on the same flavor. Distilled from the party-game brainstorm rounds.
const THEMES = [
  "hidden-role social deduction where the imposter reads a subtly-different private view",
  "convergence / synchrony — players secretly try to MATCH each other with no talking",
  "voice + real-time coordination in the Spaceteam / Devils & the Details lineage",
  "reward silence, punish talking — the mic is an enforced constraint",
  "one player's phone is the map/board; the others are pieces who can't see it",
  "an underused phone sensor (compass, accelerometer, mic level) + the physical room as the board",
  "riff on a real tabletop party game (Chameleon, Wavelength, Anomia) and make per-phone privacy load-bearing",
  "a small in-browser LLM's entropy / perplexity is the actual scoring engine",
  "the win condition is NOT points — a keepsake, staying anonymous, a shared artifact",
  "coordination is the FAILURE mode, not the goal — collisions punish you",
  "turn something a group passively consumes (a show, a menu) into a private-betting competition",
  "a tabletop mechanic tedious in person (drafting, auctions) made elegant when each phone holds private state",
  "steal a video-game genre (roguelike, fighting-game combos, rhythm, deckbuilder) and squeeze it into per-phone party form",
];

const PRD_SECTIONS =
  "## Overview (what it is, for whom); ## Problem (the itch); " +
  "## How it works (the core mechanic/flow, concretely — including exactly what each phone shows PRIVATELY vs. the shared host screen); " +
  "## Technical approach (assume a host browser tab + phone PWA clients + an authoritative WebSocket server, e.g. PartyKit / Cloudflare Durable Objects or Socket.IO over Tailscale Serve; give the data model, the sync strategy, and the genuinely hard part — usually real-time sync); " +
  "## v1 scope (humiliatingly small) as bullets; ## Out of scope (for now); ## Risks & unknowns; " +
  "## Done means (a concrete, testable definition)";

function buildPartyPrompt(theme, avoid) {
  return `You are a party-game designer for "Divvy", an idea cloud. Design ${PER_AGENT} FRESH concurrent-room party games: a shared host screen (TV/laptop) plus every player's phone as a PRIVATE controller (Jackbox-shaped).

Theme for this batch — every idea must genuinely embody it:
${theme}

TWO HARD CONSTRAINTS (reject your own idea if it fails either):
1. Per-phone architecture must be LOAD-BEARING to the fun — if the game works just as well with one phone passed around the room, it does NOT belong. Private, asymmetric, or simultaneous-per-phone state must be the point.
2. The v1 scope must be humiliatingly small — one round, a handful of players, the minimum that proves the fun.

Be genuinely creative. Favor a novel ANGLE over a novel topic. Skip anything that's just a reskin of Quiplash / Codenames / Werewolf without a real twist.

Return ONLY a JSON array (no prose, no code fence). Each element:
{
  "title": "2-4 word punchy name",
  "hook": "one vivid sentence pitching it",
  "tags": ["party", "...2-3 more, lowercase-hyphenated, e.g. social-deduction, cooperative, wordgame, audio, sensor, browser-game"],
  "score": integer 40-90 — calibrate HONESTLY; be a harsh critic and SPREAD the scores. Most land 60-72; 78+ is a rare standout, at most one per batch.
  "prd": "a DETAILED markdown PRD, 350-600 words, with these sections: ${PRD_SECTIONS}"
}${avoid}`;
}

async function main() {
  await mkdir(PRDS, { recursive: true });
  const store = await loadIdeas(IDEAS_FILE);
  const existing = new Set(store.ideas.map((i) => i.slug));
  const seenTitles = new Set(store.ideas.map((i) => normTitle(i.title)));
  const byslug = new Map(store.ideas.map((i) => [i.slug, i]));

  // Novelty index (semantic). Fails soft: `enabled:false` => every candidate is admitted and
  // the avoid-list falls back to the old newest-80 + random-120 party-title sample.
  const novelty = await openNovelty(DATA);
  const partyTitles = store.ideas.filter((i) => (i.tags || []).includes("party")).map((i) => i.title);
  const fallback = [...partyTitles.slice(0, 80), ...shuffle(partyTitles.slice(80)).slice(0, 120)];

  const themes = shuffle(THEMES).slice(0, Math.max(1, AGENTS));
  console.log(`Divvy party: novelty ${novelty.enabled ? `on (${novelty.size} vectors, max cos ${novelty.threshold})` : "OFF — title dedup only"}; spawning ${themes.length} parallel agent(s), ${PER_AGENT} idea(s) each${DRY ? " [dry]" : ""}...`);

  // RETRIEVED avoid-list, PER AGENT: each theme gets the existing ideas nearest to THAT theme
  // instead of one shared random sample — same token budget, aimed where it will generate.
  const avoids = [];
  for (const t of themes) {
    const neighbours = await novelty.near(t, AVOID_K);
    if (!avoids.length) console.log(`  avoid-list: ${neighbours.length ? `${neighbours.length} retrieved per agent` : `${fallback.length} sampled (fallback)`}`);
    avoids.push(avoidBlock(neighbours, byslug, fallback));
  }

  // The fan-out: every agent runs concurrently; one failing agent doesn't sink the batch.
  const settled = await Promise.allSettled(
    themes.map((t, i) => callClaude(buildPartyPrompt(t, avoids[i])).then(extractJSON)),
  );

  const fresh = [];
  settled.forEach((s, i) => {
    if (s.status === "fulfilled" && Array.isArray(s.value)) fresh.push(...s.value);
    else console.error(`  agent ${i + 1} failed: ${s.reason?.message || "bad output"}`);
  });

  const today = new Date().toISOString().slice(0, 10);
  let added = 0, skipped = 0, tooSimilar = 0;
  for (const idea of fresh) {
    if (!idea.title) continue;
    const tkey = normTitle(idea.title);
    if (seenTitles.has(tkey)) { skipped++; continue; } // cheap first pass: exact-title dedup,
                                                       // also catches two agents sharing a title

    // Second pass: semantic novelty gate — the renamed-cousin case the title check misses.
    const verdict = await novelty.check(idea, idea.prd || "");
    if (!verdict.ok) {
      tooSimilar++;
      console.log(`  [dup] "${idea.title}" ~ ${verdict.nearestSlug} (cos ${verdict.score.toFixed(3)})`);
      continue;
    }

    seenTitles.add(tkey);
    let slug = slugify(idea.title);
    if (!slug) continue;
    for (let n = 2; existing.has(slug); n++) slug = `${slugify(idea.title)}-${n}`;
    existing.add(slug);

    let tags = Array.isArray(idea.tags) ? idea.tags.slice(0, 4) : ["party"];
    if (tags[0] !== "party") tags = ["party", ...tags.filter((t) => t !== "party")].slice(0, 4);
    const rec = {
      slug,
      title: idea.title,
      hook: idea.hook || "",
      tags,
      score: Number.isFinite(idea.score) ? idea.score : 60,
      source: "party",
      created: today,
    };

    // Admit into the in-memory index so a LATER agent's idea can't duplicate this one.
    novelty.admit(slug, verdict.vec);
    if (DRY) {
      console.log(`  [dry] ${rec.score}  ${slug}${verdict.score !== null ? `  (nearest ${verdict.score.toFixed(3)})` : ""}  — ${rec.hook}`);
      added++;
      continue;
    }
    if (idea.prd) await writeFile(join(PRDS, `${slug}.md`), idea.prd.trim() + "\n");
    store.ideas.unshift(rec);
    byslug.set(slug, rec);
    added++;
  }

  const notes = [skipped ? `${skipped} dup-title` : "", tooSimilar ? `${tooSimilar} too-similar` : ""].filter(Boolean).join(", ");
  if (DRY) {
    console.log(`Divvy party [dry]: would add ${added} idea(s) from ${themes.length} agent(s)${notes ? ` (${notes} skipped)` : ""}.`);
    return;
  }
  store.lastScan = today;
  await writeFile(IDEAS_FILE, JSON.stringify(store, null, 2) + "\n");
  await novelty.persist();
  console.log(`Divvy party: added ${added} idea(s) from ${themes.length} agent(s)${notes ? ` (${notes} skipped)` : ""}; ${store.ideas.length} total.`);
}

main().catch((e) => { console.error("party failed:", e.message); process.exit(1); });
