## Overview
Aperture is a 3–4 player cooperative light-occlusion puzzle. The host TV becomes the room's only lamp (lights off); each phone's camera is a private light meter. Players must arrange their bodies so that every phone simultaneously hits its secret lit-or-shadowed target.

## Problem
'Room as board' games almost always reduce to distance — walk closer, walk farther. Nobody plays with the fact that human bodies block light and throw shadows onto each other. Aperture makes that occlusion the entire puzzle.

## How it works
Lights off. The host TV displays a large, steady white field — the key light. Each phone privately shows two things: (a) a live luminance bar from its rear camera, and (b) a secret target — either BASK (stay bright, in the TV's light) or HIDE (stay in shadow). Roughly half the players get each. Players hold their phones facing outward and physically position themselves in the room — but standing in the light means your body casts a shadow on whoever is behind you. A HIDE player can use someone else's body as cover; two BASK players fight over the bright front row. The puzzle: shuffle front/back, crouch, or step aside until every phone reads inside its target band for 3 continuous seconds. The host TV shows only N anonymized lock lights (grey→green) — never who is who or what their targets are — so the room must talk it out: 'who's still dark? move left.'
Private per phone: your own luminance reading and your own secret target. One phone passed around can't read four positions at once, and exposing the targets would kill the puzzle.

## Technical approach
Host tab + phone PWAs + authoritative WS (PartyKit/DO or Socket.IO over Tailscale Serve). Camera via getUserMedia{video:{facingMode:'environment'}}; sample a downscaled frame's mean luminance (0.2126R+0.7152G+0.0722B) at ~10Hz on-device. Data model: Room{phase}; Player{id, target:'bask'|'hide', lum, inBand, lockedSince}. The phone computes luminance and inBand locally and sends {inBand} at ~5Hz; the server tracks all-locked-for-3s → win and broadcasts anonymized lock states to the host. Sync strategy: luminance stays on-device (privacy + latency); the server only aggregates locks. Hard part: per-camera auto-exposure fights the measurement (phones auto-adjust gain), so lock exposure where supported, otherwise run a start-of-round calibration — 'point at the TV' then 'point at the floor' — to set each phone's personal bright/dark thresholds.

## v1 scope
- 3–4 players, one round.
- TV shows a static white field + N lock dots.
- Each phone: luminance bar + BASK/HIDE target + calibration step.
- Win = all phones in-band for 3s simultaneously.

## Out of scope
- Torch/flashlight control; colored-light targets; multiple light sources; scoring or multiple rounds.

## Risks & unknowns
- Camera auto-exposure defeating absolute luminance; calibration is essential.
- Whether a TV is a strong enough key light in a semi-dark room.
- Front vs rear camera; people accidentally covering the lens.

## Done means
With the lights off and the TV white, four phones calibrate, players shuffle into a front/back arrangement, and when every phone reads inside its secret band for 3 seconds the host shows four greens and a win — reproducibly, with at least one solution that forces someone to crouch or duck behind another player.
