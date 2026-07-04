## Overview

Every phone in the room emits a low, sustained tone — a wall of foghorns. One phone is playing a note that is subtly off-key (say, 15 cents flat). Players walk around the room ear-to-phone-to-phone, then vote on which phone is the impostor. The per-phone architecture is the entire trick: the sound is *physically located* on that specific device, so identifying it requires walking up to each phone and listening. You cannot fake this with a shared speaker.

## Problem

"Guess the odd one out" is a classic children's game, but doing it with audio requires each odd-one-out source to be spatially separated. In person, you'd need a bag of tuning forks and a very quiet room. A shared TV can't do it — the sound has one origin. Per-phone Web Audio makes every player's device into a discrete audio source, turning the living room itself into the game board.

## How it works

Room code join, 3-10 players. Once everyone is in, host starts the round. Each phone begins playing a sustained sine (or gentle triangle) tone through its speaker at, say, 220Hz. One randomly-chosen phone plays 220Hz * 2^(-15/1200) instead — a tiny detune. Players walk around, holding phones up to their ears, comparing. After 60 seconds the tones cut and every phone shows a grid of all players' avatars — tap the one you think was off. Reveal, score. Rotate the impostor, next round.

## Technical approach

Web Audio API `OscillatorNode` on each phone, triggered by a synchronized WebSocket "start" event. Room state = `{round, impostor_id, base_freq, detune_cents, votes}`. The server assigns each phone either the base frequency or the detuned frequency in its personalized payload — the phone doesn't know if it's the impostor. Tones need `audioContext.resume()` on user gesture (round-start button). Volume normalization is important: iPhone/Android speaker output varies, so we ship a 3-second calibration tone before the round and let players tap "louder/quieter" to match.

## v1 scope

3-8 players, 3 rounds, single tone type (sine 220Hz), fixed 15-cent detune, 60-second listen phase, tap-to-vote, one impostor per round. No difficulty tiers, no chord modes, no scoring beyond round-by-round correct-guess counter.

## Out of scope

Multiple impostors, harmonic (chord) modes, rhythm variants, headphone modes, cross-room play (must be same physical space), audio waveform picker, custom base frequencies, streak scoring, tournament brackets.

## Risks & unknowns

Phone speakers are trash at low frequencies — 220Hz may be too low to actually reproduce cleanly on a phone speaker; may need to bump to 440Hz for audibility. 15 cents may be too subtle or too obvious depending on room acoustics and whether players have musical ears. Might need a "difficulty" slider (5c / 15c / 50c). If everyone crowds around one phone at once, the detuned phone gets identified by process of elimination (last one nobody's around) — may need a "hold your phone up" round rule.

## Done means

Four friends stand in a living room holding phones like ceremonial candles, walking to each other giggling. At least one round ends with the group confidently pointing at the wrong phone. If someone says "wait, play it again," v1 shipped.
