## Overview
Frontrun turns the act of scrolling Hacker News into a trading floor. Players stake play-money 'karma-coins' on whether a fresh /new submission will hit the front page (top 30) within 24 hours. It's for the HN addict who already has strong opinions about what's underrated — now those opinions are scored, ranked, and settled.

## Problem
Everyone on HN silently predicts which posts will blow up, but that instinct evaporates unmeasured. Reading HN is pure passive consumption with no skin in the game. The best signal — a human's gut read on 'this will trend' minutes after posting — is thrown away.

## How it works
The market lists posts from HN's `newstories` feed, each with a live 'front-page probability' price (0–100¢). You buy YES/NO shares; the price moves as other players trade (or, in solo mode, against a simple bot maker). Markets settle automatically 24h after submission: did the post ever appear in `topstories[:30]`? YES holders get paid 100¢/share, NO holders keep the rest. A weekly leaderboard ranks profit and calibration (Brier score). Twists: an 'early bird' bonus for correct trades placed while the post still has <5 points, and a 'contrarian' badge for profiting against consensus. The mischief: it rewards spotting quality *before* the crowd, i.e. beating the herd you're part of.

## Technical approach
Stack: SvelteKit + SQLite (better-sqlite3), a tiny LMSR (logarithmic market scoring rule) automated market maker so prices exist even with few traders. Data source: the official HN Firebase API — `https://hacker-news.firebaseio.com/v0/newstories.json` for incoming, `topstories.json` polled every ~2 min to detect front-page hits and record `firstSeenRank`. Item metadata via `/item/{id}.json`. Data model: Market{itemId, submittedAt, resolvesAt, resolved, hitFrontpage}, Position{userId, itemId, side, shares, cost}. LMSR keeps a per-market liquidity param b; settlement is a cron that reconciles observed front-page appearances. Hard part: fair, cheat-resistant resolution — polling can miss a brief front-page flash, so track a rolling max-rank per item and define 'hit' as ever-observed rank ≤ 30, plus dedupe reposts.

## v1 scope
- Poll newstories + topstories, store items and first-seen rank
- One market per new post, LMSR pricing, single hardcoded user with play balance
- Auto-settle at 24h and update balance

## Out of scope
- Multiplayer accounts, real-time price feed, leaderboards
- Show-HN-only filtering, comment-velocity signals
- Any real money (never)

## Risks & unknowns
- HN rate limits / polling gaps missing brief front-page appearances
- Thin liquidity making prices meaningless without a maker bot
- Reposts and second-chance-pool posts complicating 'the same' story

## Done means
A fresh /new post appears as a tradeable market, you buy YES at the shown price, and 24h later it auto-settles correctly (paid out if it truly hit top-30, verified against the topstories log) with your balance updated.
