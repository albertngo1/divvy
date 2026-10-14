#!/usr/bin/env node
// Divvy problem-hunter: read news aggregators (Google News top + problem-keyword searches,
// Techmeme, BBC, NPR), have `claude -p` pick out CONCRETE real-world problems in the headlines,
// then pitch a buildable fix for each. Merges into ideas.json + prds/<slug>.md with
// source "news" and the same novelty gate as scan.mjs.
//
// Knobs: DIVVY_PROBLEMS_N (ideas per run, default 4), DIVVY_DRY=1 (call the agent, write
// nothing), DIVVY_AVOID_K (retrieved neighbours in the prompt, default 40).

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { slugify, normTitle, shuffle, extractJSON, callClaude, loadIdeas, openNovelty, avoidBlock } from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "..", "public", "data");
const PRDS = join(DATA, "prds");
const IDEAS_FILE = join(DATA, "ideas.json");

const HOW_MANY = Number(process.env.DIVVY_PROBLEMS_N || 4);
const DRY = process.env.DIVVY_DRY === "1";
const AVOID_K = Number(process.env.DIVVY_AVOID_K || 40);
const UA = { "User-Agent": "divvy-scanner/1.0" };

// Pull entry titles out of an Atom/RSS feed without an XML dependency.
function feedTitles(xml, max) {
  const titles = [];
  for (const c of xml.split(/<(?:entry|item)[ >]/i).slice(1)) {
    const m = c.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!m) continue;
    const t = m[1].replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'")
      .replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
    if (t) titles.push(t);
  }
  return titles.slice(0, max);
}

async function feed(label, url, max = 20) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return { label, lines: feedTitles(await res.text(), max).map((t) => `- ${t}`) };
}

const gnews = (q) => `https://news.google.com/rss/search?q=${encodeURIComponent(q + " when:3d")}&hl=en-US&gl=US&ceid=US:en`;

// Keyword searches aimed at headlines that describe something BROKEN, not just something new.
const PROBLEM_QUERIES = [
  "shortage OR backlog OR waitlist",
  "outage OR breach OR recall",
  "small business struggling",
  "residents frustrated OR complaints",
  "farmers OR growers losing",
  "hospital OR clinic overwhelmed",
  "renters OR tenants OR housing costs",
  "scam OR fraud warning",
  "teachers OR schools short",
  "supply chain OR shipping delays",
  "city council fix OR broken",
  "volunteers needed OR nonprofit stretched",
];

function sources() {
  const searches = shuffle(PROBLEM_QUERIES).slice(0, 4)
    .map((q) => () => feed(`Google News search: "${q}" (last 3 days)`, gnews(q), 12));
  return [
    () => feed("Google News top stories (US)", "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en", 25),
    () => feed("Techmeme", "https://www.techmeme.com/feed.xml", 15),
    () => feed("BBC News", "https://feeds.bbci.co.uk/news/rss.xml", 20),
    () => feed("NPR News", "https://feeds.npr.org/1001/rss.xml", 15),
    ...searches,
  ];
}

async function gatherSources() {
  const settled = await Promise.allSettled(sources().map((fn) => fn()));
  const blocks = settled.filter((s) => s.status === "fulfilled" && s.value.lines.length)
    .map((s) => `### ${s.value.label}\n${s.value.lines.join("\n")}`);
  if (!blocks.length) throw new Error("all news sources failed");
  return blocks.join("\n\n");
}

