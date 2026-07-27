## Overview

A 3-player creep race for one living room. The host TV emits a steady ultrasonic carrier; each phone listens to that carrier with its own mic and measures the **Doppler shift caused by its holder walking**. Radial motion (toward/away from the screen) is measurable. Tangential motion (arcing, sidestepping) is invisible to physics. The game is built entirely on that asymmetry.

## Problem

Sensor party games measure the phone: shake it, tilt it, wave it. Almost nothing measures *the body carrying it moving through the room* — and the one sensor that can do it (the mic, listening above human hearing) is sitting unused in every pocket. There's also no good "stealth movement" party game that isn't just Red Light Green Light with a camera; the fun of stealth is a private risk budget, which needs a private screen per body.

## How it works

All three players start with their backs touching the far wall. 90-second round. Goal: be the body physically closest to the TV when the horn sounds.

The host tab plays a continuous ~19.2 kHz sine from the TV speakers. Each phone runs an FFT on its mic and compares energy in the sidebands just above vs. just below f0. Walking toward the source pushes energy into the upper sideband; retreating pushes it down. Magnitude of the asymmetry ≈ radial speed (v = c·Δf/f0; 0.5 m/s ≈ 28 Hz at 19.2 kHz).

**Private, on each phone:** a wake meter that charges only while you have positive (toward-TV) radial velocity, faster the faster you move — plus **your own bust threshold**, drawn per-player from a spread (roughly 40–100 units) and never shown to anyone else. Hit it and your phone flashes red, you're out, and the TV names you.

**Shared, on the TV:** a single anonymized "surf" bar — the sum of everyone's current radial motion. The room can tell that *somebody* is creeping right now. It cannot tell who, or who's close to blowing up. That's the whole pressure engine: the bar twitches, everyone assumes they're being out-crept, and someone overcommits.

Retreating is free but loses ground. Arcing sideways is free, period — so the room fills with people orbiting the TV, waiting.

Winner: closest non-busted body at the horn, judged by eye or a strip of floor tape. Deliberately, **no phone estimates position** — only speed.

## Technical approach

Host browser tab + phone PWAs + a PartyKit Durable Object as authority. Model: `Room {code, phase, carrierHz, players[{id, threshold, wake, busted}]}`. Phones send a 6 Hz `{radialV}` tick; the DO integrates wake server-side (so the client can't be trusted or throttled), broadcasts only the summed surf value, and unicasts each player their own wake. Bandwidth is nothing; latency tolerance is ~200ms.

The hard part is **not** sync — it's ultrasonic SNR. `getUserMedia` must be opened with `echoCancellation:false, noiseSuppression:false, autoGainControl:false`, or the browser's voice pipeline deletes the entire signal. FFT size 8192 @48kHz gives 5.9 Hz bins. Room multipath parks a huge static peak at f0; you read asymmetry in ±150 Hz shoulders around it, not the peak itself (the SoundWave technique). Startup runs a 17–21 kHz sweep, each phone reports per-bin SNR, and the host picks the carrier the *worst* phone hears best.

## v1 scope

- 3 players, one 90s round, one carrier
- Bust thresholds from a hardcoded table of 3 values
- Wake meter + bust; no scoring history, no lobby
- Winner judged by human eyeball, not by software
- Host tab prints measured SNR per phone as a debug line

## Out of scope

Position/distance estimation, multi-round, >3 players, hidden roles, phone-to-phone ranging, any use of the camera.

## Risks & unknowns

Cheap TV speakers may roll off hard before 19 kHz (fallback: 17.5 kHz, more audible). Some Android browsers ignore the AGC constraint. Ultrasonics annoy dogs and some teenagers — needs a warning screen. Three phones' mics have wildly different HF response, so wake rates must be normalized against each phone's own calibration SNR.

## Done means

Standing still for 20 seconds charges the meter less than 5%; ambling toward the TV charges it visibly within 3 seconds; sidestepping at the same pace charges it roughly as little as standing still; and in one live playtest a player busts before the horn without anyone else having predicted it.
