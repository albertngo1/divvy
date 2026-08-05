## Overview
A 4-player mingling game played entirely in ultrasound. Each phone is assigned a secret frequency slot near 18–19.5 kHz, emits in it, and listens for the other three. Every phone privately sees a live ranked list of who is near it — but labeled only `A`, `B`, `C`, with the mapping to actual humans hidden. Your private goal card names a *letter*, not a person. So you walk, watch your own bars move, and reverse-engineer which body belongs to which letter, while three other people do the same to you.

## Problem
Room-as-board games nearly always measure distance to a *fixed* thing — the TV, a speaker, a beacon player. That makes the room static furniture. Here the board is the other players, so every step you take to satisfy your own goal deforms everyone else's board. And the identity layer means the sensor isn't just a position readout: it's a probe you interrogate the room with.

## How it works
1. **Slot assignment.** Server privately gives each phone a carrier: 18.2 / 18.6 / 19.0 / 19.4 kHz, plus a display letter mapping that is *different on every phone* (so you can't collude by comparing letters).
2. **TDMA frames.** A 1-second frame is split into four 250ms slots. Your phone emits only in its own slot and runs its mic analyser in the other three — which sidesteps the brutal self-leakage of continuous emission.
3. **Private phone screen:** your goal card ("end the round with **B** as your nearest"), three bars labeled A/B/C updating at 1Hz, and a timer. Nothing else. No names, ever.
4. **Host TV shows:** the countdown and a single anonymous "room chatter" meter — total mutual signal, which spikes when everyone clumps. It's the only public information, and it's deliberately useless for identifying anyone.
5. **Walk (75s).** You approach someone; a bar rises; now you know a letter. But approaching them may be exactly what *they* wanted, or exactly what ruins their card.
6. **Lock and reveal.** At the buzzer the server freezes the adjacency matrix, and the TV draws the real graph — names, edges, and each player's hidden goal — resolving all four cards at once.

## Technical approach
Host tab + phone PWAs on a PartyKit Durable Object. WebAudio: an `OscillatorNode` gated to your slot, and an `AnalyserNode` with `fftSize: 8192` at 48kHz (≈5.9Hz bins) sampling magnitude at the three foreign carriers. `getUserMedia` **must** request `{ echoCancellation: false, noiseSuppression: false, autoGainControl: false }` — every one of those will otherwise destroy an 18kHz tone.

Data model: phones post `{frameId, heard: {slot: dB}}` at 1Hz. Server keeps a 5-frame sliding median per ordered pair, symmetrizes A→B and B→A by taking the max (body-blocking makes hearing wildly asymmetric), and stores `adjacency[4][4]`. Phones receive back only their own row, re-labeled through their personal letter map.

Sync: slot alignment needs ~±30ms, comfortably inside a 250ms slot, so an NTP-style offset from three WS ping/pong round-trips plus a broadcast frame epoch is sufficient — no clever clock work needed.

The genuinely hard part is that loudness→distance is nonlinear, room-reflective, and blocked by torsos. The design absorbs this by making every goal **rank-based** ("be nearest to B") rather than metric — ranks survive noise that absolute distances do not.

## v1 scope
- Exactly 4 players, one 75-second round.
- One goal type: "end nearest to letter X." Pass/fail, no points.
- Fixed four carriers, hardcoded.
- Reveal = static graph image on the TV.

## Out of scope
Variable player counts, distance calibration, goals referencing multiple letters, negative goals ("avoid B"), multi-round play, any audible audio.

## Risks & unknowns
Phone speaker response above 18kHz varies enormously; some cheap Android speakers roll off to nothing and the player becomes invisible. Young ears and dogs may hear 18.2kHz and hate it. A tiny room may make everyone equidistant and flatten all ranks — needs a minimum-spread check before the round starts.

## Done means
With 4 phones, nearest-neighbor rank is correct in ≥80% of frames over a 30-second hold, in both a clustered (0.5m) and a spread (corners) arrangement; and one full round runs join→reveal with all four hidden goals resolved correctly against a human-observed ground truth.
