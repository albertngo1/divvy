## Overview
A 75-second cooperative reactor game for 3-5 people, shared TV plus private phone panels. The asymmetry lives in the ear rather than the eye: each phone plays private masking noise at a level only its owner experiences, and the noise is produced by the room's own talking.

## Problem
Every voice party game assumes broadcast is free — that if you say it, everyone got it. Real coordination fails at reception, not transmission, and the failure is invisible to the speaker. There is a whole comedy of "I told you" / "I never heard that" nobody has built a game around. It also inverts Spaceteam's core resource: here speech is simultaneously the only tool and the thing that breaks the tool.

## How it works
TV: a reactor with 4 subsystems, health, clock, and one shared CONGESTION bar. Each phone privately holds 3 switches, its own command cards ("purge coolant loop B"), and a NOISE meter.

The host laptop mic measures total room speech energy — one mic, RMS envelope only, no transcription, nothing leaves the tab. That drives CONGESTION, visible to all. Each phone then plays pink noise through its own speaker at `congestion × your private sensitivity`, and sensitivities differ by up to 4x. So a loud negotiation deafens the most sensitive player first, and **only they know it happened**. Their teammates just watch someone stop responding.

The single non-verbal escape is a PING button: three per round, flashing your avatar red on the TV, meaning "again, slower." Everything else must be spoken through the static you are collectively generating. Silence decays congestion fast, so the winning behavior is short, spaced, disciplined radio traffic — which the panic actively fights.

Private: your switches, your commands, your noise level, your sensitivity. Public: congestion, subsystem health, who is pinging, clock.

## Technical approach
Host tab + phone PWAs + PartyKit Durable Object. Host runs Web Audio `AnalyserNode` at ~20Hz, smooths an envelope, publishes `congestion` to the server. Server ticks 10Hz: `noise_i = clamp(congestion * sens_i)`, pushed per-phone. Each phone runs a local pink-noise source node and ramps gain toward the last received target.

Model: `Room {congestion, health, clockMs, commands[]}`; `Player {controls[], sens, pings, noise}`.

The hard part is causality, not throughput: a mic→host→server→phone loop of ~200ms reads as random drift instead of consequence. Fix by smoothing on the host, sending gain *targets plus ramp time*, and interpolating locally so the static swells the instant the room gets loud.

## v1 scope
- 4 players, one 75-second round, survive-or-fail
- 3 switches and 10 commands total
- Fixed per-player sensitivity, no drift
- 2 pings each, single pink-noise node, no headphones
- Room-code join, no score, no reconnect

## Out of scope
Per-phone microphones, ASR, earbud pairing, drifting sensitivity, multiple rounds, leaderboards.

## Risks & unknowns
Phone speakers may be too weak to mask a genuinely loud room — needs a physical test before anything else is built. Equilibrium risk: shouting may still dominate despite the feedback loop. Accessibility: needs an opt-in visual-static mode that garbles the phone's own screen instead of its audio.

## Done means
One round, four phones, telemetry showing at least two commands missed while the actor's noise level was above 0.7 — and in the post-game debrief the group correctly names who went deaf, having never been shown it.
