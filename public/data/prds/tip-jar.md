## Overview
A cooperative Schelling-point party game for 3–6 people in one room. A shared host screen (TV/laptop) shows four street performers and their tip jars; every player's phone is a private controller for splitting a fixed pool of money. The room wins only when everyone, independently and silently, divides their money exactly the same way.

## Problem
Almost every convergence game asks you to match a single choice, a point in space, or a moment in time. Nobody has made "match how the group *divides* a pool" — the everyday, wordless tension of splitting a bill or a tip fairly, turned into a guessing-the-room game. It's a fundamentally different convergence surface: a distribution, not a pick.

## How it works
The host TV shows four buskers with silly names and portraits, each with an empty glass tip jar. Each player privately gets $10 as ten $1 coins. On their phone (and only their phone) they see the four jars, their coin supply, their current split (e.g. 4/3/2/1), and a LOCK button. They drag coins into jars however they like — no talking, no reference, trying to match what they think everyone else will do.

The host TV shows ONLY the aggregate: the summed coin level in each jar rising as liquid, plus a "harmony" meter reflecting how tightly everyone's splits agree. It never shows an individual split or who tipped whom. Crucially the aggregate is ambiguous — a jar holding 12 coins could be 4+4+4 or 6+3+3 — so you can't reverse-engineer anyone; you can only *feel* the group's pull and adjust. The room wins when all players' four-number allocations are byte-identical. The reveal overlays everyone's splits side by side.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `room {players[], jars:4, budget:10}`; per-player `alloc:int[4]` summing to 10 plus `locked:bool`. On any change the server validates `sum==10`, recomputes `aggregate:int[4]` and `harmony = f(pairwise L1 distances)`, and broadcasts ONLY the aggregate to the host plus a private echo to each phone. Real-time load is trivial (low-frequency discrete updates); the genuinely hard part is *feedback design* — the aggregate must nudge convergence without de-anonymizing anyone. Win is evaluated only across locked states.

## v1 scope
- Exactly 3 players
- 4 jars, $10 budget (ten coins)
- One round
- Host shows aggregate jar levels + a harmony bar only
- Win = three identical int[4] arrays; reveal screen
- Runs on local Tailscale host

## Out of scope
- Variable budgets or jar counts
- Scoring, streaks, partial/near-miss credit
- Custom busker art beyond placeholders
- Matchmaking, multi-round sessions

## Risks & unknowns
- Allocation space (10 coins into 4 jars = 286 combos) may be too large for strangers to converge quickly → fall back to 3 jars / $6.
- With only 12 total coins the aggregate could still leak individual splits.
- Fun may lean heavily on busker flavor and the harmony meter's feel.

## Done means
Three phones join; each drags coins summing to 10 into four jars; the host shows a live aggregate + harmony bar and never any individual split; when all three arrays match on lock, the host fires a WIN and reveals the splits.
