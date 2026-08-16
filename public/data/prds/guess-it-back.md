## Overview
An explorable explanation that turns into a working toy codec. You are shown a passage one character at a time and must guess the next letter; the app records how many guesses each character took, plots your bits-per-character against gzip, an order-5 PPM model, and Shannon's famous ~1.1 bits/char human bound. Then it flips: it uses your guess ranks *as* the compressed file, so decoding requires a human predictor who thinks like you. For anyone who has read "compression is prediction" three times and still doesn't feel it in their hands.

## Problem
Everyone repeats that compression and prediction are the same thing, and almost nobody has felt it. The Shannon guessing experiment is the cleanest demonstration ever devised and it exists only as a 1951 paper and a few static charts. Meanwhile every modern demo of the idea is a language-model wrapper that hides the mechanism behind an API call.

## How it works
1. Pick a text (paste, or a Gutenberg passage). Characters reveal left to right.
2. Type your guess for the next character. Wrong? Guess again. The app stores the rank *r* at which you got it (1 = first try).
3. A live chart draws per-character cost bars: rank 1 is nearly free, rank 9 is expensive. A running curve shows your cumulative bits/char versus gzip, versus PPM, versus 1.1.
4. Divergence mode makes it bearable: type freely like a typing test; the app silently consumes correct characters as rank 1 and only stops you where you diverge, then asks for alternates until you land.
5. Codec mode: encode a short private note by guessing your way through it. The artifact saved to disk is the arithmetic-coded rank sequence. Opening it launches the interactive decoder, which asks *you* to guess and reveals the character sitting at the recorded rank. Guess like a stranger and you get gibberish.

## Technical approach
TypeScript + React, canvas/D3 for charts, no server. Base model: an order-5 PPM-C context model compiled to WASM (or a hand-written escape-mechanism PPM in TS — it only needs to rank ~60 candidates per position, not be fast). Ranks come from the base model's ordered candidate list, so encoder and decoder share a deterministic vocabulary; the rank stream is then arithmetic-coded under a fitted geometric-ish distribution of *your* rank hits (stored in IndexedDB as a profile). Entropy readout uses Shannon's upper/lower bounds from the rank histogram, not a point estimate. gzip baseline via CompressionStream; PPM baseline from the same WASM module. The hard part is UX: naive char-by-char guessing is agonizing, so divergence mode plus a rank-inference heuristic (when you type three correct chars in a row, backfill rank 1) is what makes a 300-character passage take two minutes instead of twenty.

## v1 scope
- One 200-character passage, keyboard guessing, rank recording
- Bits/char curve versus gzip only
- Rank histogram + Shannon bound readout
- No codec, no profile, no accounts

## Out of scope
- Any LLM-based predictor
- Multiplayer or leaderboards
- Non-English text, or byte-level (non-character) modeling

## Risks & unknowns
Boredom is the real failure mode — if guessing feels like a chore the punchline never lands. Rank inference in divergence mode may bias entropy downward; needs a validation run against strict char-by-char mode. Decoder determinism breaks instantly if the PPM implementation changes between sessions, so the model version must be embedded in the file header.

## Done means
A stranger loads the page, guesses through 200 characters in under three minutes, sees a number under 2.0 bits/char while gzip sits above 3.0 — and can hand a 40-character encoded note to a friend who fails to decode it.
