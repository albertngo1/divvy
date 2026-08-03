## Overview

A 3-4 player co-op for a furnished living room. Each phone becomes a private spirit level with a secret target angle. To win, every phone must be resting *unattended* at its own angle on some real object in the room while every player stands back at the TV with a hand on it. It is a party game about abandoning your phone at precisely 25 degrees on top of a stack of coasters.

## Problem

Sensor party games nearly all end the same way: you wave the phone and the room is wallpaper. The phone never leaves your hand, so the physical space contributes nothing but floor area. Meanwhile most co-op party games collapse into one loud person issuing instructions. The itch: make the room's actual junk — the sofa arm, the windowsill, a hardback, a sneaker — the literal board, and make *letting go of the phone* the move.

## How it works

1. **Zero:** lay the phone flat on the floor, tap Zero. Phone captures a 3s noise floor at rest.
2. **Private card:** each phone shows only its own target repose angle band (12/18/25/34 degrees, +/-3, direction-agnostic), a live bubble, and one lamp: HELD / SETTLED / DISTURBED. Nobody sees anyone else's target. At least one target is not findable on flat furniture — that player must *build* a wedge, competing for the same books and coasters as everyone else.
3. **Place:** scatter, find or build a slope, set the phone down, hands off. A held phone's accel RMS is roughly 10x a resting one, so the phone knows you cheated.
4. **Return:** once SETTLED and in-band, walk back and put a hand on the host screen's tap-in slot. All four slots filled + all four SETTLED simultaneously for 3s = win.
5. **The trap:** walking is floor vibration is knocked props. The host TV shows four anonymous lamps only — you can see that *something* fell, never whose, so someone has to guess and sprint.

**Host screen:** four anonymous lamps, a 60s timer, four tap-in slots. **Phone:** your angle, your bubble, your target. Nothing else.

## Technical approach

PartyKit Durable Object as the authoritative room. Model: `Room {code, phase, deadline}`, `Player {id, targetDeg, tolDeg, tiltDeg, resting, inBand, atHost}`. Phone PWA derives tilt from `devicemotion.accelerationIncludingGravity` (angle between gravity vector and device z-axis) rather than `deviceorientation` Euler angles — no compass, no yaw drift, no calibration decay. Resting classifier: 500ms sliding-window accel RMS with gravity removed. Phones push 10Hz state; server latches `inBand` only after an 800ms hold and broadcasts an anonymized lamp vector to the host at 10Hz. Host is a dumb renderer.

The genuinely hard part is the held-vs-resting classifier: thresholds vary wildly by device, and carpet damps floor coupling an order of magnitude more than hardwood. Fix: per-device noise floor captured on the *actual target surface* during Zero, then held-threshold = 6x that floor, disturbed-threshold = 3x. Second hard part is iOS's user-gesture permission gate for motion events — it must be requested inside the Zero tap handler or the whole game silently reads zeros.

## v1 scope

- 4 players, one 60s round, win or lose, no score
- Fixed target angles 12/18/25/34 degrees
- Host: four lamps, timer, four tap-in slots
- Room-code join, no accounts, no reconnect logic

## Out of scope

Multi-round play, scoring or leaderboards, constraining tilt *direction* as well as magnitude, audio, spectator view, animation polish, difficulty tuning.

## Risks & unknowns

Carpeted rooms may kill the footstep-disturbance loop entirely (needs a hardwood playtest before it's real). iOS permission friction costs a whole onboarding screen. Players will try to prop phones against walls — vertical resting still satisfies the math, so either accept it or reject tilt > 80 degrees. Real risk: people will drop phones on hard floors; the UI should say "soft landings only" and mean it.

## Done means

Four real phones in one living room: all four SETTLED in-band unattended, all four hands on the TV, host flashes WIN. And a deliberate stomp near one prop flips exactly that lamp red on the host within 500ms.
