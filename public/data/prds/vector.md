## Overview
Vector is a 4-player cooperative panic game: one **Pilot** sees the whole board on their phone; two or three **Pieces** each control a token they can barely see and must move purely on the Pilot's silent haptic nudges. It's for groups who like tense, wordless coordination—air-traffic-control comedy where the controller can only speak in buzzes.

## Problem
Most 'guide the blind player' games are turn-based and verbal, so one loud person narrates and everyone else obeys. The itch: make the guide *information-rich but bandwidth-starved*, and make it real-time, so the fun is the Pilot drowning while juggling three lives at once—and Pieces acting on faith.

## How it works
The **host TV** shows a wide lane with three token dots crawling left-to-right and a wall of hazard (gaps in a moving barrier, Frogger-style) sweeping toward them. Crucially the TV shows tokens and abstract motion but is *ambient*—Pieces aren't reading it mid-panic.

- **Pilot's phone (the map):** the ONLY place the hazard's exact gaps and timing are legible. Pilot sees all three tokens + the incoming barrier and has four buttons per Piece: nudge Up / Down / Hold / Go. Tapping sends a **private haptic pattern** to that one Piece's phone (one buzz = up, two = down, long = hold, etc.).
- **Each Piece's phone:** near-blank. A single token in a vertical lane and a haptic feed. They feel their buzz and move their token up/down a notch or hold. They cannot see the hazard, the barrier, or the other Pieces' buzzes.

Because the barrier moves continuously, the Pilot must serve three private channels under time pressure; a mistimed or wrong buzz kills a token. Win = all tokens survive one full 60-second sweep.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). **Data model:** `room{barrierState, tokens:[{id,lane,alive}], channels:{pieceId->lastBuzz}}`. Server ticks the barrier at ~20Hz, is authoritative on collisions. Pilot inputs are commands routed to a single target Piece; server relays a buzz event to that phone only and applies the lane delta on next tick. **Sync strategy:** server-authoritative positions broadcast to host; Pieces receive only their own token + buzz. **Genuinely hard part:** perceived latency—the Pilot buzzes against a moving hazard, so round-trip lag between buzz→Piece reaction→server collision check must feel fair. Tune with a ~150ms input-buffer grace window on collisions and client-side haptic echo so the Piece feels the buzz instantly.

## v1 scope
- 1 Pilot + 2 Pieces (three total phones), one 60-second sweep.
- One hazard pattern, 3-lane board, four buzz types.
- Win/lose splash; no scoring, no rounds.

## Out of scope
- Physical/room movement or sensors.
- Multiple sweeps, difficulty ramps, Pilot swapping.
- Piece-to-Piece or verbal channels.

## Risks & unknowns
- Haptic vocabulary may be unlearnable in 10s—needs a 15s buzz tutorial.
- Pilot cognitive overload at 3 Pieces might be *too* hard; 2 is the safe v1.
- iOS PWA haptics are limited; may need an on-screen flash fallback per Piece.

## Done means
Three phones join, the Pilot's phone shows the hazard, Pieces feel distinct private buzzes, and a group can beat one 60s sweep with all tokens alive at least once in a playtest.
