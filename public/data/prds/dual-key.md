## Overview

Dual Key is a 3–4 player cooperative real-time voice game for a TV plus phone controllers. The room is a two-key authorization console — missile silo, reactor scram, vault, pick your fiction — and every order requires two specific people to turn their keys and speak the same phrase in genuine unison. For groups who love Spaceteam but want a game where your mouth is the hazard, not the tool.

## Problem

Spaceteam-lineage games reward one behavior: shout everything, louder and faster. There is never a reason to be careful with your voice. The itch is a real-time voice game where speech is *dangerous* — where you must transmit information you are forbidden to say, and where the payoff is a synchronized human utterance rather than a button press.

## How it works

Four orders exist. Each is one phrase split in half: an ACTION half ("VENT THE SCRUBBER") and a PARAMETER half ("TO NINE DEGREES"), dealt to two different phones. Order IDs ("7-BRAVO") are public and safe to say aloud. The **assembled full phrase is forbidden** outside a key window.

Privately, each phone shows: your key number, your two halves and their order IDs, a big TURN KEY (push-to-talk) pad, and a red BURN RISK dot when your own mic is hot near your mouth. You are *not* told who holds the other half — you find them by calling order IDs across the room.

The shared TV shows only: four order slots with status (PENDING / VOID / EXECUTED), a live KEYS TURNED 0/2 lamp, a three-minute clock, and a scrolling burn log. It never shows phrase text.

To execute: both half-holders hold TURN KEY with ≥400 ms overlap and both speak the complete phrase inside that overlap. Both transcripts fuzzy-match → EXECUTED. If any phone's always-hot mic transcribes the full phrase *outside* a valid window, that order VOIDs permanently and the TV names who burned it and replays the one-second clip. So teammates trade halves freely, but nobody can safely recite the whole thing to check — the first complete utterance has to be the synchronized one. Win: three of four orders in three minutes.

## Technical approach

Room = one Durable Object (PartyKit). Model: `Room { orders[{id, action, param, holders[2], status}], keys[], clockEnd }`. Each phone streams 16 kHz Opus over WS plus a 100 ms RMS envelope; server runs faster-whisper tiny.en per stream with token-level fuzzy phrase-spotting (normalized Levenshtein ≤ 0.25).

The genuinely hard part is cross-talk attribution: every mic hears every mouth, so a naive burn detector blames the wrong phone. Fix: an utterance is credited or blamed only to the stream whose 300 ms windowed RMS exceeds every peer's by ≥6 dB after lobby calibration. Second hard part is retroactivity — ASR lands 400–700 ms late, so the server keeps a 3 s ring buffer of key-window events and re-evaluates each transcript against server-timestamped, RTT-normalized windows before committing a burn.

## v1 scope

- 3 players, exactly 4 hand-authored orders, one 3-minute round
- Fixed room code, no lobby art, no avatars
- Server-side ASR only (no on-device), English only
- Burn log + unison success are the only two feedback events

## Out of scope

- Multiple rounds, difficulty ramp, scoring/leaderboards
- Procedurally generated phrases
- Spectator view, reconnect handling beyond a hard pause

## Risks & unknowns

- iOS PWA mic capture in a backgrounded/locked tab
- Party-volume overlapping shouting may defeat both ASR and the 6 dB margin
- False burns feel unjust; mitigated by requiring ≥0.85 match confidence and playing the incriminating clip on the TV

## Done means

Three people in a real living room execute at least one order through an actually simultaneous utterance, and at least one order burns from a solo recitation, with the TV naming the correct culprit. Verified against a video recording where a human judge agrees with the server's burn call in 9 of 10 events.
