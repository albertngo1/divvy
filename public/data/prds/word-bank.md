## Overview
Word Bank is an idle/tycoon game grafted onto your real Anki review history, for language learners who want their SRS grind to feel like it's *building* something. It reads your actual reviews and turns them into an interest-bearing account you're trying to keep in the black against a decay clock.

## Problem
HN surfaced 'Multilingual experience linked to delayed aging.' Language study is a slow, abstract investment with no felt sense of accrual — Anki gives you a streak and a heatmap, but no *stakes*. Idle games are masters of making slow accrual feel visceral. Bridge the two.

## How it works
Every reviewed card is a deposit. Mature cards (long intervals) are principal; each review compounds interest. But the bank has a *decay rate* — model it on the aging/attrition the article implies — so principal you never revisit slowly erodes, exactly like forgetting. Your goal is to keep the account compounding faster than it decays. Idle upgrades are earned, not bought: unlock a 'second language' vault (bonus multiplier for interleaving), a 'sleep bonus' (reviews done consistently at the same time), a 'depth' tier for cards past 6-month intervals. The screen is a living ledger: balance ticking, decay nibbling, and a projected 'reserve age' — a playful biological-age-style number that goes down as your reserve grows.

## Technical approach
Local-first desktop app (Tauri or Electron) that reads Anki's `collection.anki2` SQLite file directly — the `revlog` table has every review with timestamp, ease, and interval; the `cards` table has current intervals. No cloud, no API keys. A nightly (or on-launch) pass computes deposits/interest/decay deterministically from revlog so the state is reproducible and can't be cheated by fiddling. Data model: an append-only event log derived from revlog, folded into a balance snapshot. Core algorithm is a compounding-with-decay simulation: `balance(t) = Σ deposits·(1+r)^age − decay·idle_time`, tuned so a realistic 30-cards/day habit trends up and a lapsed month visibly bleeds. Hard part: mapping SRS intervals to satisfying-but-honest idle curves without lying about the science.

## v1 scope
- Read revlog, show live balance + decay
- One 'reserve age' headline number
- Three earned upgrades
- Offline, single machine

## Out of scope
- Non-Anki sources (Duolingo, Memrise)
- Any real health/longevity claims beyond flavor text
- Multiplayer / leaderboards

## Risks & unknowns
- Anki schema changes across versions; need version guards
- Overclaiming the aging link is irresponsible — keep it explicitly playful
- Idle games thrive on notifications; a purely-local app has no push hook

## Done means
Point it at a real `collection.anki2`, and it shows a balance that provably rises after a review session and visibly decays after simulating a two-week gap, with numbers that reconcile to the revlog.
