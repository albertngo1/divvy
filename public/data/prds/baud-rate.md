## Overview

A 3–4 player co-op for people who have already learned to whisper their way around every other silence game. The phones form a real acoustic data mesh in the 12–16.5 kHz band. Human speech barely reaches that band — but *sibilants do*. A whisper is nearly pure broadband hiss with strong energy at 8–16 kHz. So in Baud Rate, whispering is not the loophole; it is the single most damaging act available. The game teaches this the hard way, in about forty seconds.

## Problem

Every mic-as-constraint party game gets solved the same way: players discover that a hushed whisper is under the threshold and the tension evaporates into a room of conspirators murmuring at each other. The itch is a silence game whose physics *specifically* punish the whisper workaround, where the reason to shut up isn't a score rule but a link that visibly dies.

## How it works

The host TV shows a five-slot MANIFEST of blanks, a live spectrogram sliver of only the 12–16.5 kHz band, and a LINK bar (measured symbol error rate).

Each phone privately shows three things nobody else sees: a PAYLOAD (one word from a 4096-word dictionary, i.e. 12 bits), the seat it must SEND to, and its remaining attempts (3). The send targets form a directed ring, so every player is both a transmitter and a receiver, and nobody knows the whole graph.

The rule that makes it a game: **you may not type your own word.** You must hold your phone toward your recipient's phone and tap SEND. Your phone emits a 4-FSK burst — 12 bits plus CRC, about 0.8 s. Their phone decodes and privately shows the word it received, possibly corrupted; only they can type it into the TV manifest. Five words, five hops, one physical channel.

Meanwhile every phone streams its own band-limited RMS at 10 Hz. The host computes a live noise floor; any burst overlapping a floor excursion is voided and burns an attempt. Laughter, a crinkling bag, and above all a whispered "psst, send it now" spike the band and kill the hop. A low voiced hum barely registers — which players discover, and which is funnier than silence.

## Technical approach

Host browser tab + phone PWA + Cloudflare Durable Object per room. `getUserMedia` with `echoCancellation: false, noiseSuppression: false, autoGainControl: false` — non-negotiable, since noise suppression eats the carrier. AnalyserNode at 48 kHz / FFT 4096 (~11.7 Hz bins); 4-FSK, 40 ms symbols, ~50 baud. Data model: `Room { seats[], ring{from→to}, payloads{seat→word}, slots[5], attempts{seat}, floorSamples[] }`. Phones own transmit/decode locally and report events; the DO is authoritative for slot state and attempt accounting.

The genuinely hard part is device heterogeneity: many phone speakers roll off hard above 14 kHz and iOS Safari applies processing you cannot fully disable. Mitigation is a lobby-time calibration handshake — each pair probes eight candidate tones and the DO pins that link to the best four both endpoints can actually produce and hear. Secondary hard part: clock alignment tight enough to attribute a floor excursion to a specific burst window (DO ping-offset sync, ±30 ms).

## v1 scope

- 3 players, one round, 3 minutes
- 5 manifest slots, one hop each, 3 attempts per hop
- One fixed directed ring, no roles
- Calibration handshake in the lobby (mandatory, ~15 s)
- Fail state: run out of attempts. Win state: 5/5 correct

## Out of scope

Multiple rounds, scoring beyond win/lose, multi-hop relays, deliberate jamming roles, Android/iOS parity beyond "one carrier set that works", spectator mode.

## Risks & unknowns

Ultrasonic-ish links are genuinely flaky across cheap hardware; if decode reliability drops below ~85% in a quiet room the game is unplayable, not merely hard. Real speech masking at 14 kHz is weaker than the fiction implies — v1 accepts a modeled derate on top of the real measurement, and we must be honest with ourselves about how much of the channel is physics vs. theatre. Also: some players genuinely hear 15 kHz and will find it unpleasant.

## Done means

Three phones in a real living room complete 5/5 slots in under three minutes, and in playtest at least one group audibly discovers — by watching the spectrogram spike as they whisper — that whispering is what keeps killing their link, then finishes the round in silence.
