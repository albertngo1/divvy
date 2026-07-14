## Overview
Handshake is a phone-native riff on the classic free word game **Contact**, for 3–6 players around a TV. One player is the Wordmaster who secretly holds a word; everyone else races to independently converge on the same guess and reveal it in sync.

## Problem
Contact is a brilliant living-room game hobbled by its honor system: two players must whisper-count and blurt a word *at the same time*, table-talk leaks the answer, nobody can prove who had it first, and the Wordmaster can't fairly "block." All of that friction is exactly what a private phone per player and an authoritative clock fix.

## How it works
The Wordmaster picks a secret word (host suggests one). The host TV shows only the revealed prefix, starting with the first letter (e.g. `P`). Each guesser, on their **private** phone, silently types a candidate word longer than the prefix, then a short **clue** for it (a definition, never the word). Clues post to the shared TV to invite others; candidate words stay secret. When two or more phones have independently entered the *same* normalized word, the server fires a **HANDSHAKE**: those phones buzz, the TV shows a 3-2-1, and the contactors blurt the word aloud together. Meanwhile the Wordmaster gets a private **block window** — their phone warns a handshake is forming (but not the word) and lets them type a block guess. If the block matches, it's swatted and no letter is revealed; if the contactors match and the Wordmaster misses, the next letter is exposed and the prefix grows.

Private per phone: your tentative candidate, your buzz, whether you're inside a forming handshake, the Wordmaster's block field. Shared TV: prefix, posted clues, handshake countdown, revealed letters.

Load-bearing: the whole thrill is discovering you and someone else *secretly* thought of the same word. That demands private, simultaneous guessing — a single passed phone destroys both the secrecy and the sync.

## Technical approach
Host tab + phone PWA + authoritative WS server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { word, revealedLen, wordmasterId, candidates:{playerId,text,ts}, clues:[] }`. On each candidate submit the server normalizes (lowercase, strip plural `s`, must match prefix, len>prefix) and buckets it; when a bucket hits ≥2 it locks that bucket and opens a 4s handshake state, notifying contactors and the Wordmaster's block field. Resolution compares block text vs bucket word. The genuinely hard part is the race: authoritative server timestamps, locking a handshake bucket so late identical submits don't muddy the resolution, and a normalization rule permissive enough that near-spellings match but tight enough that garbage doesn't.

## v1 scope
- 3 players: 1 Wordmaster, 2 guessers
- One fixed 6-letter word from a hardcoded list
- Private candidate + one clue broadcast to TV
- One handshake detection, one block window, one letter reveal

## Out of scope
- Multiple simultaneous handshakes, synonym/plural fuzzy matching beyond a simple rule, definitions lookup, teams, full games, scoreboards, keyboard polish.

## Risks & unknowns
- With only 2 guessers, convergence is rare — the clue-broadcast step is essential and must be in v1.
- Normalization edge cases (plurals, tense) can create false or missed handshakes.
- Timing fairness of the block window vs the countdown.

## Done means
Three phones join; Wordmaster picks `PLANET`; both guessers independently type it after seeing each other's clues; server fires the handshake, both blurt, Wordmaster's block `PLASMA` fails to match, TV reveals the next letter — reproducibly in one round.
