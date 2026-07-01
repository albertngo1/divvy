## Overview
Churn League is fantasy sports played on Steam's most-played charts. Instead of passively glancing at "what's popular this week," players draft a roster of games and earn points as those games' concurrent-player counts rise and fall. It's for gamers, streamers, and Discord friend-groups who already argue about which game is dying or having a moment.

## Problem
The most-played list is one of the most-watched, least-actionable feeds in gaming. Millions check SteamCharts/SteamDB out of idle curiosity, but nobody has skin in the game. The numbers churn constantly — a sale, a patch, a streamer, a controversy — and all that volatility is spectator-only. There's no way to *be right* about it.

## How it works
Each week you draft 5 games under a salary cap (a game's "salary" scales with its current popularity, so stacking the top of the charts is expensive). Your weekly score is the sum of week-over-week percent changes in each game's peak concurrent players. A sleeper indie that doubles beats a giant that ticks up 2%. Rewards go to whoever best predicts where attention *moves*, not where it already is. Waivers let you swap one game mid-week; a global leaderboard ranks everyone.

## Technical approach
Stack: static front-end (Vite + vanilla/React) plus a tiny serverless cron. Data source: Steam Web API `ISteamUserStats/GetNumberOfCurrentPlayers?appid=` polled every 30 minutes, plus SteamSpy `top100in2weeks` to define the draftable pool. Snapshots are stored in SQLite (or Turso): `snapshots(appid, ts, ccu)`, `games(appid, name, salary)`, `rosters(user, week, appids)`, `scores(user, week, points)`. Peak CCU per week = max over that week's snapshots. Salary = f(trailing 7-day mean CCU). The genuinely hard part is building a *trustworthy* CCU history without leaning on SteamDB scraping (ToS-fragile) — so you poll and persist your own time series from day one, and handle games entering/leaving the top-100 gracefully (frozen salary + prorated scoring).

## v1 scope
- One global weekly league, no accounts beyond a handle
- Draft 5 games from the current top 100
- Score = summed week-over-week % change in peak CCU
- One leaderboard, one "reveal" moment at week's end

## Out of scope
- Private/friends leagues, trades, playoffs
- Any real-money betting
- Mobile app, push notifications

## Risks & unknowns
- Steam API rate limits and occasional zero/garbage CCU reads
- CCU is seasonal and event-driven — one big sale can dominate scoring
- A drafted game dropping out of the tracked pool mid-week needs a fair fallback

## Done means
Two people each draft a roster, a real week elapses, scores compute automatically from Steam's actual CCU deltas, and the leaderboard ranks the players correctly with a shareable week recap.
