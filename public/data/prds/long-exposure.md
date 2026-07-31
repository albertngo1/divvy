## Overview
Long Exposure is a lights-off party game for 3-4 people in one room whose entire output is a single photograph. The host laptop's webcam holds one synthetic long exposure of a dark room; each player's phone screen is a colored light brush. Everyone paints simultaneously from a private score only they can read, and nobody — including the host — sees the image until the shutter closes. There is no winner. There is a PNG.

## Problem
Party games manufacture a scoreboard and then evaporate; nothing survives the evening. Meanwhile every "phone as controller" game treats the phone as a keypad, ignoring that it is a bright, physically-held object being waved around a room. A light painting is the rare group artifact that genuinely cannot be made alone — it needs several hands, several colors, and one shutter.

## How it works
Host tab opens the webcam, locks exposure/white balance/focus, kills the room lights (a prompt: "someone hit the switch"), and counts down. From SHUTTER_OPEN it max-blends every incoming video frame into a canvas accumulator — any pixel that was ever bright stays bright. The host screen shows only a black field and a countdown ring; the accumulating image is hidden.

Each phone privately shows three things nobody else can see: its assigned hue (magenta / cyan / amber), a stroke card ("a slow spiral, low, on the left"), and a moving timing bar marking its personal lit window. Inside your window the phone goes full-screen solid hue at max brightness; outside it, black. Windows partially overlap so trails cross, and each card claims a different region — so the composition only works if you trust the strokes you can't see to leave room for yours.

The shutter closes when the last phone goes dark. Lingering past your window makes your own trail the brightest thing in the frame while holding everyone else in the dark — a small, delicious selfishness.

## Technical approach
One PartyKit/Durable Object room is authoritative. State: `Room {phase, t0, players[{id, hue, window:[a,b], cardId, lit}]}`. Clock sync: each phone runs five ping round-trips and takes the min-RTT offset, targeting ±50ms; the server broadcasts a future host-clock `t0` so each phone self-schedules with `setTimeout` plus rAF drift correction rather than reacting to a message. Phones request fullscreen + screen wake lock and render a CSS background color — no canvas needed client-side.

The hard parts are not throughput. (1) Auto-exposure will chase the phone lights and wash the frame; the host must `applyConstraints({exposureMode:'manual'})` and fall back to a manual gain slider that scales the accumulation. (2) Max-blending 30fps into an accumulator without dropped frames wants WebGL `blendEquation(MAX)`, not per-pixel JS.

## v1 scope
- 3 players, one 15-second exposure, one round, one room code.
- 3 fixed hues; 6 hand-written stroke cards.
- Host laptop webcam only; phone screens as the only light source.
- Reveal, then a QR to download the PNG.
- No accounts, no retakes, no persistence past the tab.

## Out of scope
Phone torch (iOS Safari can't), multi-exposure galleries, motion scoring, phone-as-host, printing/mailing, >5 players, any points.

## Risks & unknowns
The room must be genuinely dark. A 60° webcam FOV may not contain everyone. iOS dims the screen in Low Power Mode and brightness can't be raised programmatically. Biggest unknown: is the result pretty, or brown mush? Only playtesting says.

## Done means
Three phones and one laptop in a dark room produce one PNG in which three distinctly colored trails are visible, each phone lit only inside its window (±100ms, verifiable from frame timestamps), no player saw the image before reveal, and someone downloads it by scanning the QR.
