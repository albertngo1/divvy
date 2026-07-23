#!/usr/bin/env node
// Divvy scanner: scrape several public feeds (Hacker News, trending GitHub repos,
// popular Steam games), riff new project/game ideas via `claude -p`, then merge into
// data/ideas.json and write data/prds/<slug>.md for each new idea.

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { slugify, normTitle, shuffle, extractJSON, callClaude, loadIdeas } from "./lib.mjs";
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const DATA = join(ROOT, "public", "data"); // Vite serves public/ at the site root
const PRDS = join(DATA, "prds");
const IDEAS_FILE = join(DATA, "ideas.json");

const HOW_MANY = Number(process.env.DIVVY_N || 3);

async function tryFetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

async function tryFetchText(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

// Pull entry titles out of an Atom/RSS feed without an XML dependency.
function feedTitles(xml, max) {
  const chunks = xml.split(/<(?:entry|item)[ >]/i).slice(1); // drop the feed-level header
  const titles = [];
  for (const c of chunks) {
    const m = c.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!m) continue;
    const t = m[1].replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
    if (t) titles.push(t);
  }
  return titles.slice(0, max);
}

// --- sources: each returns { label, lines } or throws (skipped on failure) ---

async function srcHN() {
  const json = await tryFetchJSON("https://hn.algolia.com/api/v1/search?tags=front_page");
  const lines = (json.hits || []).filter((h) => h.title).slice(0, 20)
    .map((h) => `- ${h.title}${h.url ? ` (${h.url})` : ""} [${h.points || 0} pts]`);
  return { label: "Hacker News front page", lines };
}

async function srcGitHub() {
  // Recently-pushed, well-starred repos ≈ what's trending right now.
  const since = new Date(Date.now() - 21 * 864e5).toISOString().slice(0, 10);
  const url = `https://api.github.com/search/repositories?q=stars:>800+pushed:>${since}&sort=updated&order=desc&per_page=30`;
  const json = await tryFetchJSON(url, {
    headers: { "User-Agent": "divvy-scanner", Accept: "application/vnd.github+json" },
  });
  const lines = shuffle(json.items || []).slice(0, 18)
    .map((r) => `- ${r.full_name} (★${r.stargazers_count}): ${r.description || "no description"}`);
  return { label: "Trending GitHub repos", lines };
}

async function srcSteam() {
  // SteamSpy: games with the most players in the last two weeks.
  const json = await tryFetchJSON("https://steamspy.com/api.php?request=top100in2weeks", {
    headers: { "User-Agent": "divvy-scanner" },
  });
  const games = Object.values(json || {}).filter((g) => g && g.name);
  const lines = shuffle(games).slice(0, 18).map((g) => `- ${g.name} (${g.genre || "game"})`);
  return { label: "Popular Steam games (last 2 weeks)", lines };
}

async function srcLobsters() {
  const json = await tryFetchJSON("https://lobste.rs/hottest.json", {
    headers: { "User-Agent": "divvy-scanner" },
  });
  const lines = (Array.isArray(json) ? json : []).filter((s) => s.title).slice(0, 20)
    .map((s) => `- ${s.title}${s.url ? ` (${s.url})` : ""} [${s.score || 0} pts]`);
  return { label: "Lobsters hottest", lines };
}

async function srcProductHunt() {
  const xml = await tryFetchText("https://www.producthunt.com/feed", {
    headers: { "User-Agent": "divvy-scanner" },
  });
  const lines = feedTitles(xml, 20).map((t) => `- ${t}`);
  return { label: "Product Hunt new launches", lines };
}

async function srcArxiv() {
  // Newest human-computer-interaction & graphics papers — fertile, offbeat sparks.
  const url = "http://export.arxiv.org/api/query?search_query=cat:cs.HC+OR+cat:cs.GR&sortBy=submittedDate&sortOrder=descending&max_results=20";
  const xml = await tryFetchText(url, { headers: { "User-Agent": "divvy-scanner" } });
  const lines = feedTitles(xml, 18).map((t) => `- ${t}`);
  return { label: "Recent arXiv HCI/graphics papers", lines };
}

