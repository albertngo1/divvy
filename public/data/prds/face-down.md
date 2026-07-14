## Overview
Face Down is a concurrent-room party game where the controller *is* the physical object you converge on. Each phone reads its own orientation; the room must silently agree — through fidgeting alone — on one shared resting pose for all their phones. For 3–6 people, it turns the dinner-table gesture of laying a phone face-down into a wordless negotiation you feel in your hands.

## Problem
Synchrony games almost always converge on abstract state — a value, a color, a rhythm. Nobody has made the *physical pose of the device itself* the shared target. It's tactile, funny, and genuinely un-copyable across one screen: you can't pass a phone around to play a game about how every phone is being held at once.

## How it works
Host starts the round. There are six natural pose buckets, derived live from each phone's gravity vector: flat-face-up, flat-face-down, portrait-upright, landscape-left, landscape-right, tilted-in-hand. **Privately, each phone shows** only its own current bucket as a big icon and a soft "you're in: FACE DOWN" label, updating as you move it. You never see anyone else's bucket or even how many share yours.

**The host screen shows** only a single warm "Lock" gauge and an anonymized count of *how spread out* the room is (e.g. a bar that's full when everyone shares a bucket, empty when scattered) — never which player is in which pose. The gauge fills only while *all* phones occupy the same bucket; players feel it climb, sense they're close, and adjust. Hold unanimous for 3 continuous seconds to win. On win, the host reveals the winning pose with a satisfying thunk animation; on timeout, it reveals the final scatter.

Per-phone architecture is load-bearing twice over: each phone is simultaneously reading its own real-world orientation, and the fun is the blind convergence — if anyone could see the tally, they'd just conform to the plurality and it'd be trivial.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Each phone samples `DeviceOrientationEvent` / accelerometer gravity at ~10Hz, classifies locally into one of six buckets (simple thresholds on the gravity vector), and streams only `{bucket}` on change (not raw motion — cheap, private). Data model: `Room{phase, players[], lockStartServerMs}`; `Player{id, bucket}`. Server holds the authoritative tally, computes `allSame = new Set(buckets).size===1`, and runs the 3-second lock timer server-side to avoid per-phone clock disputes. The genuinely hard part: iOS requires a tap-gesture permission prompt for motion sensors (handle at join), plus debouncing bucket flapping at pose boundaries with a small hysteresis margin so a wobbling hand doesn't spam transitions.

## v1 scope
- 3 players, one round.
- Six hard-coded pose buckets via gravity thresholds.
- Host: one Lock gauge + spread bar; 3s unanimity to win.
- iOS motion-permission prompt on join; QR room code.

## Out of scope
- Sequences of poses, rounds, scoring history.
- Fine-grained angles or custom poses.
- Any per-player pose display on the host.

## Risks & unknowns
- Bucket boundaries (portrait vs tilted) may feel arbitrary — needs hysteresis tuning so "in your hand" is stable.
- Six buckets may make blind unanimity too hard for 5+ players; may need to shrink to four or add a faint "getting warmer" cue.
- iOS permission friction could kill onboarding.

## Done means
Three phones join, grant motion access, and physically posing all three the same way fills the host Lock gauge and triggers a win within 3s; scattering them empties it. Buckets classify correctly for all six poses and don't flap when a phone is held still.
