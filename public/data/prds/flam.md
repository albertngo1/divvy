## Overview
Flam is a real-time rhythm party game for 3–4 people where **landing on the same beat as someone else is the loss condition**. A flam (two drum strokes almost coinciding) is exactly the collision the game punishes. The room shares one looping bar of 8 slots and must silently negotiate a clean, distinct polyrhythm — because any overlap clashes and zeroes both players.

## Problem
Rhythm party games (Spaceteam-drumming, unison-tap games) reward syncing up. Flam inverts that: you *don't* want to be where anyone else is. It captures the emergent, wordless choreography of a drum circle where everyone instinctively finds an empty pocket — and makes the failure to do so audible and painful.

## How it works
The host is the only speaker, playing a steady metronome loop (~90 BPM, 8 eighth-note slots per bar) plus a click. It's the sole audio; phones stay silent.
- **Each phone privately** shows an 8-slot ring that lights the current slot in time with the loop. You tap to place a hit on the nearest slot; hits persist as your own repeating ostinato. Your screen shows *only your own* placed slots and, after each bar, which of *your* slots flammed. You never see others' slots.
- **The host screen** shows an abstract 8-slot bar that fills as clean notes accrue — but shows a red shudder on any slot where a collision happened, never who caused it. It's the shared ear, not a cheat sheet.
- Scoring each bar: for every slot, if exactly one player hit it → clean note, that player +1 and the host sounds a nice tone. If 2+ hit the same slot → **flam**: harsh clash sound, everyone on that slot scores 0 and takes a strike. Since you're blind to others, you find empty pockets by trial — placing, flamming, and fleeing to a different slot.
- Play one ~24-second loop (8 bars). Most clean notes wins; flams penalize. Payoff: the host plays back the final de-conflicted groove — the emergent polyrhythm the room negotiated in silence.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve; host browser tab holds the master clock and audio (Web Audio API). Data model: `Room { tempo, bar, grid[bar][slot] = [playerIds] }`. Phones send `{playerId, tapClientTs}`. The **genuinely hard part** is fair simultaneous-hit detection: the server RTT-corrects each tap timestamp against the host's shared clock, quantizes it to the nearest slot with a fixed collision window (e.g. ±60ms → same slot), and resolves collisions server-side so device latency doesn't unfairly flam the laggier phone. Clock sync via periodic ping/offset estimation; the host clock is ground truth and phones display a locally-predicted slot cursor.

## v1 scope
- 3 players, one fixed tempo, 8 slots, one 8-bar loop.
- Persistent-ostinato tapping, per-bar flam resolution, most-clean-notes wins.
- One clean tone, one clash sound, one final groove playback.

## Out of scope
- Tempo changes, multiple bars of different lengths, swing.
- Team/co-op scoring modes, multiple rounds, leaderboards.
- Per-phone audio (host stays the only speaker in v1).

## Risks & unknowns
- Clock sync + tap quantization must feel fair across phones or the game feels arbitrary — the make-or-break risk.
- The right collision window is unknown; too tight = never flams, too loose = always flams.
- Blind slot-hunting may frustrate if the loop is too short to recover from a bad flam.

## Done means
Three phones join, tap into a shared looping bar, the server correctly quantizes and RTT-corrects taps so single hits score clean and coinciding hits flam both players, the host shows only aggregate clean/clash state, and the final de-conflicted polyrhythm plays back audibly.
