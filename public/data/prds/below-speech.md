## Overview

A cooperative, house-wide party game for 4 players with phones, one host screen, and a home with at least three real doors. Players physically disperse into separate rooms and communicate only by closing doors. Every phone runs a mic-based infrasound detector on the 10–80 Hz band — the band where a slamming door radiates hard and human speech radiates almost nothing. Speech dies at the wall; thumps don't. The house becomes a single shared, lossy, collision-prone medium, and the group has to self-organize on it without ever agreeing on a plan.

## Problem

Party games assume everyone is in one room, looking at one TV. That kills any game about *not being able to reach each other*. Meanwhile phone mics are used exclusively as loudness meters or speech recognizers, and the most interesting acoustic fact about a house — that low frequencies pass through walls while voices don't — is untouched.

## How it works

Setup at the TV: 20-second calibration. Each phone samples its own noise floor; the group closes one designated door once to establish a reference thump. Then each phone is privately dealt a **Code**: three symbols, HEAVY (a real door pushed shut firmly) or light (a cabinet, a knock on a doorframe). Players scatter — different rooms, doors between them, no shouting.

Each phone shows PRIVATELY: your Code, your progress through it, your own live scrolling 10–80 Hz energy trace, and a green/red *channel clear* lamp. Crucially each phone's trace is different — you sit closer to some doors than others, so "is the channel busy?" is a local, unreliable belief, not shared truth.

The host screen shows PUBLICLY: the server's fused seismogram of all four traces, four anonymous progress bars, and a red flash on every collision. Two thumps inside a 1.2s window merge into an undecodable blob: both senders' Codes reset to zero. The first 40 seconds are a pile-up. Then people back off, listen, and a rhythm emerges — that emergent politeness *is* the game. Win when the server cleanly decodes all four Codes inside four minutes.

## Technical approach

Host tab + phone PWAs + one authoritative room actor (PartyKit / Durable Object) over Tailscale Serve. Phones run getUserMedia → AnalyserNode, sum FFT bins 10–80 Hz at ~60 Hz frame rate, adaptive-threshold onset detection normalized to that device's own noise floor, and stream `{deviceId, tOnset, peakNorm, ratio}` — not audio — to the server. Clock sync is NTP-style WS ping/pong offset estimation; ±30 ms is plenty since the collision window is 1.2 s (no TDOA-grade sync needed).

The genuinely hard part is classification, not sync: separating a door from a footstep, a dropped mug, or TV bass. Fix uses the fleet — accept an onset only if ≥3 of 4 devices register it within 80 ms. A whole-house pressure event trips everyone; a footstep trips one phone. HEAVY vs light is decided server-side from the cross-device amplitude *vector*, which also fingerprints which door was used.

## v1 scope

- Exactly 4 players, one round, one 4-minute timer
- 3-symbol Codes, two symbols in the alphabet
- Fixed collision window (1.2s), no difficulty tuning
- Host screen: fused trace + 4 bars + collision flash. Nothing else
- Android Chrome + iOS Safari, mic permission only

## Out of scope

Scoring history, multiple rounds, a traitor role, per-door identification shown to players, any text chat, teams larger than 4.

## Risks & unknowns

Phone mic high-pass filtering may gut the 10–80 Hz band on some models — needs a bench test across 4 devices before anything else. Apartments with hollow-core doors may not produce a separable HEAVY/light contrast. Players may cheat by shouting. Host TV audio must be muted or high-passed.

## Done means

Four phones in four different rooms; a tester closes doors on a paper script; the server decodes all four 3-symbol Codes with zero false onsets over three consecutive runs, and a deliberate two-people-slam-at-once produces a visible collision flash on the TV.
