## Overview

Heavy Thumb is a 3–6 player Wavelength riff with the psychic deleted. The TV shows one spectrum and one needle; the needle is the *live weighted mean* of every phone's slider. Each player privately holds a narrow target band they're being paid to land on and a hidden pull weight (×1, ×2 or ×3). One 90-second round of continuous, simultaneous, arguable tug-of-war.

## Problem

Wavelength owns a beautiful physical object — the dial — and then lets exactly one person touch it, once, at the end. Everyone else is a debate club with no hands. Meanwhile every consensus party game quietly rewards whoever talks loudest, because talking is the only lever there is. Heavy Thumb gives everyone a hand on the dial at the same time, and makes the strength of your hand a secret worth lying about.

## How it works

**Host screen:** a subject ("A wedding gift"), a spectrum ("Cheap ←→ Extravagant"), one needle, a 90s clock, and a banked-point chip that lights up publicly the moment any player scores.

**Each phone, privately:** the same needle, plus three things nobody else can see — your slider (your thumb), your shaded target band, and your weight badge. You never see another player's position, band, or weight.

The needle is the weighted mean of all sliders, updating continuously. You bank a point the first time the needle rests inside *your* band for 3 unbroken seconds. Bands are placed so some players are natural allies and some are not, and nobody knows which.

Talking is unlimited and entirely unverifiable. "I've had my thumb pinned at the far left this whole time" is free to say and impossible to check — except by physics. If the needle lurches the instant you start defending a position, the room just learned you're heavy. So the ×3 player has to move *gently* and argue *loudly*, which are opposite instincts, and the ×1 player has to build a coalition they can't audit.

The public banked-chip is deliberate leakage: when Priya's chip lights, everyone learns where the needle was three seconds ago mattered to her, and she's now a free agent.

## Technical approach

PartyKit / Durable Object per room. Phones stream slider position at 20 Hz; the DO holds authoritative positions and ticks at 20 Hz, broadcasting a single float — the damped needle — to every client. Model: `{phase, subject, axis, tEnd, players: {id, pos, weight, band:[lo,hi], banked}}`. Positions are last-write-wins per player; no CRDT needed since no two clients write the same cell.

The needle is not the raw mean — it's a critically damped follower of the mean, so it reads as a physical object rather than a stepper motor. Crucially, dwell scoring runs server-side on that *same damped value*, so what you see is exactly what scores. Clients render with a 100 ms interpolation buffer.

Hard parts: (1) asymmetric latency — a player on bad wifi sees a stale needle and will chronically overshoot, so the client renders its own thumb optimistically while the needle stays server-truth; (2) dwell must survive a single-frame excursion, so the 3s timer uses hysteresis margins on band edges rather than a bare inequality; (3) a slew-rate limit on each slider (rendered as physical resistance) so bullying the needle takes visible seconds instead of one instant yank.

## v1 scope

- One 90s round. Exactly 4 players. One hardcoded subject + axis.
- Weights dealt ×1, ×1, ×2, ×3.
- Bands fixed width (12 of 100), randomly placed, seeded to guarantee at least one two-player overlap.
- Host: needle, clock, four banked chips. Phone: slider, band, weight.
- Full reveal at the buzzer — every band, every weight, every final thumb position.
- Room-code join. No accounts, no reconnect, no lobby.

## Out of scope

Multi-round series and scoring; custom or generated axes; spectator view; reconnect; haptics; binding negotiation/deal timers; inverted "keep the needle OUT of here" sabotage bands (strong v2 candidate); >6 players.

## Risks & unknowns

The honest failure mode is stalemate — the needle parks dead center for 90 seconds and nobody banks. Mitigations: guaranteed band overlap, plus dwell drops to 1.5 s in the last 20 seconds. The other risk is that the group simply declares their bands out loud and takes polite turns; the hidden weights and the end-of-round reveal are what make that either genuinely cooperative or genuinely embarrassing, but it may need a scoring nudge for defectors. Mobile Safari touch-drag with scroll suppression is fiddly and worth prototyping first.

## Done means

Four phones plus a TV. Each thumb visibly moves the needle within 150 ms. The ×3 player can drag the needle 20 points in about 4 seconds while a ×1 player demonstrably cannot. At least two players bank in a test round. The reveal screen shows all weights and bands. And in a live playtest, someone lies about where their thumb is and gets caught by the needle's motion.
