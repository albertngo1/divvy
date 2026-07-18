## Overview
Report is a 3–4 player cooperative room game where a single sharp sound turns the whole room into a distance-ranking puzzle. It's for people who like the quiet-tension party moments — everyone frozen, listening — and the comedy of arguing about who's closer without being allowed to say how loud it was.

## Problem
Most 'listening' party games are about *what* you heard (a word, a lyric). Almost nothing plays with *how loud* a shared sound reached each person — a physical fact that every phone in the room measures differently and privately. That asymmetry is free game design sitting unused.

## How it works
One player is the **Source**. The host TV shows a countdown; on zero, the Source makes exactly one loud impulse (a single clap or floor stomp) from wherever they're standing. In that instant, every *other* phone captures its own peak mic RMS from the impulse.

Each listener's phone then PRIVATELY shows only a coarse ring badge — a soft glow whose brightness maps to their own captured loudness — and the instruction: *'Line up left-to-right, closest to the Source on the left.'* Crucially, the phone never shows a number and never shows anyone else's reading. Players must physically walk into a line and negotiate order using words like 'I think I'm closer than you' — but they're forbidden from stating loudness values.

The host TV shows only anonymized lock slots (Slot 1…N) and a big **LOCK** button the group presses when they believe the line is correct. On lock, the server compares the players' claimed order against the true loudness ranking and reveals right/wrong per position.

Per-phone architecture is load-bearing: the impulse is a single instantaneous event, so one passed-around phone physically cannot sample four positions from the same clap. Every phone must be listening simultaneously, each from its own spot — that's the entire point.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `{ roomId, sourceId, phase, readings: {playerId: peakRMS}, claimedOrder: [playerId], locked }`. Each phone runs getUserMedia → AudioWorklet computing a rolling RMS; on the server's synchronized 'GO' timestamp it opens a 400ms capture window and reports its peak. The genuinely hard part is the shared clock: the impulse and all capture windows must align within ~50ms, so the server issues a scheduled start-time and phones locally schedule the window (NTP-style offset estimation from a few ping round-trips). Room acoustics (reflections, body shadowing) add noise — v1 leans on that as *flavor*, not a bug.

## v1 scope
- 3 players + 1 Source, one round, one clap
- Coarse private glow (no numbers) + claimed-order lineup
- Host lock button + reveal of correct/incorrect positions

## Out of scope
- A hidden 'Mole' whose phone shows inflated loudness
- Multiple impulses / moving Source
- Score tracking across rounds

## Risks & unknowns
- Clock sync tight enough to trust one impulse
- Mic auto-gain (AGC) flattening loudness differences — must disable AGC
- Rooms too small to produce meaningful loudness spread

## Done means
Three phones capture one real clap within a 400ms aligned window, the private glows differ monotonically with distance in a 4m room, and locking a lineup reveals per-slot correctness.
