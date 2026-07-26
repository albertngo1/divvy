## Overview

A 3–4 player, 90-second speed game where **volume trades against vision**. Your phone flashes your target word for two seconds, then goes black. Banking it requires whispering with the phone pressed to your lips — verified by the actual *proximity effect*, the low-frequency boost a mic gets when you're close. So the room becomes four people hunched over their phones, muttering blind like spies.

## Problem

Whisper games are almost always just "be quiet, we'll score you on it" — the mic is a meter bolted onto an unrelated game. Here quietness is inseparable from a real cost: the only way to speak quietly enough to be *heard by your own phone* is to hold it where you cannot read it. The constraint enforces itself with geometry.

## How it works

- **Host TV (shared):** a 12-tile MANIFEST grid of simple nouns with icons, a room NOISE GATE bar, and per-player banked counts. Claimed tiles grey out live.
- **Each phone (private):** one target at a time, drawn from the manifest, shown for exactly 2.0 s — then the screen blanks to black. Nothing to read. Whisper the word into the phone at your lips; on a valid bank the next target flashes for 2.0 s and blanks again.
- **Enforcement:** the phone accepts a bank only if the audio is *close-and-quiet* — high 80–300 Hz / 300 Hz–3 kHz band ratio at low absolute RMS. Speaking loudly from arm's length so you *can* read your screen has the wrong spectral tilt: voided, and flagged as a SHOUT on the TV.
- **Reward silence, collectively:** if aggregate room level crosses the gate threshold — a laugh, a normal-voice "wait, what?" — the gate slams for 3 s and **nobody** banks. The room self-polices into muttering.
- **Contention (why per-phone matters):** targets come from one shared manifest and two players can hold the same tile. First valid whisper claims it; the loser's phone silently re-deals. So you may be blind-whispering a word that became worthless a second ago, and the only way to find out is to stop and look — surrendering your mouth to save your eyes.

## Technical approach

Host tab + phone PWAs + a Durable Object holding `Manifest[{tile, claimedBy}]`, `gate {closedUntil}`, and `Player {id, currentTarget, banked, tau, floorDb}`. Word matching uses on-device Web Speech API with a 12-word candidate set (accept top-3 alternatives), gated by a WebAudio classifier: frame RMS plus band ratio, with τ calibrated per phone during a 2-sample enrollment ("say *apple* at your lips", "say *apple* at arm's length").

Hard parts: (1) **crosstalk** — your phone transcribes your neighbour's whisper too, and the fix is the same tilt test, since a neighbour is by definition far. Each phone must judge only its owner, on physics rather than content. (2) **ASR latency** — banking must feel instant (<1.5 s) while claims are server-authoritative, so phones send a provisional claim on local match and the DO arbitrates ties by receive order. (3) iOS Safari SpeechRecognition is unreliable; documented fallback is degraded (voice-activity + syllable-count match against the target).

## v1 scope

- 3 players, one 90-second round, one 12-tile manifest of nouns.
- 2.0 s reveal, blank screen, whisper-to-bank, re-deal on loss.
- One global noise gate, 3 s penalty, no per-player noise scoring.
- Final screen: three banked counts and a SHOUT tally.

## Out of scope

Rounds, scoring history, phrases longer than one word, difficulty tiers, reconnects, avatars, non-English words, accessibility mode for mute players.

## Risks & unknowns

- τ may not separate close-quiet from far-loud on cheap mics with AGC forced off; may need a third enrollment sample.
- Players will discover they can cup the phone and speak loudly — needs an absolute RMS ceiling regardless of tilt.
- Blind muttering may just feel frustrating rather than funny at 90 s.
- Hygiene: phones at mouths. Real objection for shared devices.

## Done means

With 3 phones: a word whispered with the phone at the lips banks in under 1.5 s; the same word at normal volume from arm's length is rejected as SHOUT and trips the gate for 3 s; a neighbour whispering your target never banks on your phone; a contested tile banks for exactly one player and re-deals on the other within 300 ms. The round ends with three counts on the TV.
