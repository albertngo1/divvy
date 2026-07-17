## Overview
A 3–5 player prediction-market party game where the group watches a real, breathless product pitch (a crowdfunding video, an infomercial, an AI keynote demo) and each player privately runs a LONG/SHORT position on the question: *is this thing real, or vaporware?* For anyone who's ever smelled a scam mid-Kickstarter.

## Problem
Groups passively binge hype videos and mutter "that's fake" with zero stakes. The fun of calling a bluff dies the moment someone says it out loud and everyone piles on. There's no private conviction, no cost to being early or wrong, no sweat.

## How it works
Host TV plays a ~60s curated pitch tagged (hidden) as REAL or VAPORWARE. A shared **Hype Index** ticks along a scripted curve keyed to the clip's timeline — it spikes at grandiose claims — and is deliberately a *lure*, not a truth signal.
- **Player phones (private):** a single toggle — LONG ("it's real") or SHORT ("it's fake") — and a running personal **conviction meter** that accrues the longer you hold one side. Flipping costs a small spread and resets a bit of conviction. Nobody sees your position.
- **Host TV (shared):** the clip, the Hype Index, and an *aggregate* long/short interest bar (e.g. "60% LONG") — never individual positions or identities.
At the end the curtain drops: REAL or VAPORWARE is revealed. Everyone holding the correct side at that instant splits the pot weighted by accumulated conviction — so committing early and holding your nerve through a scary hype spike pays more than a last-second flip. Then one open round of "who flipped last?" for laughs.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Clip{id, verdict, hypeKeyframes[]}`, `Player{id, side, convictionMs, flips}`, `Room{phase, tNow}`. The Hype Index is precomputed keyframes interpolated client-side against a server clock tick (~4Hz) — cheap. Sync strategy: each flip is a timestamped server event; the server integrates `convictionMs` per player as `Σ(time held on final winning side)` so scoring is deterministic and replay-safe. The genuinely hard part is **honest conviction accounting under latency**: a flip's effective timestamp must be server-stamped (not client), or players lie by lagging; solve with server-authoritative flip times and a fixed reveal barrier that ignores any flip arriving after `revealT`.

## v1 scope
- 3 players, one round, one hardcoded clip with a known verdict.
- Single LONG/SHORT toggle, flip-with-spread, conviction = time-on-final-side.
- Aggregate interest bar + Hype Index lure on host.
- Reveal, conviction-weighted payout, one "who flipped last" gag.

## Out of scope
- User-uploaded clips, ML verdict detection, multi-market or multi-round.
- Continuous price/order book, shorting cost curves, chip persistence.
- Auto-generated Hype Index (v1 keyframes are hand-authored).

## Risks & unknowns
- Needs a curated clip library with clean, non-obvious REAL/VAPORWARE tags.
- If the verdict is guessable in 5s, there's no game — clip selection is everything.
- Hype Index must tempt without accidentally correlating with truth.

## Done means
Three phones join, each privately holds and can flip LONG/SHORT with server-stamped times, the clip reveals its verdict, conviction-weighted payouts match a hand calculation, and no phone can see another's position before reveal — one round, under two minutes.
