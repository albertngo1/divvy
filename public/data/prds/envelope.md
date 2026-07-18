## Overview
Envelope is a single-player roguelike that plays your own money back at you. It imports your real transaction history, buckets it into classic 'envelope budgeting' categories (rent, groceries, fun, transit…), and turns a year into a 12-turn run. Each envelope is a resource pool; the events that drain them are drawn from *your actual* historical spending. Riffs on ghostfolio (open-source wealth management) by asking: what if your finances were a Slay-the-Spire run instead of a dashboard?

## Problem
Budgeting apps are guilt machines: passive charts you consume and ignore. They never make the tension of a lean month *fun* or teach the intuition of buffers and reserves. And most 'finance games' use fake numbers, so nothing transfers. Grafting a roguelike's permadeath and drafting onto your genuine spend makes the stakes legible and the lessons real.

## How it works
Import a CSV of transactions. The engine builds a per-category monthly distribution (mean/variance) from your history. A run = 12 monthly turns. Each turn: income refills envelopes, then an 'event deck' deals 4–8 expense cards sampled from your real category distributions ('Groceries: $214', 'Surprise: Car Repair $600' from an actual past outlier). You allocate income across envelopes *before* seeing the full deck, then assign each expense to an envelope; overflow forces a raid on another envelope (a penalty combo). Between months you draft one 'perk' card (auto-transfer, sinking fund, side-gig +income) — the roguelike meta-progression. Any envelope hitting zero with an unpaid bill = a strike; 3 strikes ends the run. Score = net worth + months survived. Seeded daily challenge shares one deck across all players.

## Technical approach
Stack: fully client-side PWA (TypeScript + a tiny state machine), data never leaves the browser. Import: parse Plaid/Mint/bank CSV (papaparse); map merchants→categories with a small keyword ruleset + user overrides. Data model: `categories[]` with fitted lognormal params; `deck` = seeded sampler (mulberry32 PRNG so daily seeds are reproducible). Core loop is a deterministic reducer over turn events → easy to test and to share seeds. Perks are modifier functions composed onto the income/allocation step. The genuinely hard part: making sampled-from-your-history events feel *fair and roguelike* rather than either trivially easy or a doom spiral — needs difficulty tuning that scales event variance to your real buffer, plus honest handling of irregular income.

## v1 scope
- Import one CSV, auto-bucket into 5 fixed categories
- 12 turns, income refill + sampled expense cards, manual allocation
- Strike-out on 3 unpaid bills; show final score
- One perk draft per month from a hardcoded set of 6

## Out of scope
- Plaid live sync, merchant ML categorization
- Daily shared seed / leaderboard
- Irregular-income modeling, debt/interest mechanics

## Risks & unknowns
- Real spending may not map cleanly to a fun difficulty curve
- People are squeamish uploading transaction CSVs (mitigate: 100% local)
- Category auto-bucketing accuracy

## Done means
Importing a real transaction CSV produces a playable 12-turn run where expense cards visibly reflect your own historical amounts, an envelope can be drained to a strike, and 3 strikes ends the run with a score — same seed replays identically.
