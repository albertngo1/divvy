## Overview
Backwater is a weekly web game where players race to surface the most obscure *watchable* video on the internet — the forgotten uploads, the 11-view hobbyist clips, the stagnant backwaters. It's for the crowd nostalgic for 'the small web' and anyone who misses stumbling into strange corners instead of algorithmic sludge. Sparked by the HN 'Has_not_been_viewed_much' post.

## Problem
Recommendation feeds relentlessly funnel everyone toward the same popular content; the long tail is effectively invisible. There's real joy in discovering something almost nobody has seen, but no structure or reason to go looking — and no way to *share the thrill* of the find competitively.

## How it works
Each round has a theme ('a tutorial nobody needed', 'a local event', 'an instrument you can't name'). Players submit a video URL. Backwater fetches its current view count; your **raw score = 1000 / log10(views + 10)**, so a 7-view clip crushes a 40k-view one. But rarity alone isn't enough: other players vote 'watchable / not' — a submission with too many 'not watchable' votes is disqualified, killing the incentive to post literal noise. Weekly leaderboard, and a 'Deep Cut of the Week' hall of fame. Sharing a Wordle-style card ('I found a 4-view clip, beat that') is the growth loop.

## Technical approach
Stack: SvelteKit + a small Postgres. Ingest via the YouTube Data API v3 (`videos.list` for `statistics.viewCount`, `snippet`), with Vimeo/Dailymotion adapters later. Store submission, fetched view count, timestamp (views drift — freeze the count at submission and re-verify at round close to catch a clip going viral mid-round). Voting is a simple watchable/not tally with a rate-limited, session-bound ballot. Anti-cheat is **the genuinely hard part**: people will upload their own private videos to farm low view counts, so require a minimum channel/account age and a minimum upload date gap, and flag submissions whose uploader correlates with the submitter's session/IP. Precompute the leaderboard; scores are cheap.

## v1 scope
- One weekly theme, YouTube-only submissions
- Auto-fetch view count, compute inverse-log score
- Community watchable/not voting with disqualification threshold
- Public leaderboard + shareable result card

## Out of scope
- Multi-platform ingest, accounts/profiles, comments
- Live/real-time rounds
- Robust sybil-proof anti-cheat (v1 uses cheap heuristics)

## Risks & unknowns
- YouTube API quota limits under load; may need caching + backoff
- Self-upload farming is the core exploit; heuristics may not hold
- 'Watchable' is subjective; voting could get brigaded

## Done means
During a live round, ten strangers submit videos, the 6-view genuinely-charming clip outranks the 30k-view one on the leaderboard, an obvious noise upload gets voted down and disqualified, and a player can share a card boasting their lowest-view find.