// Rotating provocations so runs don't converge on the same flavor. Deliberately weighted
// AWAY from multiplayer/party games (the cloud is already saturated with those) and toward
// solo tools, toys, viz, science, and real businesses.
const PROVOCATIONS = [
  "A single-player desktop or browser TOOL you'd actually open daily — no multiplayer, no rooms, no party.",
  "Cross-pollinate: take a mechanic from a Steam game and apply it somewhere absurd (finance, chores, homelab ops).",
  "Find the weird overlap between two unrelated items in the feeds and build the bridge.",
  "Take a serious tool and make a toy of it, or take a toy and make it dangerously useful.",
  "Invert a popular repo's purpose — what's the mischievous or artful opposite?",
  "What ambient/background artifact could quietly generate itself over a year? (screensaver, wallpaper, menubar toy)",
  "Steal a game genre (roguelike, idle, deckbuilder, tycoon) and graft it onto real personal data — SOLO play.",
  "Pitch a real BUSINESS: who pays, for what, and why now — a small SaaS, marketplace, or service someone would actually pay for this year.",
  "Spot a painful manual workflow in a boring industry (logistics, dental, HVAC, permits, freight) and productize the fix.",
  "Find an arbitrage: data or capability that's cheap for you and valuable to a specific niche who can't get it themselves.",
  "A data-visualization or explorable-explanation of a dataset nobody has made beautiful yet.",
  "A devtool that removes one specific, daily papercut for programmers — CLI, editor, git, CI, or observability.",
  "A science/nature toy: simulate, sonify, or visualize a real physical/biological phenomenon.",
  "Take a boring personal-data source (calendar, email, receipts, wearable, browser history) and make it insightful or delightful — for one person, offline.",
  "A generative-art or audio piece that makes something new every time it runs.",
];

// Domains the cloud is HUNGRY for (party/social games are already ~40% of the cloud, so they
// are deliberately excluded here). Each run steers toward a couple of these for variety.
const HUNGRY_DOMAINS = [
  "dev & ops (devtools, git, CI, homelab, observability, CLI)",
  "ai & ml (llm apps, agents, computer-vision, embeddings)",
  "data viz (maps, timelines, dashboards, explorable explanations)",
  "science & nature (physics/biology/materials simulations & toys)",
  "finance (markets, budgeting, prediction-market plays)",
  "business & work (a real SaaS / marketplace / service someone pays for)",
  "language & text (writing tools, translation, wordgames, steganography)",
  "art & sound (generative art, music, graphics, wallpapers, screensavers)",
  "life & self (productivity, quantified-self, health, habits — solo)",
  "ambient & toys (desktop toys, menubar widgets, screensavers)",
  "security & privacy (forensics, provenance, anti-abuse)",
  "solo games (roguelike, idle, deckbuilder, tycoon, puzzle, sim — SINGLE player)",
];

// Curated pool of trusted feeds. Each run draws an ARBITRARY subset so no single
// feed (historically HN) anchors every run and skews the idea mix.
const TRUSTED_SOURCES = [srcHN, srcGitHub, srcSteam, srcLobsters, srcProductHunt, srcArxiv];
const SOURCES_PER_RUN = Number(process.env.DIVVY_SOURCES || 4);

async function gatherSources() {
  const picked = shuffle(TRUSTED_SOURCES).slice(0, Math.max(2, SOURCES_PER_RUN));
  const settled = await Promise.allSettled(picked.map((fn) => fn()));
  const blocks = [];
  for (const s of settled) {
    if (s.status === "fulfilled" && s.value.lines.length) {
      blocks.push(`### ${s.value.label}\n${s.value.lines.join("\n")}`);
    }
  }
  if (!blocks.length) throw new Error("all sources failed");
  return blocks.join("\n\n");
}

