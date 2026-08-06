## Overview

*Second Witness* is a silent cooperative party game for 3 players in a room with a TV. Each player privately witnesses an overlapping slice of the same short scene, then the room must agree — with no talking, no gestures, no reveal until the end — on exactly which moments were seen by all three. It plays in about ninety seconds and is aimed at people who like the held-breath silence of a coordination game more than the noise of a trivia one.

## Problem

Most convergence games ask you to guess someone's *taste* ("what word would Dana pick?"). That's a psychology quiz with a coordination hat on. The itch here is different and more interesting: converge on the *intersection of what we each experienced* — a real, computable overlap that nobody can see directly. Testimony games (alibis, witnesses) always resolve to accusation; this one resolves to corroboration.

## How it works

1. A 10-second silent animated scene exists. Nobody ever watches all of it.
2. **Privately, on each phone:** a distinct 4-second window plays once — player A gets 0.0–4.0s, B gets 2.5–6.5s, C gets 5.0–9.0s (offsets randomized per game). The three-way intersection is short and never advertised.
3. **On the TV:** twelve still frames sampled across the whole 10 seconds, arranged in a shuffled 4×3 grid with no timestamps, so temporal order can't be read off position.
4. **Privately again:** each phone shows the same twelve stills and each player silently taps the subset they believe *all three of them* saw. Taps are never broadcast. The TV shows only a count of players who have locked in.
5. On the third lock, the TV reveals all three selections at once. Identical sets = the room wins, and the TV animates the three window bars sliding into place to expose the true intersection.

The strategy is inference, not vibes: you know your own 4 seconds, you know there are three windows covering 10 seconds, and you must reason about which of your frames are peripheral enough that a neighbour probably lacked them — then trust that they're reasoning the same way about you.

## Technical approach

The scene is **not a video file**. It's a deterministic canvas animation seeded per game: 5–6 colored primitives with scripted entrances, exits, and one color flip, all defined as `renderFrame(seed, tMs)`. Both TV and phones ship the same 80-line renderer, so any frame is producible on demand and the ground-truth intersection is computable server-side — no asset pipeline, no CDN, no video decode variance.

A PartyKit / Cloudflare Durable Object room holds authoritative state: `{seed, windows: {playerId: [startMs, endMs]}, frameTimes: number[12], picks: {playerId: Set<frameIdx>}, phase}`. Phones join via a 4-letter room code on a QR shown by the TV. Playback sync is the hard part — not frame-accurate streaming (each phone renders locally with `requestAnimationFrame`), but making the three private playbacks *start together* despite 20–200ms of mobile-radio jitter. Fix: the server issues a `playAt` timestamp ~700ms in the future, and each client corrects its clock with a three-sample NTP-style offset handshake at join. Playback runs off the corrected clock, so drift is bounded well under one sampled frame's spacing. Picks travel as a single locked payload; the server never echoes partial selections.

## v1 scope

- Exactly 3 players, exactly 1 round, one hardcoded seed.
- Fixed window offsets (0/2.5/5.0s) — no difficulty tuning.
- 12 stills, binary tap-to-select, one lock button, no undo after lock.
- Win/lose screen showing the three window bars and the true intersection.
- No accounts, no persistence, no scores across rounds.

## Out of scope

More than 3 players; real video or photography; partial credit; timers; audio; spectator mode; rematch with a new seed (just reload).

## Risks & unknowns

- The intersection may be trivially guessable if the scene's middle is visually loud — needs the seed tuned so distinctive events are spread evenly, not clustered.
- 12 unlabeled stills may be too hard to tell apart at phone size; may need 8.
- Players will be tempted to talk; the game has no enforcement, only the TV shaming them.
- Clock-correction failure mode is silent (one player sees a shifted window and the puzzle becomes unsolvable) — needs a visible drift assertion.

## Done means

Three phones join by QR, each plays a visibly different 4-second window starting within 50ms of each other, all three lock a selection with no cross-leakage, and the TV correctly declares a win only when the three sets are byte-identical — verified by one deliberate win run and one deliberate mismatch run.
