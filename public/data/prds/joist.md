## Overview

Joist is a 4-player deduction game where the board is the actual furniture in your living room. Every player places their phone flat on a surface of their choosing — coffee table, kitchen counter, bookshelf, arm of the couch, bare floor — and the phones become a distributed structure-borne vibration network. Knock on a table and the phones *on that table* feel it hard; phones elsewhere feel almost nothing. The group's job is to reconstruct the room's coupling graph from four private, partial, contradictory views.

For people who like Wavelength-style argue-about-a-number play, but want the argument to be about physical reality rather than opinion.

## Problem

Room-scale party games almost always simulate the room (grids, sectors, headings). The room's *material* structure — which things are physically joined — is invisible, real, and completely unexploited. Meanwhile phone accelerometers are used for shake-detection and nothing else.

## How it works

**Setup (60s).** Each phone shows privately: "PUT ME DOWN ON A HARD SURFACE. Do not hold me." Players scatter and place phones. Two players may choose the same surface — that is the point, and nobody announces it. Each phone samples its own idle noise floor for 5 seconds.

**Volley (40s).** The server runs four staggered 2-second knock slots in random order. Only the current knocker's phone shows the private cue **KNOCK ×3 NOW**; every other phone shows an anonymous listening bar. Each phone reports its peak accelerometer magnitude inside every slot window.

**Private readout.** Each phone shows *only its own row* of the coupling matrix: for each of the other three players, FELT IT / FAINT / NOTHING. Your row alone gives you a partial partition — you know who's with you, but not how the other two relate, and the floor couples everything weakly enough that FAINT is genuinely arguable.

**Talk, then commit.** Players argue out loud, then each privately submits a full grouping of all four phones into surfaces. The host TV — which has shown nothing but anonymous listening bars all game — reveals the true partition and who nailed it.

## Technical approach

Host browser tab + phone PWAs + PartyKit Durable Object as authority. Data model: `Room{phase, slots[]}`, `Player{id, name, noiseFloor, placed}`, `Reading{playerId, slotIdx, peakZ}`, `Guess{playerId, partition}`.

Phones sample `devicemotion` (iOS caps ~60Hz; a knock rings for 50–100ms so it survives), compute per-slot peak of `|a| - g`, and report a **z-score against their own noise floor**, never a raw magnitude. Slot windows are 2s wide, so clock sync only needs ~±100ms — WS ping/pong offset estimation is plenty.

The genuinely hard part is **cross-device amplitude calibration**: a Pixel on granite and an iPhone in a case on the same granite report wildly different g. Fix: normalize each phone against its own noise floor *and* its own max reading across the volley, then threshold on rank, not absolute value. Second hard part: rejecting a person walking past (low-frequency, long) versus a knock (sharp impulse) via a simple rise-time gate.

## v1 scope

- 4 players, exactly one volley of four knock slots, one round
- Three-band private readout: FELT / FAINT / NOTHING
- One private partition guess per player, scored all-or-nothing
- Host screen: listening bars during play, true partition at reveal
- Chrome Android + iOS Safari with `requestPermission()` gesture

## Out of scope

- Moving phones mid-game; multiple volleys; a traitor role
- Absolute distance or surface-material inference
- More than 4 players; persistent scoring; sound-based fallback

## Risks & unknowns

- Carpeted floors may couple *nothing*, making every row read NOTHING and the round degenerate
- Concrete slab floors may couple *everything*, the opposite failure
- iOS 60Hz sampling could clip a very sharp knock on stone
- Phone cases dampen unpredictably

## Done means

Four phones on three surfaces (two sharing one table). After one volley, at least three of the four private rows correctly report FELT for a genuine tablemate and NOTHING for a player on a different surface, and the host reveals a partition that at least one player guessed exactly — with the whole group having argued about a FAINT.
