## Overview
Hockey Stick is a season-long fantasy league where friends draft GitHub repositories instead of athletes and compete on *star velocity*. It turns the passive scroll of GitHub Trending into a head-to-head bloodsport for developers who already argue about which repo is overhyped.

## Problem
Everyone with a dev bent passively watches trending repos and privately forms opinions — "lightpanda will blow up," "that's a flash in the pan." Those opinions evaporate with zero stakes or accountability. There's no fun, low-effort way to *bet your taste* against friends and be proven right (or gloriously wrong) six weeks later.

## How it works
1. A commissioner creates a league; 4–12 managers do a snake draft from a pool (current + recent GitHub Trending across chosen languages).
2. Each manager fields a weekly lineup of N repos from their roster.
3. Scoring = week-over-week star delta, z-scored against the repo's own 8-week baseline so a repo already at 400k stars doesn't auto-win — *acceleration* scores, not size (hence the name).
4. Bonus points for merged-PR spikes, release cuts, and HN/Lobsters front-page appearances (detected via those feeds' APIs).
5. Head-to-head matchups each week; waiver wire lets you drop a stagnant repo and claim a newly-trending one, with waiver priority.

## Technical approach
- Backend: Node/TS + Postgres (Supabase — it's right there in the feed). Nightly cron pulls `GET /search/repositories` sorted by recent stars + scrapes the Trending HTML (no official API) for the draft pool.
- Star history via daily snapshots into a `repo_stars(repo_id, date, stars, forks, open_prs)` table; velocity = linear-regression slope over trailing 7 days.
- Bonus events: poll HN Algolia API + Lobsters JSON for URLs matching a rostered repo.
- Scoring engine is a scheduled function; leagues/rosters/matchups are ordinary relational tables. Frontend: a lean React scoreboard.
- Hard part: a *fair* scoring curve. Raw star deltas reward giants and viral one-offs; the z-score-vs-own-baseline normalization needs tuning so the league stays competitive and un-gameable.

## v1 scope
- Single hardcoded league, manual JSON draft (no live draft room).
- Nightly star snapshot + weekly z-scored velocity scoreboard.
- One bonus signal (HN front page).
- Static leaderboard page.

## Out of scope
- Live drafting UI, trades, playoffs.
- Real-money anything.
- Non-GitHub sources (npm downloads, PyPI).

## Risks & unknowns
- GitHub Trending has no API and its HTML/anti-scrape posture changes; may need a fallback pool.
- Star counts are gameable (bot stars, star-for-star rings) — could poison scoring.
- Retention: a season is long; needs weekly notifications and trash-talk to stay alive.

## Done means
Two managers with rostered repos see a correctly z-scored weekly scoreboard that updates after the nightly snapshot, one HN-front-page bonus fires and is attributed to the right team, and a waiver claim swaps a repo into a roster.
