## Overview
Plumb is a concurrent-room party game for 3–5 players. Each player holds their phone and physically tilts it; the room must silently converge on ONE shared orientation with no talking, no numbers, and no view of anyone else's screen. It's a séance-flavored coordination game where your hands, not your words, do the negotiating.

## Problem
Most 'match without talking' games funnel through a screen you stare at. Plumb wants the convergence to live in your body — the itch of feeling the room lean one way and deciding whether to follow or hold your ground, purely by watching a shared blob tighten.

## How it works
The host screen shows a big merged bubble-level: every player's live orientation drawn as one fuzzy cloud of dots, plus a **forbidden dead-zone ring** around dead-flat. The room can't win by all laying phones flat — they must agree on a tilt that's meaningfully off-level (a direction AND an amount), so a real Schelling decision exists ("which way do we all lean?").

Each **phone shows privately**: only its OWN tiny bubble and a haptic nudge when it enters/leaves the dead zone. Crucially, a phone never shows anyone else's angle — if it did, players would just copy a leader and the silent feel-it-out tension vanishes. The only shared feedback is the merged cloud on the TV: scattered = big fuzzy blob, aligned = tight point.

Win: all orientations within a tolerance cone, outside the dead zone, held steady for ~3 seconds. The cloud snaps to a single glowing dot and the TV plays a satisfying chime.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve).

Data model: `players[id] = {pitch, roll, inZone, ts}`. Phones read `DeviceOrientationEvent` (needs iOS permission tap), throttle to ~20 Hz, send `{pitch, roll}`. Server keeps latest per player, computes cloud centroid + angular spread, checks the win predicate, and broadcasts the aggregate cloud (not individual identities) at ~15 Hz to host and phones.

Sync strategy: last-write-wins per player, fixed server tick recomputes convergence. Individual angles are broadcast ANONYMIZED (shuffled, unlabeled) so the cloud reads as one organism.

Genuinely hard part: (1) normalizing orientation across phones held in different grips — solve with a per-round 'zero' calibration tap so everyone's reference frame is the room, not gravity absolute; (2) jitter — apply a short low-pass filter so the cloud doesn't shimmer and the win doesn't trigger on a lucky frame.

## v1 scope
- 3 players, one round, one target-agnostic Schelling tilt.
- Pitch + roll only (2 axes), no yaw.
- Merged cloud + dead-zone ring on host; private bubble + haptic on phone.
- Single hard-coded tolerance and 3-second hold.

## Out of scope
- Scoring, multiple rounds, difficulty tiers.
- Yaw/compass, moving targets, teams.
- Spectator view, replays.

## Risks & unknowns
- iOS orientation-permission friction on first tap.
- Is a pure orientation Schelling point actually solvable, or does the room thrash? Dead-zone forcing may or may not create enough of a rallying point.
- Motion sickness / arm fatigue if rounds run long — keep them under 60s.

## Done means
Three phones on one LAN, each streaming tilt; the host cloud tightens as they align; when all three sit inside the tolerance cone outside the dead zone for 3s, the host fires the win chime — reproducibly, and it does NOT fire when all three lie flat.
