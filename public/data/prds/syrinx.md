## Overview
Syrinx is a once-a-day, 60-second browser game for birders, language nerds, and anyone who liked Wordle. Each day it plays a short snippet of a real bird's song, then asks: which of four continuations is the *real* rest of the song? Three are AI-shuffled fakes that break the bird's grammar. It reframes the HN 'zebra finch language decoded' finding — that birdsong has learnable syntax — as a competitive daily puzzle instead of a research curiosity.

## Problem
Birding apps (Merlin, BirdNET) do species ID *for* you — you point, they answer, you learn nothing about how a song is actually structured. There's no fun, repeatable way to build intuition for the grammar of a song, and no social hook that makes people come back daily.

## How it works
Each species' song is a sequence of syllable 'motifs' (A-B-B-C...). The daily puzzle plays the first ~60% of one real recording. You then hear four full-length candidates: the true recording and three decoys built by re-ordering or substituting syllables in ways that violate that species' observed transition statistics. Pick the real one. Get a streak, a shareable emoji-spectrogram result (🟩⬛🟩...), and a global daily leaderboard by solve time. A 'why' panel afterward shows the real vs. broken transition graph.

## Technical approach
Stack: static site + Cloudflare Worker + tiny KV store. Source audio from the **xeno-canto API** (huge CC-licensed birdsong corpus, `xeno-canto.org/api/2/recordings`). Preprocess offline: run **BirdNET-Analyzer** to confirm species, then segment syllables via spectrogram energy peaks (librosa: mel-spectrogram → onset detection). Build a per-species first-order Markov model of syllable transitions from many recordings. Decoys = resynthesized syllable sequences (concatenate real syllable audio clips) that maximize deviation from the true transition matrix while staying same-length. Store one precomputed puzzle per UTC day as a JSON manifest + 4 audio clips in R2. The genuinely hard part: making decoys that sound *plausible* to a novice but truly break grammar — too obvious and it's trivial, too subtle and it's luck.

## v1 scope
- 10 hand-vetted species, 30 precomputed daily puzzles
- Play snippet, 4 audio choices, one guess, reveal
- Streak counter in localStorage + shareable text result

## Out of scope
- Live leaderboard/accounts (fake it with localStorage first)
- User-uploaded recordings; rare/regional species
- Full second-order grammar models

## Risks & unknowns
- Syllable segmentation quality varies wildly by recording noise
- Decoys may be distinguishable by audio artifacts, not grammar (players cheat the seams)
- xeno-canto attribution/licensing must be surfaced per clip

## Done means
A stranger loads the page, hears a snippet, picks among four, sees whether they were right and a grammar-graph explanation, and can share a spoiler-free result — with a different puzzle appearing the next UTC day.
