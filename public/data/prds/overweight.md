## Overview
Overweight is a tiny daily browser game: two well-known sites appear, you pick the fatter one (more total transferred bytes / more JavaScript), and it reveals the actual numbers with a satisfying weigh-in animation. For web devs, perf nerds, and anyone who nodded at 'page weight matters.'

## Problem
We all *complain* about web bloat but have terrible intuition for the actual figures — is the average news homepage 2MB or 12MB? How much is JS? Passive griping becomes an active, competitive guessing game with a streak and a share card, and you accidentally build a real sense of scale.

## How it works
Each day serves a fixed set of ~5 head-to-head rounds seeded by date (everyone gets the same matchups, Wordle-style). You see two site cards; tap the heavier. Correct extends your streak; the reveal shows total bytes, JS bytes, and request count with a bar that fills to a comedic weight. A weekly ladder ranks by streak length and average confidence. Optional 'JS only' and 'requests' modes flip which metric decides. End-of-run share string: emoji scale ⚖️ + streak.

## Technical approach
Stack: static SvelteKit site + a nightly GitHub Action; no live server needed at play time. Data source: the HTTP Archive public dataset on BigQuery (monthly crawl of millions of sites with `bytesTotal`, `bytesJS`, `reqTotal`), queried in the Action to snapshot ~500 recognizable domains into a committed `sites.json`. Daily matchups are chosen deterministically from a date-seeded PRNG picking pairs whose weights differ by a fun-but-not-obvious margin (avoid blowouts and coin-flips via a difficulty band on the byte ratio). All gameplay is client-side against the static JSON, so it's free to host and instant. Hard part: picking pairings that feel surprising (the sleek-looking site that's secretly 9MB) rather than 'big brand = heavy', which needs a curated surprise score, not just raw bytes.

## v1 scope
- BigQuery HTTP Archive snapshot → sites.json in CI
- Date-seeded 5-round daily, total-bytes mode
- Reveal animation + local streak + share string

## Out of scope
- Live per-URL fetching (use the archive snapshot)
- Accounts, global leaderboard, alternate metrics
- Favicons/screenshots beyond a text card

## Risks & unknowns
- HTTP Archive is a homepage snapshot, not what a real session loads — numbers are directional; disclaimer needed.
- Matchup surprise-tuning is the whole fun; naive pairing is boring.
- BigQuery free tier limits — snapshot infrequently, cache aggressively.

## Done means
Opening the site on a given date shows the same 5 matchups to any visitor, a correct pick extends a persisted streak, the reveal displays real HTTP-Archive byte figures, and finishing yields a copyable emoji-scale share string.
