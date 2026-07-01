#!/usr/bin/env node
// Divvy scanner: scrape several public feeds (Hacker News, trending GitHub repos,
// popular Steam games), riff new project/game ideas via `claude -p`, then merge into
// data/ideas.json and write data/prds/<slug>.md for each new idea.

import { spawn } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const DATA = join(ROOT, "data");
const PRDS = join(DATA, "prds");
const IDEAS_FILE = join(DATA, "ideas.json");

const HOW_MANY = Number(process.env.DIVVY_N || 3);

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function tryFetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
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

// Rotating provocations so runs don't converge on the same flavor.
const PROVOCATIONS = [
  "Cross-pollinate: take a mechanic from a Steam game and apply it somewhere absurd (finance, chores, homelab ops).",
  "Find the weird overlap between two unrelated items in the feeds and build the bridge.",
  "Turn something people passively consume into something they compete over.",
  "Take a serious tool and make a toy of it, or take a toy and make it dangerously useful.",
  "Invert a popular repo's purpose — what's the mischievous or artful opposite?",
  "What ambient/background artifact could quietly generate itself over a year?",
  "Steal a game genre (roguelike, idle, deckbuilder, tycoon) and graft it onto real personal data.",
];

async function gatherSources() {
  const settled = await Promise.allSettled([srcHN(), srcGitHub(), srcSteam()]);
  const blocks = [];
  for (const s of settled) {
    if (s.status === "fulfilled" && s.value.lines.length) {
      blocks.push(`### ${s.value.label}\n${s.value.lines.join("\n")}`);
    }
  }
  if (!blocks.length) throw new Error("all sources failed");
  return blocks.join("\n\n");
}

function buildPrompt(digest, avoid) {
  const spark = shuffle(PROVOCATIONS).slice(0, 2).map((p) => `- ${p}`).join("\n");
  const avoidBlock = avoid.length
    ? `\n\nAlready in the cloud — do NOT repeat these or produce near-duplicates of them:\n${avoid.map((t) => `- ${t}`).join("\n")}`
    : "";
  return `You are the idea engine for "Divvy", an idea cloud. Below are live signals scraped from several public feeds — Hacker News, trending GitHub repos, and the most-played Steam games.

Riff ${HOW_MANY} FRESH, buildable weekend-project or video-game ideas. Let the feeds spark you SIDEWAYS — do not summarize or clone them. Cross-pollinate across sources. Favor a novel ANGLE over a novel topic. Be genuinely creative and a little mischievous. Skip anything generic or done to death (another wrapper, another to-do app, "run a local model", a straight clone of something in the feed).

Creative pushes for this run:
${spark}

Return ONLY a JSON array (no prose, no code fence). Each element:
{
  "title": "2-4 word punchy name",
  "hook": "one vivid sentence pitching it",
  "tags": ["3", "short", "tags"],
  "score": 40-85 integer gut-feel of how good/novel it is,
  "source": "hn" | "github" | "steam" | "wild" (which feed sparked it most),
  "prd": "a DETAILED markdown PRD, 350-600 words, with these sections: ## Overview (what it is, for whom); ## Problem (the itch); ## How it works (the core mechanic/flow, concretely); ## Technical approach (be specific and technical where it helps — name the stack, real data sources/APIs/endpoints, data model, key algorithms or data structures, and the genuinely hard part); ## v1 scope (humiliatingly small) as bullets; ## Out of scope (for now); ## Risks & unknowns; ## Done means (a concrete, testable definition)"
}

Live signals:
${digest}${avoidBlock}`;
}

function extractJSON(stdout) {
  const start = stdout.indexOf("[");
  const end = stdout.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error("no JSON array in claude output");
  return JSON.parse(stdout.slice(start, end + 1));
}

function callClaude(prompt) {
  // One-shot print mode. stdin is ignored so claude doesn't block waiting on it.
  return new Promise((resolve, reject) => {
    const child = spawn("claude", ["-p", prompt, "--dangerously-skip-permissions"], {
      stdio: ["ignore", "pipe", "inherit"],
      timeout: 1000 * 300,
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

async function loadIdeas() {
  if (!existsSync(IDEAS_FILE)) return { lastScan: "", ideas: [] };
  return JSON.parse(await readFile(IDEAS_FILE, "utf8"));
}

async function main() {
  await mkdir(PRDS, { recursive: true });
  const store = await loadIdeas();
  const existing = new Set(store.ideas.map((i) => i.slug));
  const avoid = store.ideas.slice(0, 50).map((i) => i.title); // cap so the prompt stays bounded as the cloud grows

  const digest = await gatherSources();
  const raw = await callClaude(buildPrompt(digest, avoid));
  const fresh = extractJSON(raw);
  const SOURCES = new Set(["hn", "github", "steam", "wild"]);
  const today = new Date().toISOString().slice(0, 10);
  let added = 0;

  for (const idea of fresh) {
    if (!idea.title) continue;
    let slug = slugify(idea.title);
    if (!slug) continue;
    while (existing.has(slug)) slug = `${slug}-2`;
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
  console.log(`Divvy scan: added ${added} idea(s); ${store.ideas.length} total.`);
}

main().catch((e) => { console.error("scan failed:", e.message); process.exit(1); });