function buildPrompt(digest, avoid) {
  return `You are the problem-hunter for "Divvy", an idea cloud. Below are today's headlines from news aggregators.

Your job: find ${HOW_MANY} CONCRETE, RECURRING problems hiding in these headlines that a small team (1-3 builders, a few weekends to a few months) could plausibly solve or meaningfully dent with software, data, hardware, or a service — then pitch the fix.

Rules:
- Start from the PROBLEM, not the technology. Name who hurts, how often, and what it costs them today.
- Look past the single news event to the pattern underneath it (an airport outage → contractors cutting unmarked fiber → a utility-locate gap).
- Prefer unglamorous, specific sufferers (county clerks, school bus dispatchers, small landlords, ER triage nurses, food banks) over "everyone".
- Real constraints count: who pays, who adopts, what regulation or incumbent is in the way. Say so honestly.
- No "an AI app that summarizes the news". No pure awareness campaigns. No ideas whose only lever is "convince the government".
- Spread across DIFFERENT problem areas — not ${HOW_MANY} variants of one story.

Return ONLY a JSON array (no prose, no code fence). Each element:
{
  "title": "2-4 word punchy name",
  "hook": "one vivid sentence: the problem, then the fix",
  "problem": "one sentence naming the specific headline(s) that revealed it",
  "tags": ["2-4 lowercase hyphenated tags"],   // FIRST tag is the domain, e.g. business, health, civic, logistics, finance, security, data-viz, devtool, education, housing, climate, food
  "score": integer 40-90 — be a harsh critic and SPREAD scores. Most land 55-68. 68-77: real pain + plausible wedge you'd be excited to build. 78-90: at most one per run, usually none,
  "prd": "a DETAILED markdown PRD, 350-600 words, with these sections: ## Overview (what it is, for whom); ## Problem (who hurts, how often, what it costs today — cite the headline); ## How it works (concretely); ## Technical approach (stack, real data sources/APIs, data model, the genuinely hard part); ## v1 scope (humiliatingly small) as bullets; ## Out of scope (for now); ## Risks & unknowns (incl. who pays and adoption); ## Done means (a concrete, testable definition)"
}

Headlines:
${digest}${avoid}`;
}

async function main() {
  await mkdir(PRDS, { recursive: true });
  const store = await loadIdeas(IDEAS_FILE);
  const existing = new Set(store.ideas.map((i) => i.slug));
  const seenTitles = new Set(store.ideas.map((i) => normTitle(i.title)));
  const byslug = new Map(store.ideas.map((i) => [i.slug, i]));

  const digest = await gatherSources();
  const novelty = await openNovelty(DATA);
  const neighbours = await novelty.near(digest, AVOID_K);
  const fallback = shuffle(store.ideas.map((i) => i.title)).slice(0, 300);
  const avoid = avoidBlock(neighbours, byslug, fallback);
  console.log(`Divvy problems: novelty ${novelty.enabled ? `on (${novelty.size} vectors)` : "OFF"}${DRY ? " [dry]" : ""}`);

  const fresh = extractJSON(await callClaude(buildPrompt(digest, avoid)));
  const today = new Date().toISOString().slice(0, 10);
  let added = 0;

  for (const idea of fresh) {
    if (!idea.title || seenTitles.has(normTitle(idea.title))) continue;
    const verdict = await novelty.check(idea, idea.prd || "");
    if (!verdict.ok) { console.log(`  [dup] "${idea.title}" ~ ${verdict.nearestSlug}`); continue; }

    seenTitles.add(normTitle(idea.title));
    let slug = slugify(idea.title);
    if (!slug) continue;
    for (let n = 2; existing.has(slug); n++) slug = `${slugify(idea.title)}-${n}`;
    existing.add(slug);

    const rec = {
      slug,
      title: idea.title,
      hook: idea.hook || "",
      tags: Array.isArray(idea.tags) ? idea.tags.slice(0, 4) : [],
      score: Number.isFinite(idea.score) ? idea.score : 55,
      source: "news",
      created: today,
    };
    novelty.admit(slug, verdict.vec);
    if (DRY) { console.log(`  [dry] ${rec.score}  ${slug} — ${rec.hook}`); added++; continue; }
    const prd = (idea.problem ? `> **Spotted in the news:** ${idea.problem}\n\n` : "") + (idea.prd || "").trim();
    await writeFile(join(PRDS, `${slug}.md`), prd + "\n");
    store.ideas.unshift(rec);
    added++;
  }

  if (DRY) return console.log(`Divvy problems [dry]: would add ${added}.`);
  store.lastScan = today;
  await writeFile(IDEAS_FILE, JSON.stringify(store, null, 2) + "\n");
  await novelty.persist();
  console.log(`Divvy problems: added ${added} idea(s); ${store.ideas.length} total.`);
}

main().catch((e) => { console.error("problems failed:", e.message); process.exit(1); });
