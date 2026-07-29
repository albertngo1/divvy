## Overview

Ring Test is a 3–4 player cooperative hunt where the board is your actual apartment. Players knuckle-knock on real objects — the radiator, a hollow door, a wine glass, the arm of the sofa — and each phone secretly judges that knock against a *different* private target sound. The group wins by finding the single object that satisfies everybody. Nobody can describe their target; you only have adjectives and each other.

## Problem

Mic-based party games measure loudness, and loudness is a bad signal (phone AGC ruins it, and one shout wins). Meanwhile the most tactile thing about a room — that everything in it has a *voice* when you hit it — has never been a game board. The itch: a co-op game where the shared information channel is genuinely lossy because the private data is a **timbre**, and human beings are extremely bad at saying what a timbre is.

## How it works

**Setup.** Everyone grants mic access and stands up. The host TV shows one rule: *knock with a knuckle, one person at a time.*

**Phone (private):** a target zone drawn on a 2D pad — horizontal axis dull↔bright, vertical axis dead↔ringing — plus a dot showing where the last knock *your phone heard* landed. Your zone is different from everyone else's. You are never told the axes' units and never see anyone else's zone or dot.

**Host TV (public):** a list of objects the group has knocked and named aloud (typed by the host, or picked from a preset list of household objects), each with a row of anonymous warm/cold pips — one pip per player, in fixed but unlabelled order. That's the entire shared channel: "the radiator was warm, warm, cold."

**Round (90s).** Someone announces an object, walks to it, knocks. Every phone independently onset-detects the knock, measures spectral centroid and decay time, and privately tells its owner warmer or colder. The group argues — "it's too clangy, we need something wooden" — and picks the next thing to hit. Win by all-warm on one object.

**The friction that makes it a game:** two knocks inside 400ms are physically inseparable to the mics, so the server spoils both and the TV flashes DOUBLE-HIT. A room of excited people must impose turn-taking on itself. And you must be *near* the object you knock — a phone across the room measures a smeared, reverberant version and reads cold, so the knocker's own reading is the only trustworthy one, which is why every phone must be carried.

## Technical approach

Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve).

Each phone: `getUserMedia({audio:{autoGainControl:false, noiseSuppression:false, echoCancellation:false}})` → `AudioContext` → `AnalyserNode` at 48kHz. Onset detect via spectral flux over a 512-sample hop with a 120ms refractory window. On onset, compute **spectral centroid** over the first 30ms and **decay time** (envelope −20dB, capped at 400ms). Both are level-independent, which is the point: absolute loudness is untrustworthy across phones, but timbre and decay survive.

Phone sends `{clientTs, centroid, decayMs, peakDb}`. Server holds `Room { objects: [{name, knocks[]}], players: { id, zone: {cx, cy, r} (secret), lastVerdict } }`, converts client timestamps to server time with a rolling NTP-style WS ping/pong offset (±30ms is plenty here — 400ms collision window), clusters knocks, and marks any cluster containing two onsets >6dB apart from different phones as SPOILED. Verdicts (`warm` if inside zone, else warm/cold by distance delta from the previous knock) go privately down each socket; only aggregate pips go to the host.

**The genuinely hard part** is onset detection on a phone mic in a noisy room full of laughing people, and the fact that iOS Safari ignores some `getUserMedia` constraints — AGC may still ramp and corrupt the decay measurement. Fallback: normalise decay against the knock's own peak rather than absolute dB.

## v1 scope

- 3 players, one round, 90 seconds, one apartment.
- Zones hand-authored so that exactly one preset object (chosen during a 60s pre-game calibration sweep where the host knocks 6 things) sits in all three.
- Phone UI: one 2D pad, one dot, one word (WARMER / COLDER).
- TV: object list with anonymous pip rows, a countdown, and a DOUBLE-HIT flash.
- Object naming: host types it, or taps from a 12-item preset list.

## Out of scope

Scoring, multiple rounds, the "impossible zone" saboteur variant (one player whose target nothing in the room satisfies), automatic object recognition, calibrating for room reverb, competitive claiming, any handling of a player who owns a very quiet apartment.

## Risks & unknowns

Spectral centroid may not separate real household objects as cleanly as it does in a lab — needs a measurement pass on 20 actual objects before writing any game logic. Knocking hard on someone's television is a real hazard; the preset list should be conservative. The verbal channel might collapse into "just hit everything" brute force, which is boring — if a typical room only has ~15 knockable things, the round may be won by exhaustion rather than deduction, and the fix (bigger object space, or a knock budget) is unproven.

## Done means

Three phones and a laptop in one real living room. Knocking six different objects produces six visibly distinct dots on the private pads, and repeat knocks on the same object land within a tight cluster. Two people knocking at once reliably triggers DOUBLE-HIT. One group of three finds the all-warm object inside 90 seconds without anyone being told which axis is which, and at least one of them says a sentence like "no, we need something *deader* than that."