// Controlled tag vocabulary, grouped by the DOMAINS the cloud clusters ideas into (the
// "galaxies"). Keeping the scanner's tags in this vocabulary stops tag sprawl and keeps
// every idea landing cleanly in a galaxy instead of the "other" bucket.
// Aligned with the cloud's galaxy taxonomy (src/cloud.ts ORDER). Solo/topical domains first;
// the party/social genres are grouped last and flagged as saturated in the prompt.
const DOMAIN_TAGS = {
  "dev & ops": ["devtool", "git", "ci", "docker", "kubernetes", "sql", "postgres", "homelab", "self-hosted", "observability", "cli", "logs", "telemetry"],
  "ai & ml": ["llm", "ml", "agents", "prompt", "computer-vision", "embeddings"],
  "data viz": ["data-viz", "map", "timeline", "3d-viz", "gis", "dashboard", "visualization"],
  "science & nature": ["physics", "astronomy", "biology", "chemistry", "nature", "materials", "cellular-automata"],
  "finance": ["finance", "economics", "prediction-market", "markets", "budgeting"],
  "business & work": ["business", "saas", "marketplace", "b2b", "startup", "logistics", "crm", "automation", "side-hustle"],
  "language & text": ["language", "nlp", "writing", "translation", "steganography", "wordgame"],
  "art & sound": ["generative", "art", "music", "audio", "graphics", "animation", "wallpaper"],
  "life & self": ["productivity", "quantified-self", "calendar", "health", "habits", "relationships", "chores"],
  "ambient & toys": ["ambient", "desktop-toy", "screensaver", "whimsy", "menubar"],
  "security & privacy": ["security", "privacy", "forensics", "provenance"],
  "solo games": ["game", "roguelike", "deckbuilder", "idle", "tycoon", "sim", "puzzle", "survival", "procedural", "narrative", "browser-game"],
  "party & social games — SATURATED, avoid unless exceptional": ["party", "social-deduction", "co-op", "betting", "drawing", "sensor", "multiplayer"],
};
const DOMAIN_LINES = Object.entries(DOMAIN_TAGS).map(([d, ts]) => `  - ${d}: ${ts.join(", ")}`).join("\n");

function buildPrompt(digest, avoid) {
  const spark = shuffle(PROVOCATIONS).slice(0, 2).map((p) => `- ${p}`).join("\n");
  const focus = shuffle(HUNGRY_DOMAINS).slice(0, Math.min(HOW_MANY, 3));
  const focusBlock = focus.map((d) => `- ${d}`).join("\n");
  const avoidBlock = avoid.length
    ? `\n\nAlready in the cloud — do NOT repeat these or produce near-duplicates of them (this is a sample; the cloud has ~1400 ideas, so also avoid obvious cousins of these):\n${avoid.map((t) => `- ${t}`).join("\n")}`
    : "";
  return `You are the idea engine for "Divvy", an idea cloud. Below are live signals scraped from an arbitrary subset of several trusted public feeds (which feeds appear varies run to run).

Riff ${HOW_MANY} FRESH, buildable weekend-project or video-game ideas. Let the feeds spark you SIDEWAYS — do not summarize or clone them. Cross-pollinate across sources. Favor a novel ANGLE over a novel topic. Be genuinely creative and a little mischievous. Skip anything generic or done to death (another wrapper, another to-do app, "run a local model", a straight clone of something in the feed).

IMPORTANT — VARIETY MANDATE: the cloud is heavily over-indexed on multiplayer/party/social-deduction games (they are ~40% of it already). Do NOT default to "N players each on their phone…". Unless a party concept is genuinely exceptional, make these ${HOW_MANY} ideas SOLO tools, toys, visualizations, games, or real businesses. Spread them across DIFFERENT domains — do not return ${HOW_MANY} variations on one theme.

Aim this run at these hungry domains (pick different ones for each idea):
${focusBlock}

Creative pushes for this run:
${spark}

Return ONLY a JSON array (no prose, no code fence). Each element:
{
  "title": "2-4 word punchy name",
  "hook": "one vivid sentence pitching it",
  "tags": ["2-4 tags"],   // FIRST tag MUST be a domain tag from the vocabulary below (places it in a galaxy); prefer vocabulary tags for the rest, lowercase & hyphenated. Only coin a new specific tag if nothing fits.
  "score": integer 40-90 — calibrate HONESTLY against this rubric. Be a harsh critic; SPREAD the scores, do not cluster them. Most ideas land 55-68.
           40-54: derivative, or you doubt it would get built or used
           55-67: solid but seen-before — fine weekend fodder
           68-77: genuinely novel angle, you'd be excited to build it
           78-90: rare drop-everything standout — award to at most ONE idea this run, usually none,
  "source": "hn" | "github" | "steam" | "lobsters" | "producthunt" | "arxiv" | "wild" (which feed sparked it most; only the feeds shown below are valid, plus "wild" for a leap not tied to any single feed),
  "prd": "a DETAILED markdown PRD, 350-600 words, with these sections: ## Overview (what it is, for whom); ## Problem (the itch); ## How it works (the core mechanic/flow, concretely); ## Technical approach (be specific and technical where it helps — name the stack, real data sources/APIs/endpoints, data model, key algorithms or data structures, and the genuinely hard part); ## v1 scope (humiliatingly small) as bullets; ## Out of scope (for now); ## Risks & unknowns; ## Done means (a concrete, testable definition)"
}

Tag vocabulary by domain (first tag picks the domain/galaxy):
${DOMAIN_LINES}

Live signals:
${digest}${avoidBlock}`;
}

