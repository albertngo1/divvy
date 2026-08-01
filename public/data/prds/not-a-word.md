## Overview

A 4–6 player co-op for a TV plus phones. The room has 90 seconds to solve a small shared arrangement puzzle. **Volume is unregulated. Vocabulary is.** Every phone runs on-device speech recognition on its own near-field mic; grunts, hums, whistles, claps, sighs and beatboxing are all free, forever. A recognized *word* is a transaction. For groups who like Codenames-shaped constraint-merging but want the constraint to be physical and stupid.

## Problem

Every "be quiet" party game measures loudness, which degenerates into a whisper contest and punishes the single best thing that happens at a party — laughing. Measuring *lexicality* instead inverts it: you can scream, you just can't mean anything. And co-op party games almost never make the **cost of coordinating** into the game itself.

## How it works

The **host TV** shows six empty numbered slots, twelve tiles (fish, ladder, moon…), a live "The Record" ticker of every word spoken with the speaker's name, and the group score.

Each **phone privately** shows three things nobody else sees:
- **Two constraints** on the final arrangement ("the fish is left of the ladder", "slot 4 is red"). No player holds a solvable set alone; the union is exactly solvable.
- **Your word price**, dealt secretly: 1, 2, 3 or 4 points per word.
- A **drag tray**. Any phone may move any tile at any time. All six phones drag simultaneously into the same board; the TV reflects every move instantly.

Group score = 100 − (5 × total words the room spoke). Your score = group score − (your price × your own words). So somebody must break the silence to unstick the puzzle, and that volunteer eats the cost personally while everyone banks the benefit. A 1-price player *should* be the room's mouthpiece — but announcing that requires words, and once known you get volunteered for everything. The 4-price player learns to point.

Round ends on LOCK or timeout. The TV replays the transcript as a found poem: "no — WAIT — other one — not that —".

## Technical approach

Authoritative Durable Object per room. State: `{tiles[], slots[], constraints{playerId→[2]}, prices{playerId→int}, wordLedger[]}`. Tile moves are last-write-wins with a server seq counter; phones render optimistically and reconcile.

ASR runs **on the phone**, never on the server: Web Speech API where available, Vosk-small WASM (~40 MB, cached by the PWA) as the fallback for iOS Safari. The phone posts `{word, confidence, rms, onsetMs}` — audio never leaves the device.

The genuinely hard part is **attribution**. Every phone hears every speaker, so one word arrives 4–6 times. Winner-take-all: bucket claims into 700 ms windows keyed by normalized text, award to the phone with highest RMS and earliest local onset (clock offsets estimated by WebSocket ping-pong). Accept only confidence ≥ 0.75 and ≥ 2 characters, so "uh", "mm" and laughter stay free — which is the whole aesthetic.

## v1 scope

- One round. Four players. 90 seconds.
- Six slots, twelve tiles, hand-authored constraint set (three puzzles total).
- Word prices dealt from [1,2,3,4].
- Android Chrome / desktop Chrome only; Web Speech API only.
- The Record ticker + end-of-round transcript replay.

## Out of scope

Multiple rounds, scoring across rounds, iOS/Vosk fallback, generated puzzles, non-English, spectators, reconnect.

## Risks & unknowns

ASR latency (400–900 ms) makes the ticker feel laggy — may need an instant "⚠ someone spoke" flash before the word resolves. Cross-talk attribution could misfire in a loud room and blame the wrong person, which is funny once and infuriating twice. Players may discover that whispering defeats the ASR entirely — a mandatory floor (whispers below X dB count as words) may be needed.

## Done means

Four phones in one room, one puzzle, 90 seconds: every spoken word appears on the TV attributed to the right person ≥90% of the time; no word is double-charged; the room solves it or fails it; and at least one playtester visibly stops themselves mid-syllable.
