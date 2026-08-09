## Overview

A 3–4 player cooperative game about redundancy in speech. The host laptop listens to the room and transcribes it. Each phone shows that live transcript with roughly half the words blacked out — a *different* half per phone. Players must pass private facts to each other out loud, knowing the channel eats their words, and knowing it eats different words for every listener.

## Problem

Voice party games treat the mic as a button (loud/quiet, push-to-talk). Almost none treat speech as a *lossy channel* you have to engineer around. The genuinely funny human behavior — repeating yourself, spelling things, saying "four, as in the one after three" — never gets designed for. This makes that the whole game.

## How it works

One 120-second round. Each phone PRIVATELY holds two things:

- A FACT: a short payload only you can see — "valve pressure is 47", "the crate is MAROON".
- A SLOT: a blank labeled with someone else's fact — "valve pressure: ___" — which you fill by tapping a keypad or a color grid.

Nobody knows whose slot needs whose fact; you find out by talking. The rest of your phone is a scrolling live transcript of everything said in the room, with ~50% of words replaced by ▮. Your mask is yours alone, re-rolled per word by `hash(word_index, playerId)`, so "forty-seven" may survive for Ravi and vanish for Sam — and the two of them can compare holes out loud to reconstruct it, which is exactly the emergent play we want.

The host TV shows no transcript. It shows the clock, how many slots are filled, and a live GARBLE METER: what fraction of spoken words survived to at least one listener. Talking over each other tanks it, because the recognizer drops overlapped speech entirely.

Submitting a wrong slot value costs 15 seconds. Win = all slots correct before the clock dies.

## Technical approach

One Web Speech API `SpeechRecognition` instance in the host Chrome tab (continuous, interim results on) — the only ASR in the system, using the laptop's decent mic. Interim tokens stream to a PartyKit Durable Object, which assigns each finalized word a monotonic index and fans out per-player masked arrays: `[{i, w: "forty"} | {i, w: null}]`. Phones render ▮ for nulls. Raw audio never leaves the host tab.

Data model: `facts{playerId: payload}`, `slots{playerId: {label, ownerId, value}}`, `wordLog[]`, `masks` derived (not stored) as `sha1(i + salt + playerId)[0] % 100 < 50`.

The hard part is that ASR interim results *rewrite themselves* — "for tea seven" becomes "forty-seven" 400 ms later. Rewriting a word that a player already saw masked would let them peek by watching flicker. Fix: mask only on finalization, show interim text as a dimmed unmasked ghost line that is explicitly labeled unreliable, and freeze indices at final. Second hard part: ASR mangles numbers under crosstalk, which is a feature until it's a wall — hence the 15 s wrong-answer penalty rather than instant loss.

## v1 scope

- 3 players, one 120-second round
- One fact and one slot each, drawn from ~12 hand-written pairs (numbers 10–99, six colors)
- Fixed 50% mask rate, no difficulty curve
- Host TV: clock, filled count, garble meter
- Chrome-only host; phones need no mic permission at all

## Out of scope

On-phone ASR, non-English, multiple rounds, chained facts (A needs B needs C), scoring, spectators, reconnects.

## Risks & unknowns

Room-scale ASR accuracy on a laptop mic with 3 people talking is the existential risk — if it's under ~60% word accuracy, the mask is redundant and the game is just noise. Pre-test with a fixed script before building anything else. Web Speech API's Chrome implementation also drops the stream after long silences and needs restart-on-`end` babysitting.

## Done means

Three players in one room fill all three slots correctly inside 120 seconds, and a recording shows at least one fact being successfully passed only after the speaker rephrased or spelled it in response to a listener saying "I've got a block where the number is."
