## Overview

Shim Stock is a 3-player cooperative sensor game for a living room with furniture in it. Each phone is dealt a private **spec card** describing how it must come to rest — a pitch band, a roll band, face-up or face-down, and a maximum vibration. Players scatter, hunt the actual room for a surface that satisfies their spec, place the phone, and commit. All three must be simultaneously in-spec for 5 seconds. The title is the instruction: when no surface in the room is at 9°, you shim one with a paperback.

## Problem

Sensor party games usually treat the room as empty space to walk around in. The furniture — the sofa arm, the sloped remote, the stack of coasters, the slightly-warped IKEA shelf — is inert scenery. Nobody has made the room's *geometry* the puzzle, and nobody has made handing over your private screen the cost of solving it.

## How it works

**Private (each phone), before commit:** a spec card. `pitch 6–12°, roll ±3°, screen up, jitter < 0.02g`. A live readout of the phone's current pitch/roll/jitter, updating as you tilt it against candidate surfaces. Nobody else ever sees your numbers.

**Private, after commit:** nothing. The screen becomes one full-bleed color — green (in spec), amber (within 2° of it), red (out) — readable from across the room. Your spec is gone. If you didn't memorize it, you're guessing.

One of the three cards is a **coupling card**: *"your pitch must be within 2° of another phone's pitch."* It cannot be solved alone, and it cannot be solved after commit, so that player has to shout their number and get a stranger's number back before either of them lets go.

**Host screen:** three anonymous slot bars filling toward lock, a shared 5-second countdown once all three are green, and — when the countdown breaks — *which slot* dropped but never why. The group has to interrogate.

A footstep on a suspended floor jitters a phone off a coffee table. So the last player to commit has to walk back very slowly, and everyone knows it.

## Technical approach

Host browser tab + phone PWAs + one authoritative room object (PartyKit / Durable Object) over Tailscale Serve.

Each phone reads `devicemotion` at 60Hz locally. Pitch/roll come from a low-passed gravity vector (α = 0.9); jitter is the RMS of the high-passed acceleration magnitude over a 500ms window. Phones evaluate their own spec locally and emit `{slot, pitch, roll, jitter, inSpec}` at 5Hz — the server never sees raw sensor streams.

Data model: `Room { phase, slots: [{id, spec, inSpec, sinceTs, committed}], lockStartedAt, deadline }`. The server owns lock state: when all slots report `inSpec`, it stamps `lockStartedAt` and broadcasts a countdown; any slot reporting out-of-spec for >200ms clears it.

The hard part is the debounce. Accelerometer noise floors differ wildly by device, so a 10-second calibration ('everyone put your phone flat on the floor') establishes per-device jitter baselines, and specs are expressed as multiples of that baseline rather than absolute g. Too tight and the game resets forever on someone breathing; too loose and a phone in a hand passes.

## v1 scope

- 3 players, one round, one 3-minute timer
- 3 hardcoded spec cards, one of which is the coupling card
- 5-second simultaneous hold to win
- Host screen: 3 bars, a countdown, a win/lose card
- Room code join, no accounts, no scoring across rounds

## Out of scope

Multiple rounds, difficulty tiers, per-player scoring, spec-card generation, spectator view, sound design beyond a lock chime, any handling of rooms with no slanted surfaces.

## Risks & unknowns

iOS requires `DeviceMotionEvent.requestPermission()` from a user gesture over HTTPS — a hard gate on the join flow. A fully carpeted room with a glass table may have no usable slopes; mitigation is that shimming with books is legal and encouraged. The coupling card may just be confusing rather than fun. Footstep resets could tip from tense to maddening.

## Done means

Three phones join by room code, get distinct specs, are placed on three different real pieces of furniture — at least one propped on a book — all read green, the shared 5-second countdown completes, and the host shows a win screen. And in a live playtest, at least one player shouts a pitch number across the room to solve the coupling card.
