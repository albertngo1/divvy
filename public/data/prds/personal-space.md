## Overview

Personal Space turns a standing-around-the-living-room party into a silent predator cycle. Each phone continuously emits its own inaudible carrier tone and simultaneously listens for everyone else's. Your phone privately tells you two things and nothing else: how close you are to your secret mark, and how close *somebody* is to you. You never learn who's hunting you. Play is entirely physical — sidling, drifting, turning your shoulder — while the conversation in the room continues normally.

For 4 people at a party who want a game that hides inside the party.

## Problem

"Get near a person" games (Assassin, Wink Murder) need an honor system or a physical tag. Phones can actually measure proximity acoustically, and near-ultrasound is a completely unused channel — inaudible to humans, blocked by bodies, and short-range enough that walking across the room genuinely changes the reading.

## How it works

**Assign (silent).** The server builds a random cycle A→B→C→D→A. Each phone privately shows one target's name **once, for three seconds**, then never again. Nobody is told who hunts them.

**Emit + listen.** Each phone is assigned a unique carrier: 18.2, 18.6, 19.0, 19.4 kHz. It plays its own sine continuously and FFTs the mic for the other three bins.

**Private phone UI (the whole game):**
- **MARK** — a three-band warm/warmer/HOT bar driven by your target's carrier energy
- **TAIL** — a matching bar showing the *strongest non-target* carrier, unlabeled
- A lock timer that fills only while MARK is HOT

**Shared host screen:** a neutral ring of four anonymous glow dots, each brightening with that player's lock progress, plus a 90-second countdown. The room can see somebody is nearly there. Nobody can see who, or who's chasing whom.

**Win:** hold MARK HOT for 5 continuous seconds while TAIL stays out of HOT. Rules: phones held screen-toward-you at chest height, no naming, no showing your screen. Bodies occlude ultrasound, so turning away from your hunter also kills your own hunt — the squeeze is real.

## Technical approach

Host tab + phone PWAs + PartyKit Durable Object. `Player{id, carrierHz, targetId}`, `Sample{playerId, energies:{hz:dB}, t}`, `Lock{playerId, msHot}`. Phones stream a smoothed energy vector at 10Hz; the server owns the lock timer so no client can fake a win. Latency tolerance is generous (~200ms) — this is not a TDOA problem.

The genuinely hard part is **the audio chain, not the sync**. `getUserMedia` must be opened with `echoCancellation:false, noiseSuppression:false, autoGainControl:false` — every one of those defaults destroys the band. Speaker response above 18kHz varies by 20+ dB across devices, so a calibration handshake is mandatory: phones emit one at a time, all held together at arm's length, establishing a per-device gain offset. Your own carrier saturates your own mic and must be bin-notched.

## v1 scope

- Exactly 4 players, one 90-second round, one cycle, first lock wins
- 3-band bars only — no numbers, no distances
- 20-second huddle calibration before the round
- Host screen: four anonymous dots + countdown + winner reveal
- Chrome Android first; iOS Safari best-effort

## Out of scope

- More than 4 players (bin crowding), multiple rounds, scoring history
- Any map, position estimate, or trilateration
- Audible-band fallback (see risks)

## Risks & unknowns

- **This may simply not work on some phones.** Cheap speakers roll off hard at 18kHz. Mitigation held in reserve: 4–8 kHz chirps in 200ms rotating slots, audible but tolerable.
- Some people and most dogs hear 18kHz
- Reflective rooms flatten the distance gradient; soft rooms may be too steep
- 4 continuous carriers may intermodulate into audible artifacts

## Done means

Four calibrated phones in one room. Walking from 3m to 0.5m from a specific player reliably drives that player's MARK band from cold to HOT within 2 seconds and back, on at least 3 of 4 devices; one full 90-second round ends with a server-verified 5-second lock and a winner shown on the host screen, without anyone having spoken about their target.
