## Overview
Blackout is a 3-player co-op found-poetry convergence game. Everyone is handed the identical short passage on their phone and must black out all but a fixed few words — privately, no talking. The room wins only if all three players leave the *same* words standing, and the survivors read out as one shared blackout poem worth keeping.

## Problem
Editorial taste feels deeply personal — *which* words carry the meaning? Convergence games rarely tap that. Blackout turns "what's essential here" into a silent Schelling problem, and rewards agreement with an artifact: a tiny poem the group made without a word of discussion.

## How it works
The host TV displays a ~16-word passage (a sentence fragment, a lyric, an overwrought instruction manual line). Each phone shows the same words as tappable chips; tapping toggles a word between *kept* and *redacted* (black bar). You must keep **exactly 4**. When your four feel right, you lock.

**Phone (private):** the full passage with *your* blackout in progress — your kept/struck state only. You never see anyone else's marks.
**Host TV (shared):** the passage with a heat bar under each word — how many of the three players currently keep it (0–3), updating live — but never a full player's selection and never who. So you can see "three of us kept *ANCHOR*, but *DROWN* is split" and steer, without anyone revealing their whole poem.

**Win = all three kept-sets are byte-identical** (same 4 words). On the win, the host animates every non-kept word blacking out in unison, leaving the shared found-poem centered on screen as a keepsake PNG. On a miss, it shows the three near-poems side by side so you groan at how close you were.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `passage: string[]`, `players[id] = {kept: Set<index>, locked}`. On every toggle the server recomputes a per-index heat vector `heat[i] = count of players keeping word i` and broadcasts *only that vector* to the host — the individual sets never leave the server. Win check: all locked sets equal. No hard real-time timing, so the genuinely hard part is the anti-leak aggregate (heat must be un-invertible for 3 players — with only 3 players a per-word count can partly deanonymize, so v1 keeps heat coarse and hides it until at least two players have started) plus authoring passages where 4 "essential" words aren't trivially obvious yet not hopelessly ambiguous.

## v1 scope
- Exactly 3 players, one passage, keep-exactly-4.
- Live per-word heat bar on host; lock-in per phone.
- Win detection + unison blackout reveal + saved poem image.

## Out of scope
- Multiple rounds, variable keep-count, player-authored passages.
- Reordering kept words, punctuation editing, more than 3 players.
- Fancy typography beyond one clean poster layout.

## Risks & unknowns
- Heat with 3 players can leak selections; needs a coarse/delayed reveal rule.
- Passage authoring is the whole game — too obvious = instant win, too loose = never converges.
- "Exactly 4" may be too tight; might need keep-3-to-5.

## Done means
Three phones load the same passage, each privately blacks out to exactly four words, the host shows a correct live per-word heat bar without exposing any full selection, and it declares a win iff all three kept-sets match — then renders the shared blackout poem as a downloadable image.
