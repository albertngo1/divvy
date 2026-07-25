## Overview
Split Band is a 3–4 player co-op for a living room with a host screen. For eight seconds a round, the phones stop being controllers and become one loudspeaker array: a spoken repair order is chopped into 120ms slices and dealt round-robin to the phones, which play their slices in network-scheduled alternation. No phone ever holds an intelligible message — the audio only assembles in the physical air of the room. Then the phones snap back to being private control panels and the crew has 40 seconds to execute what it thinks it heard.

## Problem
Spaceteam-likes distribute *text*. Everyone reads their own screen and shouts; the listening is trivial, only the reading and the panic are hard. Nothing in the genre makes the room's acoustics load-bearing, and nothing makes two players genuinely, verifiably hear different things from the same broadcast. Split Band makes the message a shared physical object that no single player owns or perceives fully.

## How it works
1. **Warm-up.** Each phone pre-fetches and decodes its assigned slices, then ACKs. TV shows "ARRAY FORMING".
2. **Broadcast.** Server picks T0. Every phone plays only its own slices, interleaved: phone A gets slices 0,3,6…, B gets 1,4,7…, C gets 2,5,8…. Each phone silently *drops* one random slice it owned.
3. **Asymmetry.** You hear your own phone loudest (proximity) and you get no compensation for its dropouts — so every player's perception has different holes. The argument ("it said SEVEN" / "no, AFT valve") is real, not performed.
4. **Execute.** Phone shows PRIVATELY: three uniquely-labeled controls (a 0–9 dial, a two-position valve, an arming key). The command names two controls that live on *different* phones ("set BALLAST to seven, close the AFT VALVE"), so even a perfectly heard message must be relayed aloud.
5. **Replay** is possible once: all phones must hold REPLAY simultaneously for 1s, costing 8 seconds of clock.
6. **Win** = correct controls in correct states and all arming keys turned within a 500ms unison window.

Host TV shows only: countdown, per-panel armed/unarmed lamps, strike counter. Never the command text.

## Technical approach
PartyKit Durable Object as authority; host tab is a dumb display; phones are PWAs. Model: `Room {phase, t0ServerMs, sliceMap: playerId → [{index, startMs, bufferId}], command: {targets:[{playerId, controlId, value}]}, panels, strikes}`.

Sync: each phone runs an 8-round ping to estimate clock offset and RTT (median-filtered), then converts the server-time T0 into local `AudioContext.currentTime` and schedules `AudioBufferSourceNode`s ahead of time. Slices are decoded during warm-up; T0 slips until every phone ACKs decode-ready.

**Hard part:** ±15ms alignment. Past ~30ms of skew the interleave smears into mush. Compounding it: iOS needs a user gesture to unlock audio (a TAP TO JOIN ARRAY button), and phone output latency varies 20–120ms across devices — use `AudioContext.outputLatency` where exposed, plus an optional one-time chirp calibration where the host laptop's mic measures each phone's true offset.

## v1 scope
- 3 phones, one round, one hardcoded command
- TTS rendered and sliced offline into 120ms WAVs, shipped as static assets
- One replay, one 40s timer, binary win/lose card on the TV
- Three controls per phone, all hardcoded

## Out of scope
- Multiple rounds, escalating difficulty, scoring, procedural command generation
- Frequency-band splitting (time-interleave only), spatial panning, reconnect handling

## Risks & unknowns
- Interleaved speech may be unintelligible even when perfectly synced — needs a same-day paper test with three phones before anything else is built
- Cheap phone speakers roll off badly; a soft speaker in a loud room breaks the array
- Bluetooth-connected phones add unpredictable 150ms+ latency — must be detected and refused

## Done means
Three phones on a table play one interleaved command; a naive group that has never heard it can, after one replay, correctly set two cross-phone controls and arm within the unison window at least half the time — and each player, asked separately, reports having missed a different word.
