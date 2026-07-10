## Overview
Air Gap is a cooperative, touchless relay party game for 3–5 players seated in a ring. Every phone becomes a private hand-radar: it emits an inaudible ~19 kHz tone from its own speaker and listens for the reflection off your hovering palm. You pass a glowing 'pulse' around the ring by waving over your phone at exactly your cue — never touching the glass. It's for people who liked bucket-brigade party games but want something that feels like telekinesis.

## Problem
Phones are touch-slabs; nobody uses them as active proximity sensors. And most 'pass it around' party games are just tap-relays anyone could do with one shared phone. The itch: a relay where each station must independently *sense* a gesture, so the group's shared timing — not a single device — is the whole game.

## How it works
Players sit in a ring, phones flat on knees/table in front of them. The host TV shows a single bright pulse traveling the ring and a shared 'health' bar for the relay. Each phone PRIVATELY shows only: your seat's glow state (armed / catch-now / passed) and a tiny confidence meter of your own sonar. When the pulse reaches your seat, your screen flashes 'catch' for a ~700 ms window; you wave your hand once over the phone. Your phone detects the Doppler smear/amplitude spike in its own mic's 19 kHz bin and reports 'caught' to the server, which advances the pulse to the next seat. Miss the window (or wave early) and the relay loses health. Crucially, cues are staggered and private — you only know YOUR moment, so you can't just copy a neighbor; you have to feel the rhythm around the ring. If two adjacent players sit too close, their ultrasonic pings cross-talk and false-trigger, so the room forces you to physically spread out — the seating geometry is the board.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ ringOrder[], pulseIndex, health }`, `Player{ seatId, sonarConfidence, lastCatchTs }`. Each phone runs a WebAudio graph: OscillatorNode at 19 kHz → AnalyserNode FFT on getUserMedia mic; it watches the target bin for the amplitude/Doppler signature of a passing hand and emits a local `catch` event. Server owns pulseIndex and gates catches to the open window; it broadcasts only the pulse position + health. The genuinely hard part: reliable self-echo detection across cheap phone speakers/mics with wildly different frequency response and room reverb — needs per-phone calibration (a 2 s 'wave to arm' baseline) and an adaptive threshold, plus rejecting a neighbor's tone (assign each phone a slightly different carrier, e.g. 18.8/19.0/19.2 kHz).

## v1 scope
- 3 players, one ring, one pulse, one lap.
- Fixed carriers per seat; 2 s calibration wave on join.
- Host shows pulse + a 3-hit health bar; game ends when the lap completes or health hits zero.
- No scoring beyond 'lap completed y/n'.

## Out of scope
- More than one pulse, reverse direction, speed ramps.
- Cross-device Doppler ranging, gesture vocabulary beyond a single wave.
- Reconnect/rejoin polish, spectators.

## Risks & unknowns
- Ultrasonic self-echo may be too flaky on some hardware / at low volume; fallback: use broadband mic level from the wave's air disturbance.
- Some browsers cap output above 18 kHz or mute mic during playback.
- Cross-talk between close phones is the fun but also the biggest reliability risk.

## Done means
Three phones on a table 1.5 m apart complete a full ring lap using only hand-waves — zero touches — with fewer than 2 false catches, and the host shows the pulse advancing seat-to-seat in real time.
