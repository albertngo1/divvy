## Overview
Cairn is a 4-player real-time cooperative navigation game. One player is the Cartographer, whose phone privately shows a hidden hazard field and a tiny budget of trail-markers; the other three are Pieces walking that field blind, each phone showing only the glow immediately around them. The shared host screen shows a fog board slowly revealing the wreckage. For groups who like sweaty, wordless-optional real-time coordination.

## Problem
'Guide the blind player' games usually give the guide unlimited words and the player one body to steer. The itch: force the guide to communicate through a scarce, spatial channel to MULTIPLE bodies at once, so rationing and prioritization — not narration — become the game.

## How it works
A continuous field holds invisible pits and one exit. Three Pieces start at different edges and move continuously via an on-screen thumbstick, in real time, all at once.

PRIVATELY, per phone:
- **Cartographer's phone:** the full field — pits, exit, and all three live Piece dots. A counter shows remaining markers (5). Tapping a cell drops a permanent glowing cairn there.
- **Each Piece's phone:** a dark screen showing only cairns within one cell of that Piece, rendered as a soft directional glow ('something bright is up-and-left'). Walking into a pit greys the phone out — you're stranded until the round ends.

The Cartographer sees all three Pieces diverging toward different pits simultaneously and has only five markers to spend across the whole board. Do you lay a dense breadcrumb line for the Piece nearest death, or spread markers to cover all three? Pieces chase glows they can only partly see. Win = at least two Pieces reach the exit before a 90-second timer.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `{field: {pits, exit}, cairns: {x,y}[], pieces: {id, x, y, alive}[], markersLeft}`. Pieces stream thumbstick vectors at ~15Hz; the server integrates positions authoritatively (never trust client position — anti-cheat and lag-hiding). For each Piece the server computes the visible-cairn subset and pushes ONLY that private slice, so each of the three phones renders a different local view at the same instant — the load-bearing asymmetry. The hard part is real-time position integration under mobile-network jitter plus per-Piece view culling at 15Hz without flooding sockets; use delta compression and only push a Piece's view when its local cairn set changes.

## v1 scope
- 1 Cartographer + exactly 3 Pieces
- One fixed field, one exit, 5 markers, 90s timer
- Thumbstick movement, glow-only Piece view, permanent cairns
- Host: fog board revealing visited cells + timer

## Out of scope
- Removable/timed markers, marker types, multiple exits
- Procedural fields, difficulty tiers, scoring beyond win/lose
- Voice suppression rules (talking allowed in v1)

## Risks & unknowns
- Real-time blind movement may feel floaty/frustrating without haptic edge cues.
- 5 markers across 3 Pieces might be too stingy or too generous — needs tuning.
- Per-Piece view culling at 15Hz across 3 phones could strain a phone PWA; may need to drop to event-driven pushes.

## Done means
Four phones + a TV: three Pieces move continuously via thumbstick seeing only nearby glows, the Cartographer drops up to 5 permanent cairns on a private hazard map, each Piece phone shows a distinct local view simultaneously, and a hand-authored field is winnable within 90 seconds when the Cartographer rations markers well.
