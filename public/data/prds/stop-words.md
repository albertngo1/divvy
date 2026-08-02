## Overview

A cooperative reconstruction game for 3–5 people in one room with a TV and their phones. The host tab runs a small language model over one secret sentence, measures the surprisal of every word in bits, and deals those words out to phones in **bands of information content** — not by position. The lowest band is grammar scaffolding ("the," "of," "was going to"). The highest band is the words that carry the entire joke. Nobody can read the sentence alone. You have to talk.

## Problem

Every "reconstruct the hidden text" party game splits information the boring way: by position, by turn, by who saw what first. Splitting by *entropy* produces a genuinely new social shape — one player is holding the skeleton and no meaning, another is holding meaning and no skeleton, and they physically cannot describe their halves in the same vocabulary. It also makes scoring honest: recovering "armadillo" should not be worth the same as recovering "the."

## How it works

1. Host draws a target sentence (12–20 words) from a deck. It appears nowhere on the TV.
2. Host tab runs one forward pass of a small causal LM, gets per-token logprobs, merges subword tokens into words, and sums bits per word.
3. Words are ranked by surprisal and split into N equal-count bands, one per phone, assigned at random.
4. **Each phone privately shows** the full sentence at true length with only *its own band's* words legible; every other word is a ▮ block of correct width. Each visible word is tagged with its bit value, so you know exactly how much of the score you personally are holding.
5. **The TV shows** only: the blank skeleton (all ▮), a 90-second timer, total bits on the table, and the submission field.
6. No screen-showing, no reading your words verbatim off the phone — you describe, negotiate, and argue aloud. The room agrees on one reconstruction and submits it.
7. **Score = bits recovered / bits available.** Nailing one rare noun beats recovering six function words. The TV replays the true sentence word by word, each word's bit value flying into the pot or greying out.

## Technical approach

PartyKit Durable Object per room, authoritative for round state; phones are thin PWA renderers with no model. Host browser tab owns the LM: `transformers.js` with a 124M–500M causal model on WebGPU, CPU/WASM fallback. Data model: `Round { sentenceId, wordSpans[{text, bits, band}], assignments{playerId→band}, submission, phase }`. Sync is trivial — the state is a few KB and changes on phase transitions only.

The genuinely hard part is not sync, it's two alignment problems. (a) Surprisal is per-BPE-token but masking must be per-word: merge tokens by leading-space boundary and sum their bits, or the mask leaks fragments. (b) Scoring a free-text guess needs word-level alignment between guess and target (`SequenceMatcher` over case-folded, punctuation-stripped, lightly stemmed tokens) so bits get attributed to the right word, tolerating a/the and plural slips.

## v1 scope

- 3 players + host, one round, one canned sentence, 90 seconds
- Fixed 3 bands, random assignment, no roles
- Deck of 12 hand-written sentences
- Bits-recovered percentage on one result screen
- Room code, no accounts, no reconnect

## Out of scope

Multiple rounds, player-authored sentences, scoreboards across rounds, hints, mobile model inference, spectators, any audio.

## Risks & unknowns

The lowest band may be pure stop words and contribute nothing — mitigate by making that player the scribe who owns clause structure and word count. Short sentences give too few words per band; enforce a 12-word minimum. Small-model surprisal on proper nouns is dominated by tokenizer weirdness. Talking may collapse into one loud player; 90 seconds is deliberately too short for that.

## Done means

Three phones join by code, each renders a different complementary mask of the same sentence, no phone shows a word another phone shows, the room submits one guess without showing screens, and the TV reports bits recovered with per-word attribution that a bystander agrees is fair.
