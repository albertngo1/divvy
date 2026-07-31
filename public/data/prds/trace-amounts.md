## Overview
Trace Amounts is a 4-player mingling game for a standing room. Each phone continuously emits its own near-ultrasonic tone (17.5-19.0 kHz, four slots 500 Hz apart) and simultaneously listens. Your phone privately tells you your dose from one specific tone — your allergen — and your accumulation of another — your tonic. You never learn whose tone is whose. The room becomes a proximity graph you can only feel, one meter reading at a time.

## Problem
Proximity party games usually settle for 'get near the target,' which one shared phone could arbitrate. And most mic-based games use loudness as a crude distance proxy from a single beacon. The itch: a game where every phone is a transmitter AND a receiver at once, where the hidden information is which frequency you care about, and where the only way to resolve the ambiguity of a crowd is to physically take one person aside — while they are trying to do the same thing to someone else.

## How it works
Deal (5s): each player is secretly assigned an emit frequency, an allergen frequency (someone else's), and a tonic frequency (someone else's). Assignments form a derangement so nobody is their own anything, and one player is deliberately both a tonic and an allergen to different people.

Round (90s): the phone shows two bars only — a red RASH bar filling from allergen dose and a green bar filling from tonic dose — plus the instruction to keep the phone out of your pocket, screen up. It never names anyone. Standing in a huddle of three makes the rash bar climb with no clue which body caused it, so the play is to walk one person to a corner, watch, and walk them back. Everyone is doing this concurrently and refusing to be led, and the person clinging to you may be the person someone else is fleeing.

The host TV shows only an ambient room-wide health bar and the timer — never per-player dose, never a proximity map, or deduction collapses.

Guess (20s): each phone privately names its suspected allergen. Score = tonic accumulated - rash accumulated + 3 for a correct guess. TV reveals the true allergy graph as arrows.

## Technical approach
Host tab plus phone PWAs, authoritative PartyKit / Durable Object. Emission via a WebAudio OscillatorNode at the assigned frequency; reception via getUserMedia with echoCancellation:false, noiseSuppression:false, autoGainControl:false — non-negotiable, since browser AEC and noise suppression will erase a steady 18 kHz tone. Detection is a Goertzel filter per target bin inside an AudioWorklet, not a full FFT, at 48 kHz.

The genuinely hard part is self-deafening: your own speaker floods your own mic at 40+ dB above anything you want to measure. Solution is a 1 Hz TDMA frame with four 200 ms emit slots; each phone emits only in its slot and measures only in the other three. That requires cross-phone clock alignment, done with NTP-style offset estimation over WS ping/pong (median of 20 round trips) and a 40 ms guard band, resynced every 10 s. State: {players: [{id, emitHz, allergenHz, tonicHz}], phase, doses}. Phones send a 5 Hz summary of per-slot dB; the server integrates dose so a phone cannot fake it.

## v1 scope
- Exactly 4 players, 4 fixed frequencies, one 90 s round
- Two bars and one guess screen; no names anywhere on the phone
- Fixed 1 Hz TDMA frame, no adaptive slot assignment
- Per-phone dB normalized against a 3 s silent-room calibration at join

## Out of scope
- More than 4 players (frequency slots run out fast under speaker rolloff)
- Directionality, mapping, or any use of the second mic
- Rounds, elimination, or role reveal beyond the final arrow graph

## Risks & unknowns
- Phone speaker output above 18 kHz is weak and wildly device-dependent; may need a per-device gain probe at join
- Some teens and most dogs can hear 17.5 kHz; needs a warning on the join screen
- Pockets, hands over the speaker, and body shadowing add 20 dB of noise that may swamp the proximity signal

## Done means
Four phones join, calibrate, and lock a common TDMA frame within 3 s; with two phones held together and the other two across the room, the correct rash bar rises measurably faster than a control bar; a full 90 s round ends with at least one player correctly identifying their allergen, and the TV renders the true allergy arrows.
