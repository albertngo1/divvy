## Overview
Riser is a 4-player cooperative sorting game that uses the phone's barometric pressure sensor to measure *height off the floor*. Each player is secretly assigned a rank (1–4) and must arrange their phones in ascending physical height — a living staircase across the room — with distinct gaps, holding it steady for 3 seconds. The vertical axis of the room is the board. For groups who liked 'The Mind' but want it in their arms, not their cards.

## Problem
The barometer is the most-ignored sensor on the phone — present on most flagships, used by almost nothing. Yet it resolves vertical motion to ~10–20cm via air-pressure differences. No party game has ever made *how high you hold your phone* into a shared, contested space. The itch: a silent-coordination puzzle where the signal is your own body height and you can't peek at anyone else's.

## How it works
Each phone PRIVATELY shows only: its secret rank badge (1–4), and a vertical 'relative height' bar derived from its barometer — calibrated to zero when rested on the floor at start. It does NOT show anyone else's height or rank. Players must, without speaking numbers, physically raise/lower their phones so that rank order matches height order (rank 1 lowest, rank 4 highest) with a minimum gap between neighbors.

The shared HOST SCREEN shows a single traffic light: red while the ordering is wrong or gaps too small, amber when *almost*, green when the four heights are strictly ascending-by-rank with clean gaps. A 3s green hold wins. Crucially, the host never reveals who is where — the group must renegotiate physically, feeling out 'am I higher than them?' through trial, gesture, and the amber flicker.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Phones read the barometer (Sensor API `Barometer` / pressure), stream pressure + timestamp at ~10Hz. Data model: `Room{players[], ranks{playerId:1..4}, phase}`; per-player `{p0 (floor zero), pNow}`.

The hard part is that absolute pressure drifts over a round — HVAC, weather, an opened door — by more than the whole signal. Solution: *differential barometry*. Each tick the server subtracts the mean pressure across all four phones (common-mode rejection), leaving only relative heights; this cancels weather/HVAC drift that hits every phone equally. Height ≈ Δp / 12 Pa·m⁻¹. Then it checks rank-vs-height monotonicity plus a minimum inter-step Δ. A short median filter tames sensor jitter and brief door-slam transients.

## v1 scope
- One round, exactly 4 players, ranks fixed and pre-dealt.
- Floor-zero calibration step, then live sort.
- Traffic-light-only host feedback; 3s green ends it.

## Out of scope
- Phones lacking a barometer (show 'unsupported').
- More than 4 players, multiple rounds, per-player scoring.
- Absolute-altitude anything; only relative order matters.

## Risks & unknowns
- Barometer availability is uneven across devices — hard gate.
- Sensor resolution may force uncomfortably large (~40cm) gaps.
- Fast arm motion adds dynamic-pressure noise; needs a settle window.

## Done means
Four calibrated phones, four hidden ranks, and the group physically sorts into a staircase — the host light goes green only when heights ascend by secret rank with clean gaps, held 3s, with no phone ever displaying another player's rank or height.
