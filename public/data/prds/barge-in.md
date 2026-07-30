## Overview

A 3–4 player cooperative voice game for a couch and a TV. Exactly one player is ON AIR at any moment, reading a scripted line aloud. The round only advances when someone *interrupts* them — at the right instant, on the right word. Barge In is a Spaceteam-lineage panic game where the core skill is the clean interrupt rather than the fast tap.

## Problem

Party voice games train the wrong reflex: wait your turn, then shout. Real radio nets, auction floors, and dispatch rooms reward the opposite — the surgical cut-in. Nobody has built the interrupt as a *game verb*, and nobody can without per-phone privacy: if everyone could see everyone's trigger, the whole round collapses into polite turn-taking.

## How it works

One round = 6 clean handoffs in 90 seconds.

- **The floor holder's phone (private):** a scripted line, teleprompted word-by-word with a moving highlight at ~350ms/word: *"the shipment cleared customs at dawn and the WATER was already rising."* They read it aloud at the highlight's pace.
- **Every other phone (private):** one single word — their LISTEN-FOR word. That is the entire screen. They never see anyone else's word, and never see any script.
- When a listener hears their word, they must **start talking within ~500ms**. Their own phone's mic detects their voice onset. The floor transfers: their screen flips to their script line; the previous speaker's line goes dark mid-sentence.
- Scripts are generated so each line contains exactly one other player's listen-for word (a Hamiltonian handoff path through the room), plus 2–3 **decoys** — near-misses (WATERFRONT, WAITER, WEATHER) that must not trigger you.
- **Failure modes, all public:** DEAD AIR (nobody barged, speaker ran out of line), COLLISION (two onsets inside the arbitration window), FALSE START (someone barged on a decoy or on a word that wasn't theirs).
- **Host TV:** the ON AIR light with whose name is lit, the running transcript of words successfully delivered, a handoff counter (3/6), the failure ticker, and the clock. It never renders a listen-for word or an upcoming script line.

## Technical approach

Host tab + phone PWAs + a Cloudflare Durable Object per room (one DO = one authoritative floor state machine).

**Data model:** `Room{code, seed, phase, floorHolder, wordIndex, handoffs, fails[]}`, `Player{id, name, listenFor, scriptLine, micThreshold, rttMs}`, `ScriptGraph{lines[], triggerAt[], decoys[]}` generated from the seed at round start.

**Sync:** phones stream *events*, never audio. Each phone runs a local AudioWorklet computing RMS over a calibrated noise floor; crossing it emits `onset{clientTs}`. The server corrects with `rtt/2` from a rolling ping and grants the floor to the earliest corrected timestamp; any second claim inside a 200ms guard band is a COLLISION for both.

**The genuinely hard part** is knowing *when the trigger word was actually spoken* — otherwise the barge window is undefined. v1 sidesteps ASR entirely: the speaker's teleprompter **is** the clock. Their phone drives the highlight at fixed cadence and reports `wordEmitted{k, clientTs}`; the server opens a 500ms window at the trigger index. The game never checks what anyone said, only that the room's mouths and ears line up in time. That single decision is what makes v1 buildable in a weekend.

## v1 scope

- 3 players, one seeded round, 6 handoffs, 90s.
- 8 hardcoded script lines with hand-authored decoys.
- Mic calibration: 3s ambient + 3s "say your name" per phone.
- Onset detection, floor arbitration, three failure banners on the TV.
- Room code join, no accounts, no reconnect.

## Out of scope

Speech recognition, audio streaming, scoring/leaderboards, 5+ players, multiple rounds, procedural script generation, spectators, reconnect-after-refresh.

## Risks & unknowns

- **Cross-trigger:** a loud speaker trips a neighbor's onset detector. Mitigations: per-phone calibration with margin, 300ms attack hysteresis, phones held near the mouth.
- 500ms may be brutal or trivial — needs live tuning; likely scales with the trigger word's position in the line.
- Teleprompted reading may sound robotic and kill the comedy.
- iOS PWA mic permission + AudioContext resume-on-gesture is a known tarpit.

## Done means

Three phones and a TV in one room: the group completes 6 handoffs inside 90s at least once; a deliberate double-barge renders COLLISION on the TV within 300ms; a deliberate silence renders DEAD AIR; and inspecting the WebSocket payloads confirms no phone ever receives another phone's listen-for word or script line.
