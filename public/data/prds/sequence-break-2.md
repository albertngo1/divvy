## Overview
Sequence Break is a cooperative reaction-and-coordination game that steals the Metroidvania structure of *progression gated behind specific traversal abilities*. Three players share a single auto-running hero; each secretly holds ONE ability (dash, jump, float) and must fire it at exactly the right gate. For groups who like frantic, call-out-heavy coordination.

## Problem
The soul of a Metroidvania is 'which ability opens THIS obstacle' — the little jolt of realizing *oh, this is where the dash goes.* Solo, you hold every ability, so that recognition is entirely internal. The itch: externalize it across a room. Give each person exactly one power and the private recognition becomes a shouted group scramble instead of a solitary aha.

## How it works
TV: a side-scrolling track; a hero auto-runs left→right at a steady pace. Ahead, colored gates approach — a blue wall (needs DASH), a high ledge (needs JUMP), a spike pit (needs FLOAT). Each gate's icon appears a few seconds before the hero reaches it. Some gates are DOUBLE, needing two abilities fired together.
Each phone PRIVATELY: one big button labeled with YOUR secret ability (e.g. FLOAT) plus a cooldown ring. You do NOT know anyone else's ability. When a gate needing FLOAT arrives, you must tap within the ~1s window as the hero hits it. Correct ability = hero passes; wrong or missing ability = hero takes a hit (3 HP). Double gates require both holders to tap inside the same window.
The load-bearing bit: abilities are partitioned and private, so the group must call out ('I've got dash!' 'who has float?!') and each player watches for the gate that's *theirs*. A single passed-around phone can't hold three secret abilities or react to overlapping windows — the simultaneous private state IS the game.

## Technical approach
Host + phone PWAs + authoritative WS server (Socket.IO over Tailscale Serve, or PartyKit). Model: `{heroX, hp, gates:[{x,type,double}], abilities:{playerId:type}, cooldowns}`. The server drives a fixed-timeline scroll on an authoritative clock, streaming heroX + upcoming gates to the TV and streaming only your own ability + cooldown to your phone. Taps carry client send-time; the server validates each against the gate window. Genuinely hard part: cross-phone timing fairness — the window must feel fair despite varying WS latency, so it's generous (±400ms) and adjudicated on server-received timestamps normalized by a per-phone half-RTT measured during a warmup ping loop.

## v1 scope
- 3 players, 3 ability types (one each), one linear track.
- 5 gates including exactly 1 double gate.
- One round; win = hero reaches the end with HP > 0.

## Out of scope
- Backtracking / branching maps, ability upgrades, multiple players sharing an ability, enemies, mid-track checkpoints, reconnection.

## Risks & unknowns
- Latency fairness for tight windows in a real living room.
- Is one ability per phone too passive between your own gates? (Double gates + brisk pace are the mitigation.)
- Readability of which gate is incoming and whose it is.

## Done means
Three phones each show one distinct secret ability; the TV auto-runs a hero through 5 gates; correct-ability taps inside the window pass gates while wrong or missed taps deal damage, yielding a deterministic win/lose strictly reconstructable from the timestamped tap log.
