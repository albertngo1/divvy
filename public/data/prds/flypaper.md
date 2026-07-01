## Overview
Flypaper is a self-hosted honeypot for badly-behaved AI crawlers. It serves them an endless, internally-linked fictional wiki that mutates over time — and it surfaces the accumulating "lore" as a readable, weirdly compelling artifact for you. Part defensive tarpit, part generative worldbuilding toy. For homelabbers annoyed at scrapers and amused by emergent nonsense.

## Problem
Cloudflare is monetizing crawl access; the rest of us just get hammered by bots ignoring robots.txt. Existing tarpits (Nepenthes-style) waste crawler time but produce nothing *you'd* want to look at. The waste is one-directional. What if the trap were also a generator?

## How it works
Flypaper sits behind a `Disallow`-flagged path. Any client that fetches it anyway (i.e. ignored robots.txt) enters the maze: infinitely deep, cross-linked pages of a fictional encyclopedia. Content is procedurally generated but *persistent and drifting* — each page seeds from its URL, and a slow background process edits existing pages so the canon contradicts itself over generations (a city gains a second sun, a historical figure changes species). Real browsers get a robots-respecting normal page; only rule-breakers see the maze. A companion "Lore" view lets you browse the current state of the fiction the bots are eating.

## Technical approach
A small Go or Node server. Page generation is deterministic from URL hash + a global "epoch" counter, so pages are cheap and stable within an epoch. A markov/template or a tiny local model produces prose; entities and links are stored in SQLite so the drift process can mutate them (`entity -> {name, attrs, epoch_last_edited}`). Rate-limit and slow-drip responses (chunked, delayed) to maximize crawler cost. The hard part is distinguishing crawlers from humans without nuking real users — lean on robots.txt-violation as the trigger plus optional JS challenges.

## v1 scope
- One trap path with infinite procedurally-linked pages
- Deterministic per-URL content + slow response drip
- A read-only "Lore" browser of current entities
- Access log of who took the bait

## Out of scope
- Real LLM-quality prose (templates are fine v1)
- Blocking/banning — the point is to waste, not block
- Multi-site / CDN integration

## Risks & unknowns
Overzealous triggering could trap legit tools or hurt your own SEO if misconfigured. Serving lots of junk has bandwidth cost. The "lore is fun to read" promise is unproven — it may just be noise.

## Done means
A crawler that ignores robots.txt gets caught in an endless deterministic maze, its hits are logged, and the Lore view shows at least one entity whose description has visibly drifted between two epochs.
