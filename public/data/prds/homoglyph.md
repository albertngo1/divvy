## Overview
Homoglyph is a daily browser game that pits your eyes against real-world phishing infrastructure. Each day you get a grid of domains—some are legitimate popular sites, some are confirmed scam/typosquat/homoglyph domains—and 60 seconds to tap only the fakes. Miss a real scam or flag a real bank, lose the round. For anyone who's ever squinted at `paypaI.com` and wondered.

## Problem
Phishing awareness is delivered as the most passively-consumed content on earth: mandatory training slides and "be careful out there" emails nobody reads. Meanwhile the actual skill—spotting a Cyrillic 'а' in a URL, a punycode `xn--` prefix, a plausible-but-wrong TLD—is a perceptual muscle you only build by reps. There's no fun, competitive place to get those reps.

## How it works
- A date-seeded daily set of ~15 domains renders in a mono-spaced grid, homoglyphs and all.
- Tap the ones you believe are malicious; a live timer ticks.
- On submit: instant reveal with the punycode decode, the registration age, and which character was swapped, so you learn the tell.
- Score = correct flags − false positives, weighted by speed. Streaks, a global daily leaderboard, and a Wordle-style spoiler-free share card.
- A weekly "boss" set uses only IDN homoglyph attacks.

## Technical approach
Static site (SvelteKit), no backend beyond a tiny leaderboard function. Malicious domains are pulled nightly from the phishdestroy/destroylist open API (170k+ curated, already-dead threats—so the game never drives traffic to a live victim). Legit decoys come from the Tranco top-sites list. A build-time job assembles each daily set deterministically from a seed, mixes in generated homoglyph/typosquat variants using a Unicode confusables table (riffing on UTS-39 confusable mappings), and precomputes the reveal metadata. Data model: `DailySet{date, entries:[{domain, punycode, verdict, tell}]}`. Hard part: calibrating difficulty so it's beatable but the false-positive trap (flagging a weird-but-real domain) stays sharp.

## v1 scope
- One daily set, 15 domains, 60s timer
- Reveal screen with punycode decode + swapped-char highlight
- Local streak + shareable result card

## Out of scope
- Accounts and cross-device sync
- Real-time/live-domain checking
- Anything that fetches the actual suspect sites

## Risks & unknowns
- Only use confirmed-dead domains from destroylist to avoid amplifying live scams.
- Homoglyph rendering differs across fonts/OSes—must pin a webfont for fairness.
- destroylist API rate limits / schema drift.

## Done means
A player loads today's puzzle, has 60 seconds, submits, sees a per-domain reveal explaining each tell, gets a shareable score, and tomorrow's puzzle is deterministically different—verified by two devices seeing the identical daily set.
