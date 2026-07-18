## Overview
Tremor is a 3–4 player cooperative deduction game for a TV + phone controllers. Phones become a distributed array of vibration seismographs laid flat on a shared table; the table surface is literally the game board. It's for groups who like a tactile, talk-it-out puzzle with a physical prop.

## Problem
The accelerometer is used for shakes and tilts, never for what it's quietly great at: sensing tiny impulse vibrations traveling through a surface. And most "sensor + room" games make one player act while others watch. Tremor makes every phone a genuinely different sensor node — the fun is that no single phone knows the answer, and you must fuse readings socially.

## How it works
Players place their phones flat on a table at spread positions (ideally corners). A quick setup pins each phone to a labeled spot on the host's grid. The host TV shows a top-down grid of the table with the phone positions marked.

Each round the host names a secret "Tapper." That player knocks the table ONCE with a knuckle at a spot only they know. The impulse radiates through the wood; nearer phones feel a bigger jolt than farther ones (amplitude falls off with distance). Each phone PRIVATELY shows only its OWN peak jolt strength as a single filling bar — "you felt a 7" — and nothing about anyone else's reading or the true location.

Players then talk: "I got a strong hit, Sam barely felt it." Together they drag ONE shared marker on the host grid to guess the knock's location. The host reveals the true spot; score = inverse of distance error. The private per-phone reading is load-bearing — a single passed-around phone can only ever be in one place, so it can never produce the triangulation that four simultaneous nodes do.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve, or PartyKit). Phones sample `devicemotion` acceleration at max rate (~60Hz), high-pass filter out gravity/handling, and detect the impulse peak within a short listening window opened by the server on the Tapper's "ready." Each phone reports `{peakMag, peakTs}`. Data model: `nodes[]{spot, peakMag}`, `round{tapperId, trueXY, guessXY}`. The genuinely hard part: amplitude is noisy and device-dependent, so v1 uses a per-phone self-calibration knock at setup to normalize each node's scale, and relies on amplitude (not time-of-arrival, which JS timers can't resolve at these speeds) as the distance proxy — robust to millisecond jitter.

## v1 scope
- 3 phones on one table, one round, one knock.
- 3x3 grid; single shared guess marker.
- Private jolt bar per phone; host reveals true spot + error.
- One calibration knock per phone at setup.

## Out of scope
- Time-of-arrival lateration; multiple simultaneous knocks.
- Hidden-role framing (Tapper lying about their reading).
- Cross-table/floor play; scoring across many rounds.

## Risks & unknowns
- Table material matters (glass/metal transmit poorly vs wood).
- Cheap phones may miss faint far-field impulses.
- Players lifting/nudging phones corrupts the baseline.

## Done means
Three phones on a wooden table each show a distinct private jolt reading after a single knock, players place one guess marker, and the host reveals the true spot with a scored error — demonstrated to reliably distinguish near vs far knocks on two phone models.
