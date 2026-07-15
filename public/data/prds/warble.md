## Overview
Warble is a 2–3 player cooperative controller for a party crowd where the ONLY input is your voice pitch. The host screen shows a single dot that must be flown through a slow, winding tunnel to an exit. No touch controls steer the dot — you steer it by humming, and the group has to vocalize together, continuously, in real time.

## Problem
Most "voice" party games use voice as chat: you talk, then you tap. Warble makes the voice itself the joystick. The itch it scratches is the helpless, hilarious flailing of Spaceteam, but where the controller is your larynx and you literally cannot stop making noise.

## How it works
Each phone runs live pitch detection on that player's own mic. Each phone is PRIVATELY assigned exactly one control axis: Player A's pitch drives the dot's vertical position (low hum = down, high hum = up); Player B's pitch drives horizontal (low = left, high = right); a third player, if present, drives "thrust" (louder/higher = faster). Crucially, no phone is told the others' mappings — your phone shows only YOUR axis as a vague meter ("↕ YOU CONTROL UP/DOWN"), and even that is deliberately terse.

The host screen shows only the shared world: the dot, the tunnel walls, the exit. Because each axis lives on a different phone and must be driven simultaneously and continuously, the room is forced to negotiate out loud in real time — "I've got up-down, YOU take left-right, go higher NOW, too much!" — while everyone is also humming. Hitting a wall nudges the dot back and flashes red; three hits resets the run.

## Technical approach
Host browser tab + phone PWA clients + an authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Each phone does on-device pitch detection (Web Audio `AnalyserNode` + an autocorrelation/YIN estimator) at ~30 Hz, normalizes to a per-player calibrated pitch range (a 3-second "hum low… hum high" calibration on join), and streams a single float per tick. Data model: `Player{axis, pitchLo, pitchHi, latestValue}`; `World{dotX, dotY, vel, hits}`. The server integrates all axis inputs into dot motion on a fixed ~30 Hz tick and broadcasts `World` to the host. The genuinely hard part is latency + jitter: pitch is noisy and phones lag differently, so the server must smooth (exponential moving average) and the client must predict, or steering feels like driving on ice. Per-player calibration is essential so a deep voice and a high voice both get full range.

## v1 scope
- 2 players, one short S-curve tunnel, one exit.
- Two axes only (vertical, horizontal); no thrust.
- One difficulty, ~45-second target run.
- Reset-on-3-hits; win screen on exit.

## Out of scope
- Thrust/3rd axis, multiple levels, scoring/leaderboards.
- Chords, lyrics, or any pitch-accuracy grading beyond position mapping.
- Spectator mode, reconnection polish.

## Risks & unknowns
- Pitch detection robustness in a loud, laughing room (crosstalk between mics).
- Whether the axis-hiding is fun-confusing or just frustrating — may need to reveal axes after first crash.
- Motion tuning: too twitchy or too sluggish both kill it.

## Done means
Two phones join, calibrate, and one continuous co-hummed run moves the dot from start to exit on the host screen, with each player's pitch demonstrably controlling exactly one axis and a wall-hit visibly nudging it back.
