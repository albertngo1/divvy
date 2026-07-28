## Overview

Getting Warm is a 4-player concurrent-room party game — a riff on Trapwords / Taboo — where one player describes a secret word aloud while two opponents have privately buried "mines" in the semantic space around it. Nobody in the room can see the mines. The Describer alone feels a private heat meter climbing as their live speech drifts toward one. For groups of four who like Taboo but find the printed forbidden list boring.

## Problem

Taboo hands you the forbidden words. The entire game is reading a list and complying with it. Trapwords hides the list but detects only exact string matches, so "furry thing that meows" accidentally dodges a CAT trap, and the trap-layer's tension collapses into shouting "you almost said it!" after the fact. The only genuinely interesting private information — *how close are you right now* — has nowhere to live at a physical table. It needs a screen per person, and it needs three materially different screens at the same moment.

## How it works

Four players: 1 Describer, 1 Guesser, 2 Layers.

**Setup (20s).** Describer's phone privately shows the target (LIGHTHOUSE). Each Layer's phone privately shows the same target plus a scrollable list of ~40 candidate mine words; each picks exactly one and locks. The Guesser's phone shows a full-bleed "look away" card and nothing else. The TV shows only a countdown.

**Round (90s).** The Describer talks. Their phone streams speech-to-text; the server scores each recognized content word against both buried mines by cosine similarity over precomputed embeddings and returns one blended HEAT value 0–100. The Describer's phone privately shows heat as a color bar plus escalating haptic pulses — never which mine, how many, or which direction. Each Layer's phone privately shows only *their own* mine's proximity: slow pulse at 40, fast at 70. Layers may not speak. The Guesser's phone shows the running transcript large, plus a text box, and no heat at all.

The TV shows the transcript and a public DETONATION banner only when heat crosses 85 — the mine is revealed, the round ends, that Layer scores. If the Guesser types the target first, Describer and Guesser score and the TV reveals both mines so the room can see how close it got. The Describer's hesitation is the leak: stalling is a public tell the Guesser and the Layers both read differently.

## Technical approach

Host browser tab + phone PWAs + a PartyKit Durable Object per room.

Data model: `Room {phase, targetId, deadlineTs}`, `Player {id, role, mineWord?}`, `Utterance {playerId, seq, tokens[], serverTs}`, `Heat {value, contributingMineId, ts}`. A frozen 5,000-noun vocabulary with precomputed 384-dim embeddings ships to the server; Layers can only pick from it, so every mine is guaranteed scorable.

Sync: only the Describer's phone streams (Web Speech API interim results, throttled to 200ms). The server is authoritative for heat and detonation.

The hard part is twofold. (1) Speech-recognition jitter: interim results arrive out of order and get *revised*, so the server must dedupe on `(seq, token prefix)` and never let a retracted token detonate a mine — heat is recomputed from the current committed transcript, not accumulated. (2) Fan-out: one event produces three different privacy-filtered payloads. Heat goes only to the Describer, per-mine proximity only to its Layer, transcript to everyone. Heat must never enter the room-wide state object — one channel per role, projection at the edge, or the Guesser sees the answer.

## v1 scope

- Exactly 4 players, fixed roles, one 90-second round, then reveal and stop
- One hardcoded target word; 40 candidate mines; 1 mine per Layer
- English Web Speech API on the Describer's phone only (Chrome/Safari iOS 17+)
- Heat = max of the two cosine similarities, mapped linearly to 0–100
- Scoring is a single result screen; no running totals

## Out of scope

Multiple rounds, role rotation, teams larger than 4, custom word packs, mine-count bidding, server-side ASR, non-English, spectator mode, reconnection recovery.

## Risks & unknowns

Mobile speech recognition quality in a loud room is the existential risk — a 5-second test gate at lobby join is mandatory. Embedding similarity may feel arbitrary ("why was 'boat' 70% of 'lighthouse'?"); needs hand-tuned thresholds and a post-round reveal showing the top-3 contributing words so the model feels fair. Haptics are unreliable on iOS Safari; the color bar must carry the signal alone.

## Done means

Four phones join a room from a code on the TV. A Layer buries SHIP; the Describer says "it warns boats at night"; the Describer's phone and only the Describer's phone shows heat crossing 60, the burying Layer's phone pulses fast, the Guesser's phone shows the transcript with no heat indicator whatsoever, and the TV shows the transcript. Crossing 85 ends the round with a detonation banner naming SHIP. Verified by opening all four clients side by side and diffing their WebSocket message logs for any leak of `heat` or `mineWord` to a client not entitled to it.
