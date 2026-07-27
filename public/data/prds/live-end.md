## Overview
Live End is a 3-player cooperative acoustic scavenger game for a TV and phones. Each phone measures how *live* (reflective) or *dead* (absorptive) its exact location is by chirping and listening to its own echo. Every player is privately assigned a different target liveness, so the group must scatter across the room's real materials and tune themselves into place. For people who like a physical scavenger hunt with a hidden layer.

## Problem
Mic-based party games only ever use loudness. The richest untapped signal in a phone is the *room's reply* — a tiled doorway and a coat closet are wildly different instruments, and everyone already knows it intuitively from singing in the shower. Nobody has made that difference into a board. Second itch: "go find a spot" games are almost always turn-based; making all measurements happen inside one five-second window forces simultaneous commitment.

## How it works
Each phone PRIVATELY shows one number: a target liveness on a 0–100 scale (e.g. 22, 55, 84). Nobody sees anyone else's target.

Players scatter and choose a physical spot and pose — phone under a cushion, held into a hanging coat, flat against a window, out at arm's length in the tiled doorway. The host TV runs a loud "QUIET — MEASURING" countdown, then hands each phone a 1-second slot. In your slot your phone plays a 400ms sine sweep (500Hz→4kHz) out its speaker and records its own mic; the phone computes a liveness score and sends three scalars — no audio leaves the device.

The TV shows a single big dial 0–100 with three ANONYMOUS needles landing. Your phone shows only your own target, your own reading, and hot/cold guidance ("you are 30 too dead"). One relocation pass follows, then a final measurement.

The collision rule is pure physics: a human body is a large absorber. If two players crowd the same good hard corner, they deaden each other's reading — so the anonymized dial tells you *someone* is wrong without telling you who, and you have to negotiate out loud.

## Technical approach
Host tab + phone PWAs + authoritative WS server. Capture with `getUserMedia({audio:{echoCancellation:false, autoGainControl:false, noiseSuppression:false}})` — non-negotiable, since AGC destroys a decay measurement. Sweep playback and capture via one `AudioContext`; liveness = `10*log10(E[60–350ms after sweep end] / E[0–40ms direct])`, mapped through a per-device offset captured in a one-time "hold it at arm's length in the middle of the room" reference pose.

Model: `players[]{id, target, calOffset, readings[]}`, `round{slotSchedule, pass}`. The genuinely hard part is **slot scheduling**: three phones must sweep inside one 5s window without overlapping or they contaminate each other, so the server assigns absolute slot times and each phone schedules playback on `AudioContext.currentTime` corrected by a WS ping/pong clock offset — needs ±30ms.

## v1 scope
- 3 players, one round, two measurement passes.
- Targets drawn from a fixed set {20, 50, 80}; tolerance ±12.
- TV = one dial, three needles, a countdown. Phone = target, reading, hot/cold.
- One reference-pose calibration per phone at join.

## Out of scope
Band-separated simultaneous sweeps, ultrasonic operation, competitive scoring, room mapping/visualization, more rounds, hidden roles.

## Risks & unknowns
- Phone speakers roll off hard below ~300Hz; usable band may be narrow.
- Some Android browsers ignore the AGC-off constraint outright.
- A real party is loud; the tail measurement may need the whole room to shut up, which is either the best beat of the game or the thing that kills it.
- Measurement variance may exceed ±12, making success feel random rather than earned.

## Done means
Three phones in three spots; sweeps fire in their assigned slots with no overlap; the same phone in the same spot repeats within ±6 across five trials; a coat closet reads at least 25 points deader than a tiled doorway on the same device; and the TV declares a win only when all three needles sit inside their private bands on the same pass.
