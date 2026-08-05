## Overview

Quarter Turn is a 3–4 player cooperative puzzle where the phones stop being controllers and become *pieces*. Everyone lays their phone face-up on a real table inside a taped-out grid. Each screen renders one pipe segment (elbow, straight, tee). The input device is your hands: you physically pick up and rotate your phone, and the magnetometer/gyro reports its absolute heading, snapped to one of four quadrants. Water flows from a source at one table edge, through whichever pipes actually line up, to a drain at the other edge. For groups who have played every trivia-and-typing party game and want something tactile.

## Problem

Jackbox-shaped games treat the phone as a keyboard with a battery. The device in your hand has an absolute orientation sensor and it sits on a shared physical surface — that's a board and a set of pieces nobody uses. Physical puzzle games (Ricochet Robots, pipe tiles) can't hold hidden state; digital ones can't be touched. This is the overlap.

## How it works

1. **Tape the board.** Host TV shows a 2×2 slot diagram. Players tape four index cards on the table in that arrangement, source edge nearest the TV.
2. **Claim and zero.** Each phone picks an unclaimed slot, then calibrates: hold the phone flat, point its top edge at the TV, tap ZERO. That single offset kills per-device compass bias.
3. **Deal.** Each phone privately renders exactly one pipe segment, drawn rotated live to match the phone's real-world heading. You see *your* tile and nothing else. There is no map view anywhere on your phone.
4. **Solve.** Everyone rotates simultaneously — quarter turns snap at ±45° tolerance. The host TV shows only the water's current reach: it fills the connected prefix from the source and stops dead at the first mismatch. That's the group's sole shared signal, and it's partial: it tells you *where* the break is, never which rotation fixes it.
5. **Win.** All four tiles connected for 2 continuous seconds → water hits the drain, TV floods, done.

The verbal comedy is the point: nobody can name a direction that means the same thing to both of you across the table, so "turn it left" is actively wrong for the person sitting opposite.

## Technical approach

**Server:** one PartyKit / Durable Object room per game, authoritative. Socket.IO over Tailscale Serve works identically for a homelab deploy.

**Data model:**
- `Room { code, phase: 'lobby'|'calibrate'|'solve'|'won', slots: Slot[4], sourceSlot, drainSlot }`
- `Slot { id, playerId|null, tileType: 'elbow'|'straight'|'tee', quadrant: 0..3, headingRaw, zeroOffset }`
- Server owns `quadrant`; phones send raw heading only.

**Sync:** phones read `deviceorientation` (`alpha`, requesting permission on iOS 13+ via `DeviceOrientationEvent.requestPermission()`), apply the zero offset locally, and emit `heading` at 15 Hz, throttled to only fire on >5° change. Server snaps to quadrant with 8° hysteresis at the boundaries so a phone resting near 45° doesn't chatter. On every quadrant change the server re-runs a flood-fill from the source over the fixed slot adjacency graph (adjacency is *known*, because slots are taped down — no positional ranging needed) and broadcasts only `{reach: slotId[]}` to the host. Phones receive nothing about other phones.

**The genuinely hard part:** magnetometer heading is filthy near a metal table leg or a laptop, and it drifts. Mitigation is threefold: 90° quantization gives a ±45° error budget; the point-at-TV zeroing absorbs static per-device bias; and the client blends `webkitCompassHeading`/`alpha` with gyroscope-integrated yaw (complementary filter, ~0.98 gyro weight over 1s windows) so short-term rotation is gyro-driven and the magnetometer only corrects slow drift. Fallback if a phone's heading is unusable: a touch-drag rotate control, logged as degraded.

## v1 scope

- 4 players exactly, 2×2 grid, one hand-authored puzzle with a unique solution.
- Three tile types, no tees needed to solve (tee is the red herring).
- One round. Win state = a full-screen flood animation on the TV. No score, no timer, no rematch button (refresh the host tab).
- Calibration = one button. No re-calibration mid-round.

## Out of scope

Generated puzzles, larger grids, ultrasonic auto-detection of slot positions, spectator mode, phones detecting when they've been lifted, scoring, multiple rounds, sound.

## Risks & unknowns

- Heavy steel table or a MacBook 20cm away could wreck two phones' compasses at once; untested until playtest.
- iOS orientation permission requires a user gesture per page load — must be folded into the JOIN tap.
- Screens auto-dim/sleep while lying untouched. Needs Wake Lock API and a fallback nudge.
- Puzzle may be trivially solvable by brute force in 20s with four people spinning at random. If so, tighten to a 5-second flow-hold or add a fifth slot.

## Done means

Four real phones on a real table, four different people, no verbal instructions from the designer: the group reaches the flood animation within 4 minutes, and at least one player is heard saying some version of "no, *my* left." A phone rotated 90° updates the TV's water reach in under 250ms.
