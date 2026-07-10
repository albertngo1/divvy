## Overview
Offbeat is a rhythm anti-coordination game for 3-4 people in a room, each phone acting as a single percussion voice, mixed live through one shared host speaker. Landing on the same beat as anyone else is the failure — the goal is to *stay out of each other's way*.

## Problem
Musical party games (and our own convergence experiments like Unison) reward locking together. The inverse is unexplored: the tension of a groove where simultaneity is catastrophic, forcing players to carve out non-overlapping slots by ear. It's the drummer's nightmare — everyone crashing on the one — turned into a game.

## How it works
The host screen and speaker run a steady 4/4 click at a fixed tempo and are the room's ONLY audio output. Each phone PRIVATELY is a single tap pad with a distinct timbre (kick, clap, rim, shaker) and shows only your own recent hits scrolling past a playhead — you never see anyone else's grid.

You tap to place hits into the bar. The server timestamps every tap, normalizes for network latency, and quantizes onto a shared 16-step grid. If two players' hits fall in the same step, the host plays a harsh clash/buzz instead of the two clean sounds and lights a red flash — that step is 'jinxed.' Your private phone flashes 'you clashed' but never says *with whom*.

The room's job over one 8-bar round: collectively fill the bar with hits so it sounds full and funky, while never two-in-a-step. You can only hear the emergent result through the host, so you're constantly nudging your placement into the gaps others left — a silent negotiation conducted entirely in rhythm. Win = 4 consecutive clash-free bars with at least, say, 6 filled steps.

Per-phone is load-bearing: you must physically tap your own voice in real time. One passed phone can't hold four interleaving parts.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve or PartyKit). Data model: `room{tempo, bar, grid[16]→Set<playerId>}`, `player{id, timbre}`. On tap, phone sends a client timestamp; server subtracts a per-client RTT estimate (rolling ping) to place it on the master clock, then quantizes. The genuinely hard part is fair collision detection under variable phone latency — a real clash vs. a jitter artifact — so the collision window (~60-70ms pre-quantize) must be tuned against measured RTT, and audio must render host-side to avoid per-phone timing drift.

## v1 scope
- 3 players, one fixed tempo, one 8-bar round.
- Each phone = one hardcoded voice, single tap pad.
- Host-side audio only; clash = buzz + red flash.
- Win = 4 clean bars with ≥6 filled steps.

## Out of scope
- Multiple rounds, tempo changes, per-player patterns/loops, scoring ladder.
- Phone-side audio, swing, velocity.

## Risks & unknowns
- Latency normalization may misfire on bad Wi-Fi, flagging phantom clashes and feeling unfair.
- Without hearing your own hit locally, tapping-by-host-feedback may feel laggy and disorienting.
- 3 voices may make no-collision too easy; tuning grid size vs. player count is delicate.

## Done means
3 phones tap live, host renders a mixed groove in time, two taps landing in the same quantized step reliably produce a clash + red flash within one bar, and a clean 4-bar stretch triggers the win — verified with a deliberate same-step collision and a deliberate interleave.
