## Overview

A 3-player, lights-off living-room game where the host laptop's webcam is the only receiver in the room and every phone is a transmitter. Each phone privately holds a short codeword it must blink into the camera across a ticking grid of time slots. The camera can only resolve one bright source at a time — two simultaneous flashes blow out the auto-exposure and both signals are lost. For groups who like Spaceteam-adjacent physical chaos but want the failure to be *physically real* rather than a rule on a screen.

## Problem

Most "don't collide" party games declare collisions by fiat: the server compares two integers and prints COLLISION. Nobody feels it. Bloom makes the collision a physical event everyone in the room sees at the same instant — the TV image goes pure white, two people wince, and the ledger writes itself.

## How it works

Setup: room lights low, laptop facing the couch. Calibration: each player flashes alone for 2s; the host locates their bright blob and locks a seat region for that player.

A round is 8 slots of 700ms, with a big visible metronome on the host screen. Talking is banned once the metronome starts.

**Phone (private):** your 2-symbol codeword (▮ / ▯), the 8-slot strip, and tap-to-arm on any two slots. During the round the phone auto-fires — full-white screen at max brightness — in exactly your armed slots. You can re-arm an un-fired slot mid-round. You never see anyone else's arming.

**Host TV (shared):** the live camera feed rendered as a dark sensor view with the three seat regions outlined, the slot metronome, and a decode strip that fills in as slots resolve. One region blooms in a slot → symbol decoded, credited. Two or more bloom → frame blows out, slot marked CORRUPT, both players lose that symbol and take a strike. Room wins if all three codewords fully decode within 8 slots.

## Technical approach

PartyKit Durable Object per room. Host tab = display client with `getUserMedia`; phones = PWA clients (full-white screen; torch via `ImageCapture.applyConstraints` is a stretch goal, Android-only).

Model: `Room{slotIndex, slots[8]{firedRegions[], verdict}}`, `Player{id, region{x,y,w,h}, codeword[2], armed:Set<slot>, decoded[]}`.

Sync: the server owns the slot clock and broadcasts `slot_tick(n, serverTime)`. Phones pre-arm, so no round-trip happens during a flash — each phone fires on its own drift-corrected clock (5-sample NTP-style offset at join). The host is the sensor of record: it samples per-region mean luma each frame and posts a verdict; the server never trusts a phone's "I fired" claim.

Hard part is exposure. Webcams auto-expose and auto-white-balance, so one torch darkens every other region. Pin `exposureMode:'manual'` where supported; otherwise take a 2s per-region baseline and use delta-luma against an adaptive floor. 700ms slots give ~20 frames at 30fps, plenty. Must distinguish "two players fired" (two regions spike, global luma saturates) from "someone turned the lights on" (all regions rise, no bloom) — a global-rise guard aborts the round rather than scoring it.

## v1 scope

- 3 players, exactly one 8-slot round
- 2 symbols per player, white-screen flash only (no torch API)
- Fixed seats, one calibration pass, no re-seating
- Host shows a post-round ledger: who blew whose signal

## Out of scope

- Torch API, multi-round campaigns, scoring across rounds
- Any signalling richer than one-bit-per-slot
- Mobile hosts, well-lit rooms, more than 3 seat regions

## Risks & unknowns

- Ambient light / TV glow may swamp phone brightness; may need a truly dark room
- Region separation fails if two players sit shoulder-to-shoulder
- Rolling shutter and 30fps jitter at slot boundaries

## Done means

In a dim room with 3 phones: calibration assigns 3 non-overlapping regions; a solo flash decodes correctly ≥9/10 times; a deliberate double-flash is marked CORRUPT ≥9/10 times; a full round completes end-to-end and the host renders a per-slot ledger naming the colliders.
