## Overview
Flinch is a 3-6 player, co-located party game for people who love the chaos of Red-Light-Green-Light but hate arguing about who moved. The host TV is the referee wall; every player's phone is a private, incorruptible accelerometer that snitches on the smallest flinch. The room's length is the board — you physically walk across it.

## Problem
Classic RLGL needs a human "It" who faces away, misses half the cheaters, and starts fights over disputed calls. Meanwhile every phone has a 30-60Hz accelerometer nobody plays with that can detect sub-visible motion a human eye would never catch. The itch: a purely physical, move-your-whole-body party game with a perfectly impartial, per-player referee — and the delicious tension of a sensor that busts you for a twitch you can't feel.

## How it works
The host TV cycles RED and GREEN with a big color, sound, and countdown. Players line up at the back wall. On GREEN everyone physically walks toward the TV; each phone counts step-peaks and advances that player's progress. On RED everyone must FREEZE — and here the private state is load-bearing: each phone independently watches its own accelerometer magnitude, and if it crosses that phone's calibrated threshold, it buzzes and busts YOU (progress penalty) while nobody else sees who twitched. Your phone privately shows your distance, your live "stillness meter," and your remaining freeze budget. You cannot pool this onto one shared phone — every body needs its own sensor strapped to it. The host screen shows only anonymous progress bars until a dramatic end-of-round reveal of who flinched most. First player to the target progress reaches the TV and wins.

## Technical approach
Host browser tab + phone PWA clients + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{phase: RED|GREEN, phaseStartTs, players[]}; Player{id, progress, freezeBudget, busted}. Sync: each phone reads DeviceMotion at 30-60Hz, computes a rolling accel magnitude; during GREEN it detects step peaks locally and increments progress (throttled to server); during RED, a magnitude spike raises a local bust event sent to the server. The server is authoritative on phase timing so the RED/GREEN clock is single-sourced and fair, broadcasting phase to all phones and progress to the host. The genuinely hard part: thresholds differ per phone and per person, so a "hold still 3s" baseline plus a "walk" sample calibrates each device; iOS Safari also gates DeviceMotion behind an explicit user gesture over HTTPS. Phase flips must feel instant — server-timestamped phases with light client lookahead.

## v1 scope
- 1 lane, 3-4 players, one round
- Fixed GREEN/RED cadence, no roles
- Step-count progress to a target of ~30; RED motion = lose 3
- Single calibration tap; buzz + penalty on bust
- First to target triggers win screen

## Out of scope
Real indoor positioning, obstacles/safe zones, hidden saboteur roles, multi-round tournaments, cosmetics, native apps.

## Risks & unknowns
DeviceMotion permission friction on iOS; threshold fairness (naturally jittery hands vs. steady); whether abstract step-progress feels as good as a literal footrace; players cheating by shaking during GREEN.

## Done means
Four phones calibrate, and across several GREEN/RED cycles the phones reliably advance walkers and bust anyone who moves during RED (buzz + progress loss) with no human referee, the first to target triggers a win screen — working first try in a normal living room.
