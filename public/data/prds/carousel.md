## Overview
Carousel is a 3–4 player cooperative game built entirely on the phone's gyroscope (DeviceMotion rotationRate), a sensor almost no web game touches. Players physically turn their bodies in place; the room becomes a floor of human spinning tops that must lock into one shared pace. It's for a giddy, slightly dizzy party crowd who want a whole-body silly-but-tense minute.

## Problem
Sensor party games overwhelmingly use compass *heading* or mic *level*. Rotation *rate* — how fast you're turning — is untouched, yet it's a rich, drift-free, whole-body input. And 'match a hidden group speed' is a convergence puzzle no one can shortcut by reading a number off a screen.

## How it works
Players spread out (arm's length — the room-as-board constraint: you must physically separate or you'll collide mid-spin). Each holds a phone flat on an open palm and, on 'GO', starts rotating their whole body in place.

The host TV shows a single carousel that only turns while **in gear** — it's in gear when every player's current spin rate sits inside a tolerance band of each other *and* above a minimum. The group must hold it in gear for 8 seconds to win.

Each phone PRIVATELY shows only a three-state needle relative to the *hidden group median*: FASTER, SLOWER, or HOLD. It never shows your actual rate, the target, or anyone else's rate. So the shared pace can only be discovered blind, by everyone nudging toward consensus at once. The anti-trivial twist: spin too fast for too long and your phone privately overheats and STALLS (grays out 2s), instantly kicking the group out of gear — so 'everyone go max' fails, and the emergent target is a moderate pace nobody was told.

Per-phone architecture is load-bearing: each phone senses one body's rotation; a single passed phone can't measure four spinners, and the private FASTER/SLOWER hint per body IS the game.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Each phone reads `DeviceMotionEvent.rotationRate.alpha` (yaw, deg/s), low-pass filters it, and streams |rate| at ~15Hz. Data model: `{ roomId, rates: {playerId: degPerSec}, inGear: bool, gearHeldMs, stalls: {playerId: expiry} }`. Server computes the running median, marks each player faster/slower/hold, evaluates the band + minimum, and accumulates in-gear time. Nice property: rotationRate is *relative*, so there's no compass zeroing or per-device heading drift. The genuinely hard part is normalizing sign/axis conventions (iOS vs Android differ) and smoothing noisy handheld rate without adding lag that breaks the convergence feel.

## v1 scope
- 3 players, one carousel, 8-second in-gear hold, one round
- Private FASTER/SLOWER/HOLD needle only
- Overspin stall + host in-gear meter

## Out of scope
- Direction (CW/CCW) matching, multiple carousels, scoring
- Accessibility alt-input for players who can't spin

## Risks & unknowns
- Motion sickness — cap round length hard
- Axis/sign normalization across devices
- Band tuning: too tight = unwinnable, too loose = trivial

## Done means
Three phones stream filtered yaw rate, the server's median-relative needles are correct, and a real 3-person group can reach and hold 'in gear' for 8s while a deliberate overspin visibly stalls a phone and drops the gear.
