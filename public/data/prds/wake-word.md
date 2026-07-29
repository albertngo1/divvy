## Overview

Wake Word is a 3–4 player cooperative panic game for a TV plus phone PWAs. Every phone is a fake smart speaker with a **private wake word** and a **private pair of skills**. The room has 90 seconds of chores to clear, and one rule breaks everything: *a speaker never obeys its own owner.*

## Problem

Spaceteam's joy is "I have the instruction, you have the control." But addressing is trivial there — you yell into the room and hope. Real voice interfaces fail in a funnier way: you have to name the right device, pronounce it correctly, and there are three others in earshot with confusable names. Nobody has built the party game where the *addressing itself* is the puzzle and misfires land on real hardware in someone else's actual hand.

## How it works

**Host TV (shared):** a chore queue — TIMER 40, DIM TO 3, PLAY TRACK 7 — with a countdown, plus one tile per player showing only a status light (idle / listening / firing / errored). Never the wake words, never the skills.

**Phone (private):** your wake word ("okay PARSNIP"), your two skills (TIMER, LIGHTS), and a tap-panel used *only* to finish a command that has already fired at you. Confusable pairs are dealt deliberately: PARSNIP/PARSLEY, MARLOW/HARLOW.

Since your own device won't answer you, the loop is forced: announce your wake word and skills aloud, watch the queue for chores you *can't* do, and shout them at whoever can. Everyone does this simultaneously. Sloppy pronunciation fires the wrong phone; its owner gets a chore they have no skill for; the chore burns.

## Technical approach

One PartyKit Durable Object per room. Phones run continuous Web Speech recognition (interim results) plus a Web Audio RMS meter at 20 Hz, streaming (a) fuzzy wake-word candidates with confidence and timestamp, (b) the loudness envelope.

The server attributes the *speaker* by argmax RMS over a 400 ms window — a held phone is 10–20 dB hotter for its own owner than for anyone else. Fire rule: candidate word W at t → device D(W); if attributed speaker == owner(D), reject with an audible buzz ("I don't take orders from you"); otherwise D enters FIRING with a 6 s TTL and its completion panel appears. If two devices match inside the window, the server picks by confidence and fires exactly one — misfires are preserved, not charitably resolved.

Model: `Room {phase, clock, chores[], devices[{id, wakeWord, skills[], state, ttl}]}`, `Chore {id, skill, param, state, firedOn}`. Authoritative 10 Hz snapshots plus immediate event fanout; phones are optimistic only on their own taps.

Hard part: wake-word spotting when three people are shouting near-identical words. Mitigations: a tiny closed vocabulary, double-metaphone fuzzy matching over interim transcripts, and requiring the match to come from the *loudest* phone — attribution from the mic array, not the audio content.

## v1 scope

- 3 players, one 90-second round, 6 chores
- 4 hand-authored wake words, exactly one confusable pair
- Three chore types: TIMER (say a number), DIM (1–5 slider), PLAY (1 of 4 icons)
- Own-owner rejection with a buzz
- TV: queue, clock, status lights, final cleared/burned card
- 4-letter room code, no accounts, no reconnect

## Out of scope

Multiple rounds, cross-round scoring, custom or generated wake words, TTS talkback, saboteur roles, 5+ players, spectator view.

## Risks & unknowns

- iOS Safari continuous recognition is flaky; fallback is a hold-to-shout button opening a 1.5 s recognition burst.
- RMS attribution degrades if a phone is on the table — onboarding must force "hold it."
- One confusable pair may already be too punishing; tunable.
- Probably only legible after one bad round; needs a 20 s TV tutorial.

## Done means

Three people, three phones, one TV: within 30 seconds of scanning the code they are shouting vegetables at each other. At least one chore completes on the correct device after being verbally routed, at least one misfire lands on the wrong phone, and the TV shows a final tally. Nobody touches a phone except to finish a chore that already fired.
