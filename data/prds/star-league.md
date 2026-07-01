## Overview
Star League turns the GitHub Trending page — something devs passively doom-scroll — into a weekly fantasy league. You draft a fixed roster of open-source repos, and they earn you points all week based on real momentum. For developers, tech-Twitter watchers, and anyone who has opinions about which framework is about to blow up.

## Problem
Everyone scrolls Trending and quietly thinks 'this one's gonna pop' or 'this is hype that'll die by Friday' — but there's nowhere to *cash in* on being right. Star-count is a spectator metric. Meanwhile fantasy sports proves people will obsess over any dataset if you let them draft and compete over it. Open-source momentum is a perfect, public, free-to-track stat line.

## How it works
Monday 'market open': each player drafts N repos (snake draft with friends, or solo vs. a bot). During the week, repos accrue points: +1 per 100 new stars, bonuses for a tagged release, a Show-HN-style spike, or crossing a round-number milestone; penalties for going stale (no commits) or getting archived. A live standings page updates daily. Friday 'close' locks scores; winner takes the week. Seasons run in 4-week arcs with a waiver wire for swapping cold repos.

## Technical approach
Stack: SvelteKit + a tiny Postgres (or SQLite) backing store, one daily cron worker. Data from the GitHub REST/GraphQL API: `stargazers` count deltas, `releases`, `pushed_at`, `repository` events; trending candidates seeded from the same star>800/recently-pushed search the Divvy scanner already uses. Data model: `leagues`, `rosters(user_id, repo_id, drafted_at)`, `snapshots(repo_id, day, stars, commits, releases)`, `scores`. The scoring engine diffs consecutive snapshots. Hard parts: GitHub rate limits at scale (batch GraphQL, cache aggressively, snapshot once/day), and anti-degeneracy scoring so one viral repo doesn't trivially decide every league — hence velocity-and-milestone weighting over raw totals.

## v1 scope
- Solo mode: draft 5 repos from a curated trending list
- Daily cron snapshots stars/releases/commits
- Simple additive scoring + a standings page
- Shareable league link for a friend to join

## Out of scope
- Real-money anything
- Mobile app, push notifications
- Deep analytics, historical seasons archive

## Risks & unknowns
- GitHub API rate limits / auth for larger leagues
- Scoring balance — avoiding runaway-winner repos
- Retention past the novelty week

## Done means
Two people can join a league via link, draft repos, and after a real week the standings correctly reflect each roster's summed star/release deltas pulled from the live GitHub API.
