## Overview
Band Pass is a 3–4 player talking-and-deduction game. Each phone listens to its own owner through the browser's speech recognition and scores what they say, live, with a small local language model. Every player is secretly assigned a **surprisal band** — stay boring (roughly 1–3 bits/token), or stay strange (above 5). You hold an ordinary conversation about an ordinary topic. Afterward, you guess who had which band.

## Problem
Hidden-role games hide the role behind behavior you can fake freely, so they become pure rhetoric. Band Pass puts a measuring instrument between you and your performance: you can *feel* like you're being boring while a machine reports you spiking. And unlike "act suspicious," the constraint here is legitimately hard in both directions — sustained blandness is as difficult as sustained weirdness.

## How it works
The TV shows a topic (*"what to do with a spare room"*) and a round-robin order, ~15 seconds each, three passes.

**Privately on your phone:** your band, drawn as a green zone on a dial; your own live transcript; and a needle showing your running bits/token — measured **conditioned on the shared transcript of everything already said in the room.** Nobody else ever sees your number in real time.

**On the TV:** four anonymized lanes, wiggling with surprisal height. No names, no words, no bands. Plus the shared transcript accumulating.

The twist that makes it a game rather than a meter: your context is the previous speaker's mouth. Someone who rants raises the room's weirdness, so a "boring" player following them finds plain sentences suddenly surprising; a "strange" player following boilerplate can score with a mild non sequitur. You are constantly setting and wrecking each other's difficulty, and you cannot tell whether the person ahead of you is helping or hunting.

Score = fraction of your finalized words in band, plus a deduction round where everyone privately assigns bands to the others.

## Technical approach
Phone PWA: `webkitSpeechRecognition` with interim results, one continuous session per turn (iOS requires a fresh user gesture). Finalized chunks go to the server; the server appends them to the canonical transcript and broadcasts it with a monotonic `contextVersion`. Each phone scores its own words against that context with transformers.js (SmolLM2-135M, q4, WASM). Samples carry their `contextVersion`; the server discards anything more than one version stale. Data model: `Room {topic, order[], turnIdx, transcript[{playerId, text, t}], bands{playerId:[lo,hi]}, traces{playerId:[{t,bits}]}}` in a Socket.IO server behind Tailscale Serve.

**The genuinely hard part** is that ASR finalization lags 0.3–1.5s, so a truthful live dial is always scoring your past. Mitigation: score interim hypotheses on-device for the needle (fast, wrong-ish, private), count only finalized text for points, and draw the needle as a visibly trailing comet so the lag reads as honesty rather than as a bug. Secondary: only the active speaker's phone records, so crosstalk doesn't poison two transcripts at once.

## v1 scope
- 3 players, one 60-second round, one topic
- Two bands only: boring / strange
- Chrome on Android + Safari on iOS; no other browsers
- Score = time-in-band percentage, plus one single-shot vote on who was strange
- No lobby polish, no rematch, room code only

## Out of scope
Whisper/on-device ASR, non-English, multiple rounds, band variety, replay of the trace, any handling of two people talking at once.

## Risks & unknowns
ASR quality in a loud room is the whole game's foundation and may simply fail. Bands may be trivially readable from the TV lanes, killing deduction. Bits/token on 15 seconds of speech may be too noisy to be fair.

## Done means
Three phones in one noisy room complete a 60-second round; each player's dial tracks their own speech with under 2s of visible lag; the TV lanes stay anonymous; and after the reveal at least two of three players say the band they were given felt hard to hit but not impossible.
