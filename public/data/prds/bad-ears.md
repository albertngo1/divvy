## Overview
A 4-player, 2-minute cooperative shouting game in the Spaceteam lineage, for a living room with a TV and everyone's phone. Orders live on the wrong phone (classic Spaceteam), but the twist is the machine: each player's console is voice-actuated and each console is *deaf in a specific, private, discoverable way*. Getting a command executed means learning your teammate's hearing defect and deliberately mispronouncing into it.

## Problem
Spaceteam-likes exhaust their novelty in about eight minutes: once you learn the shape of "read the nonsense word aloud," the only escalation is speed. There's no skill curve and no discovery. The itch: a coordination game where the difficulty is *legible and learnable in-round*, so the room visibly gets better at each other during the round instead of just faster.

## How it works
Each player's phone privately shows: (a) their console — three controls with plain names (VALVE, PUMP, LATCH), (b) 1-2 outstanding ORDERS, each naming a control on *someone else's* console, and (c) a live "HEARD:" feed of what their own phone's microphone believes it heard.

A control only fires when that phone's own recognizer hears its name. But every phone carries a secret corruption profile applied to its transcript before matching: Voicing Flip (b↔p, d↔t, v↔f, g↔k), Fricative Loss (s/sh/th → h), Vowel Collapse (all vowels → uh). So shouting "VALVE" at a Voicing Flip phone yields FALF — nothing. You must say FALF to make it hear VALVE.

The loop is three-way: the order-holder knows *what*, the console owner owns the *ears* and is the only one who can see the misses, and the owner must coach — "it's turning my P's into B's, try it harder!" — while three other people do the same thing at the same volume.

The shared TV shows the machine, the order counter, a 120s clock, and an unattributed HEARD ticker of the last six garbled transcripts, so the room can reason collectively about the dialects in play.

## Technical approach
Host browser tab + phone PWAs + a PartyKit Durable Object per room (Socket.IO over Tailscale Serve as the LAN fallback). ASR is on-device (`webkitSpeechRecognition`), one recognizer per phone — this is why per-phone is load-bearing: the game needs to know which *console* heard it, not which room.

Data model: `Room { code, phase, clockEndsAt, players[], orders[], heardTicker[] }`, `Player { id, controls[3], profileId, ledger }`. Phones stream `{type:'heard', text, rms, seq}` at ~250ms. The server applies that player's grapheme substitution table, then fuzzy-matches (Levenshtein ≤1) against that player's control names, and broadcasts authoritative state at 20Hz.

Genuinely hard part: mic bleed. In a room of four shouting people, every phone hears everything, so a phone will fire on speech aimed at its neighbor. Mitigation: a lobby calibration step ("say your name") to set a per-phone RMS floor, plus a rule that a phone only accepts audio above that floor — which physically forces players to lean into the target handset. Second hard part: iOS Safari's recognizer stops on silence and needs a gesture-initiated restart loop.

## v1 scope
- One 120-second round, exactly 4 players, room code on the TV
- 3 controls per player, 8 total orders, one machine graphic
- Exactly 3 corruption profiles, assigned randomly, never rotating mid-round
- Grapheme substitution only — no phoneme engine
- Chrome/Android and Safari/iOS 17 only; no reconnection, no accounts

## Out of scope
Multiple rounds, difficulty ramp, profiles that mutate mid-round, spectators, scoring history, non-English, custom control vocabularies, TTS.

## Risks & unknowns
ASR accuracy at party volume may be too poor for the corruption to be the *interesting* failure — real misrecognition would mask designed misrecognition. Grapheme rules may not map cleanly onto how ASR actually spells shouted nonsense. Players may find the mispronunciation puzzle frustrating rather than funny if a profile is too aggressive; Vowel Collapse is the likely offender.

## Done means
Four real phones, one 120-second round: at least one control is fired by a player deliberately saying the *wrong* word, unprompted by the UI; cross-phone false fires ≤2 per round; and in post-play, at least three of four players can state their own console's defect in plain language.
