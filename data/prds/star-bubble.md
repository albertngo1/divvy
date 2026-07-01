## Overview
Star Bubble is a single-player browser prediction game. Each round shows the first few weeks of a real (anonymized) GitHub repo's star-growth curve as a sparkline, and you bet two things: how high it eventually peaks, and whether its momentum dies within 90 days. It's for the Hacker-News-cynic crowd who love smelling a bubble — the ones who read *Memoirs of Extraordinary Popular Delusions* and nodded.

## Problem
In real time we genuinely cannot tell a durable project from a tulip. Trending lists reward whatever flared this week; six months later half are ghost towns. "Madness of crowds" is an evergreen idea but stays abstract. Star Bubble turns that pattern-recognition into a scored, replayable reflex.

## How it works
Each round: a star sparkline (first N days) plus a few noisy clues — README length, has-tests?, license, top-comment sentiment. You place a peak-magnitude bet (a slider, log scale) and a binary pop/no-pop bet. Reveal animates the *forward* curve; you're scored by closeness (log error on peak, Brier score on pop). The mischief: the game also shows the "crowd's" guess and rewards you partly for truth and partly for beating the crowd — and sometimes those diverge, which is the whole Mackay lesson.

## Technical approach
Static SPA (Svelte or vanilla). Data: GitHub REST `GET /repos/{owner}/{repo}` plus stargazer timestamps (`Accept: application/vnd.github.star+json`) or a cached star-history export. Precompute a corpus of ~500 repos bucketed by trajectory: flared-and-faded vs. sustained. Store as JSON `{repo_id, curve[], features, forward_outcome}`. Scoring lives client-side. The genuinely hard part is building an *honest* labeled dataset — defining "bubble" without hindsight bias and correcting for survivorship — plus anonymizing hard enough that players can't just google the repo.

## v1 scope
- 20 handpicked repos, baked into JSON (no live API at play time)
- One round per repo: peak slider + pop yes/no
- Reveal animation of the true curve
- localStorage high score and streak

## Out of scope
- Live/real-time repos, HN sentiment ingestion
- Multiplayer, accounts, the "beat the crowd" meta layer (v2)

## Risks & unknowns
Labeling is subjective; a small corpus becomes memorizable after a few sessions; star-data ToS/rate limits (mitigate by caching public data only). The crowd-vs-truth mechanic could confuse before it delights.

## Done means
I load the page, get 20 rounds each with a real star curve, place both bets per round, see a per-round and session score, and my best score survives a refresh via localStorage.
