## Overview

A 3–4 player cooperative room game where the board is every horizontal surface in your home. Each phone is a friction meter: you lay it flat, flick it into a spin, and the gyroscope measures how hard the surface fights back. Each player privately holds a *different* target friction band, so the group has to fan out — kitchen counter, dining table, rug, a hardback book, the arm of the couch — and lock in simultaneously on distinct surfaces. For people at a house party who are already standing up and wandering.

## Problem

Party games keep everyone parked on the couch staring at a TV. Meanwhile every room contains twenty surfaces with wildly different coefficients of friction and nobody has ever noticed. The itch: a game that makes the furniture legible, that rewards getting up and touching things, and that can't be played by passing one phone around because it needs four spins happening in four rooms at once.

## How it works

1. **Lobby calibration (20s).** Every phone spins once on the host table. That spin defines that device's reference deceleration = 1.00, absorbing differences in phone mass, case material, and camera-bump wobble.
2. **Deal.** Each phone privately receives a target band expressed as a multiple of its own reference — e.g. `0.35× – 0.55×` (much slicker than the host table) or `2.1× – 3.4×` (much grippier).
3. **Hunt (90s).** Player sets phone flat, flicks it, phone measures. Coulomb friction makes angular velocity decay roughly *linearly*, so the fingerprint is the deceleration slope dω/dt — which is independent of how hard you flicked. Phone shows a needle: too slick / in band / too grippy. Lock requires two consecutive in-band spins on the same spot.
4. **The squeeze.** If two locked phones report decelerations within 12% of each other, the server flags a COLLISION — they're on the same surface class, and one must move. Win = all phones locked, in band, no collision, held 3 seconds.

**Phone shows privately:** your band, your live needle, your last three spins, lock state.
**Host TV shows:** four lanes with only a spinning glyph and a lock pip, the collision klaxon, and the clock. Never the numbers, never the bands. The only way anyone learns "the glass table is a 0.4" is by someone shouting it.

## Technical approach

Host browser tab + phone PWA + PartyKit Durable Object per room (Socket.IO over Tailscale Serve as the LAN fallback).

- **On-device:** `DeviceMotionEvent.rotationRate.alpha` at ~60 Hz (iOS needs `requestPermission()` behind a tap). Spin detector: trigger on |ω| > 400°/s, fit a least-squares line to the 600 ms window after peak, reject fits with R² < 0.9 (that's a slide or a bump, not a spin).
- **Wire:** phones send only `{playerId, spinId, decel, r2, ts}` — a few bytes per spin, no streams.
- **State:** `Room { phase, players: {id, name, refDecel, band:[lo,hi], lastSpins[3], lockedAt } }`. Server ticks 10 Hz, broadcasts a *reduced* view to the host and a private view down each player socket.
- **Hard part:** not sync — cross-device calibration. A heavy phone in a silicone case and a light one in glass give different decelerations on the same wood. Everything must be ratio-to-own-reference, and the collision threshold has to be tuned so real surfaces separate but the same surface reliably collides.

## v1 scope

- 3 players, one 90-second round, one shared apartment.
- Three hardcoded target bands guaranteed to be satisfiable by a normal living room.
- Lobby reference spin + hunt + lock. No scoring beyond win/lose.
- Host screen: three lanes, clock, collision klaxon.

## Out of scope

Multi-round campaigns, surface naming/mapping, leaderboards, reconnect grace, spectators, any tuning UI.

## Risks & unknowns

- Android gyro sampling varies (some devices cap at 50 Hz); the linear fit may need a longer window.
- Carpet and rug may not spin at all — need a "no valid spin detected" nudge.
- Phones may slide off tables. Add a warning card, accept some risk.
- Bands might be unsatisfiable in a sparse room; v1 ships a "reroll the deal" button.

## Done means

Same phone, same surface, spun ten times → decelerations within ±10%. Two clearly different surfaces (glass table vs. sofa arm) never collide. Three strangers who have never played find three distinct qualifying surfaces and lock simultaneously inside three minutes.