async function main() {
  await mkdir(PRDS, { recursive: true });
  const store = await loadIdeas(IDEAS_FILE);
  const existing = new Set(store.ideas.map((i) => i.slug));
  const seenTitles = new Set(store.ideas.map((i) => normTitle(i.title)));
  // avoid-list: 50 titles was far too small once the cloud passed 1000 ideas — the scanner
  // kept regenerating the same names ("Table Stakes" x6). Sample the newest 120 PLUS a random
  // 180 from the rest so the model sees a broad cross-section without blowing the prompt up.
  const recent = store.ideas.slice(0, 120).map((i) => i.title);
  const older = shuffle(store.ideas.slice(120).map((i) => i.title)).slice(0, 180);
  const avoid = [...recent, ...older];

  const digest = await gatherSources();
  const raw = await callClaude(buildPrompt(digest, avoid));
  const fresh = extractJSON(raw);
  const SOURCES = new Set(["hn", "github", "steam", "lobsters", "producthunt", "arxiv", "wild"]);
  const today = new Date().toISOString().slice(0, 10);
  let added = 0;

  let skipped = 0;
  for (const idea of fresh) {
    if (!idea.title) continue;
    const tkey = normTitle(idea.title);
    if (seenTitles.has(tkey)) { skipped++; continue; } // title-level dedup — the real fix
    seenTitles.add(tkey);
    let slug = slugify(idea.title);
    if (!slug) continue;
    for (let n = 2; existing.has(slug); n++) slug = `${slugify(idea.title)}-${n}`;
    existing.add(slug);

    if (idea.prd) await writeFile(join(PRDS, `${slug}.md`), idea.prd.trim() + "\n");
    store.ideas.unshift({
      slug,
      title: idea.title,
      hook: idea.hook || "",
      tags: Array.isArray(idea.tags) ? idea.tags.slice(0, 4) : [],
      score: Number.isFinite(idea.score) ? idea.score : 55,
      source: SOURCES.has(idea.source) ? idea.source : "scan",
      created: today,
    });
    added++;
  }

  store.lastScan = today;
  await writeFile(IDEAS_FILE, JSON.stringify(store, null, 2) + "\n");
  const bySource = {};
  for (const i of store.ideas.slice(0, added)) bySource[i.source] = (bySource[i.source] || 0) + 1;
  const breakdown = Object.entries(bySource).map(([s, n]) => `${s}:${n}`).join(" ");
  const skipNote = skipped ? ` (${skipped} dup-title skipped)` : "";
  console.log(`Divvy scan: added ${added} idea(s) [${breakdown}]${skipNote}; ${store.ideas.length} total.`);
}

main().catch((e) => { console.error("scan failed:", e.message); process.exit(1); });
