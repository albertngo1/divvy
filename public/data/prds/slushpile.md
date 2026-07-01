## Overview
Slushpile turns the most-ignored page on the internet — Hacker News `/newest` — into a game. Instead of passively reading the front page after stories have already won, you scout the raw slush of brand-new submissions and stake play-money on which ones will hit the front page within N hours. It's fantasy-sports for tech news taste, for HN addicts and trend-spotters.

## Problem
Everyone consumes the HN front page; almost no one reads `/newest`, where the actual signal (and the fun) lives. There's no way to prove you 'called it early,' and no reward for having a nose for what will blow up. Slushpile makes early taste legible and competitive.

## How it works
The app surfaces a live feed of fresh submissions (age < 30 min, still in single-digit points). You spend a daily point budget to back stories you think will front-page; odds shift with the crowd (a simple parimutuel pool). If a story you backed reaches the front page inside the window, the pool pays out proportionally; if it dies in new, you lose your stake. Weekly leaderboards, a per-domain accuracy stat ("you're 71% on GitHub links, 12% on Show HN"), and a 'contrarian' badge for backing longshots that hit.

## Technical approach
Pure client-friendly stack: a scheduled worker polls the official HN Firebase API (`/v0/newstories`, `/v0/item/{id}`, and `/v0/topstories` to detect front-page arrival — front page ≈ top 30 of topstories). A Cloudflare Worker + D1 (or Postgres) stores open positions and a per-story pool. Settlement is a cron that, every few minutes, diffs each open story's current rank against the top-30 set and marks wins/losses. Parimutuel math: payout = stake × (total_pool / winning_pool). The genuinely hard part is anti-degeneracy — preventing a user from just backing *everything* (fixed daily budget), and defining 'front page' robustly given HN's opaque ranking/penalty system (use topstories membership, not raw points, and log edge cases). No real money — points only — sidesteps gambling-law issues.

## v1 scope
- Live `/newest` feed with age + points
- Back a story with fixed-size stakes, one 3-hour window
- Cron settlement against top-30 topstories
- Single global leaderboard, points reset weekly

## Out of scope
- Real money, dynamic odds display, per-domain stats, accounts beyond a nickname, other sites (Reddit/Lobsters)

## Risks & unknowns
HN ranking is non-transparent (shadow penalties) so 'reached front page' can be fuzzy; low-liquidity pools early on; keeping people engaged during the 3-hour settlement wait.

## Done means
A user backs a fresh `/newest` story, the cron detects it entering top-30 within the window, and their points balance and the leaderboard update correctly on settlement.
