## Overview

A 3-player cooperative round for a living room with a TV and three phones. One dot crawls along one track. The dot advances *only* while a human voice is detected, and only ever forwards. Every player privately holds one checkpoint the dot must stop on and one mine the dot must not stop on. Nobody can describe their markings without spending the exact resource that ruins them.

## Problem

"Silence games" usually make talking a tax — a meter drains, a budget burns. That's arithmetic, not tension. The itch here is a game where speech is *the only way to act* and simultaneously the only way to overshoot, so that the room invents its own grunt-language within ninety seconds without being told to.

## How it works

**Host screen:** one horizontal track, 0–100, with the dot, a `HOLDER` chip lit in the current speaker's colour, a `CONTESTED` flash when two people talk at once, and a bare count of checkpoints cleared (3 of 3). It never shows where anything is.

**Each phone, privately:** the same track, but marked only with *your* GATE (a 4-unit band) and *your* MINE (a 6-unit band), plus your own live mic bar and a glow when you hold the wheel.

**The loop:** the server elects a holder — the phone whose voiced energy is loudest, with 400 ms of hysteresis. The dot advances 1 unit per 120 ms of that holder's voicing. When *nobody* voices for 1.5 s, the dot SETTLES: a gate at that position clears; a mine at that position detonates and costs one of three lives. Two phones within 6 dB of each other reads as CONTESTED — the wheel stalls, nothing moves, and the room gets a red flash.

So "stop, mine's at 41" is a sentence that drags the dot past 41. The room converges on monosyllables, on handing the wheel to whoever's gate is nearest by simply shutting up, and on the terrible discovery that arguing is the one thing that cannot be afforded.

## Technical approach

PartyKit Durable Object as the authoritative sim at 20 Hz. Phone PWA: `getUserMedia` → AudioWorklet computing 20 ms A-weighted RMS plus an autocorrelation voicing gate; the phone ships one byte of voiced-energy per 50 ms over WebSocket. **Raw audio never leaves the device.** Lobby calibration is two passes: 3 s of room silence sets each phone's noise floor, then "say your name" normalises per-phone gain. Host tab is a dumb renderer over state snapshots with client-side interpolation.

The hard part is bleed: every phone hears every voice. Attribution is argmax with a required 6 dB margin, and the sub-margin case is deliberately promoted into a game state (CONTESTED) rather than guessed at. Second hard part is the ~120 ms round trip making the throttle feel mushy — mitigated by keeping the sim on the LAN via Tailscale Serve and interpolating the dot on the host.

## v1 scope

- 3 players, one 90-second round, one hard-coded track
- 3 gates, 3 mines, 3 lives, win/lose only — no score
- QR join, no rejoin, no lobby chat
- Two sounds total: settle chime, mine thud

## Out of scope

Multiple rounds, leaderboards, any speech recognition, spectator view, reconnection, backgrounded-tab audio, procedural maps.

## Risks & unknowns

Laughter and coughing trip the voicing gate (probably a feature). Continuous whispering is a degenerate slow-crawl strategy — capped by requiring floor+8 dB. Android WebAudio latency varies badly. iOS needs a user gesture before mic access, so the join flow must include a tap.

## Done means

Three phones and a TV: a spoken sentence visibly moves the dot within 200 ms; two people speaking at once shows CONTESTED with zero movement; 1.5 s of room silence inside a gate band clears it and increments the host counter; landing on a mine ends the round and reveals whose mine it was.
