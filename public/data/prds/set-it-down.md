## Overview

Set It Down is a 3–4 player hidden-goal game where the room's furniture is the network topology. Each phone transmits a private rhythm through its vibration motor and listens with its accelerometer. Two phones resting on the same physical surface — the same coffee table, the same couch cushion, the same stack of books — hear each other clearly through structure-borne vibration. Phones on different surfaces are nearly deaf to one another. Everyone has a secret goal about who they want to end up coupled to, and nobody has names, only rhythms.

## Problem

Proximity games measure distance through air and end up as "stand near the person you like," which everybody can just watch. Structure-borne coupling is *discrete and non-obvious*: a phone 15cm away on the arm of the couch is invisible, while one 2 meters away on the far end of the same table is loud. The room stops being a continuum and becomes a graph — and that graph is not the one your eyes report.

## How it works

1. **Lobby.** Host TV names three legal surfaces spoken aloud by the host: the coffee table, the dining table, the floor. Players are free to move between them all round.
2. **Private deal.** Each phone shows, only to its owner: its own assigned rhythm (e.g. three long buzzes), plus one goal card. Goals differ: *"End coupled to the ♩♩·♩ phone"*, *"End coupled to nobody"*, *"End coupled to the ♩·♩♩ phone"*. Rhythm labels are permuted per phone, so shouting "who's rhythm two?" is meaningless.
3. **Round.** 90 seconds. Phones transmit in a 4-slot TDMA cycle (250ms of buzz pattern each, 1s frame) and listen in the other three slots. Each phone privately displays three live bars — coupling strength to each of the other rhythms — and nothing else. Players slide phones around, set them down, pick them up, lay them on a book to decouple, gang up on one table to jam the readings.
4. **Host TV** shows only a single aggregate "room coupling" needle — enough to build tension, useless for identifying anyone.
5. **Settle.** On the buzzer, phones must be untouched for 3 seconds. Server snapshots the final coupling matrix, clusters it into surfaces, reveals the true graph on the TV, and scores each secret goal.

The social texture is that goals conflict: A wants B, B wants solitude, C wants B too. B's only move is physical — find a surface nobody else has thought of.

## Technical approach

**Server:** PartyKit / Durable Object room, authoritative on slot scheduling and scoring. Socket.IO over Tailscale Serve for homelab.

**Data model:**
- `Room { code, phase, frameIndex, slotAssignment: playerId[4], goals: Goal[] }`
- `Player { id, rhythmId, labelPermutation, goal, lastMotionEnergy }`
- `Reading { fromPlayer, heardPlayer, rms, frameIndex }` — server accumulates a 4×4 matrix of medians over the last 10 frames.

**Sync:** server broadcasts `frameStart` with a monotonic frame index; each phone computes its own slot offset. Transmit = `navigator.vibrate([180,120,180])`. Receive = `devicemotion` at ~60Hz, band-limited by taking the RMS of `accelerationIncludingGravity` minus a 1s running mean, then integrating energy inside the three foreign slots. Clock alignment only needs ~±60ms (slots are 250ms wide), so WS round-trip offset estimation is plenty — no sub-ms sync required, unlike acoustic multilateration.

**The genuinely hard part is honest, not clever:** `navigator.vibrate()` does not exist on iOS Safari. v1 is **Android transmitters only**; iPhones can join as receive-only listeners and still play (their goal becomes "be heard by X", inverted), and the lobby detects and labels this. Second hard part: a phone held in a hand couples to nothing and reads as isolated, which is a legitimate strategy but also an accidental cheat — hence the 3-second untouched settle, enforced by a motion-variance gate.

## v1 scope

- 3 players, at least two on Android. One 90-second round.
- Three surfaces, named verbally by the host. No surface detection, no map.
- Two goal types only: *couple to rhythm X* / *couple to nobody*.
- Coupling threshold is a single hand-tuned constant. Reveal is a static graph image on the TV; scoring is printed as text.
- No lobby art, no sound, no rematch.

## Out of scope

More than one round, iOS transmit (until a Web Vibration polyfill or wrapper exists), automatic surface identification, jamming mechanics as an explicit rule, chained/relay coupling across touching furniture, scoring history.

## Risks & unknowns

- Coupling may be too binary (perfect or zero) and kill the deduction, or too leaky on a hollow IKEA tabletop and couple everything. Needs a real playtest to know which failure mode is real.
- Android throttles `devicemotion` in background tabs; the PWA must stay foregrounded with Wake Lock.
- A phone's own vibration will pin its own accelerometer — must be muted during its own slot.
- Airborne buzz sound may leak the answer faster than the sensor does. If so, the round runs with music playing.

## Done means

Three phones on two real surfaces: moving one phone from the coffee table to the floor drops its coupling bars to the other two by at least 10dB within 3 seconds, visibly and repeatably. One full round completes and the TV's revealed surface graph matches where the phones physically were, judged by eye.
