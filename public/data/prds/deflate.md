## Overview
Deflate is a once-a-day browser word game: you're given five required words and must compose a grammatical sentence containing all of them that compresses to the smallest possible size. Your score is the byte count after DEFLATE. For word-game people who found Wordle too easy and secretly want to feel entropy. Sparked by the Lobsters BWT / suffix-array compression post — it turns 'compressibility' from an abstract property into something you can chase.

## Problem
Compression is one of the most beautiful ideas in computing and almost nobody has a felt, intuitive sense of it. Meanwhile the daily-puzzle genre is saturated with guess-the-word clones. There's an unfilled niche: a puzzle that's genuinely educational about entropy while still being a 60-second shareable brag.

## How it works
Daily seed picks five required words (mix of common and rare). You type a sentence; a live meter shows current byte size as you type, updating every keystroke. The trick players discover: repetition compresses (reusing words, letter patterns, and structure shrinks the DEFLATE output), so the winning sentences become gloriously absurd — repetitive, alliterative, incantatory — while still needing to be valid English and contain all five targets. Par is precomputed; you get a Wordle-style shareable block showing your byte count vs. par and a global percentile. A grammar/validity gate (must contain all five words, must pass a lightweight acceptability check) stops trivial degenerate spam.

## Technical approach
Entirely client-side, static hosting. Compression: run the browser-native `CompressionStream('deflate-raw')` on the UTF-8 sentence, count output bytes — deterministic and identical for all players. Daily puzzle: date-seeded PRNG selects word set from a curated ~2000-word list; par is found offline by a beam-search optimizer (greedy repetition + template filling) and baked into the day's JSON. Validity: require all five target words present (case-insensitive, word-boundary), min sentence length, and a cheap coherence gate — a small n-gram language model or perplexity check via a tiny in-browser model (or just a stopword/structure heuristic in v1). Leaderboard: optional serverless function storing (day, byte-count, hash) for percentile. Hard part: designing the validity gate so the optimum is *repetitive-but-legal* — loose enough to reward cleverness, strict enough that pure `aaaa` spam is rejected.

## v1 scope
- One daily 5-word puzzle, date-seeded
- Live byte-size meter via CompressionStream
- Required-words + min-length validity check (no LM yet)
- Shareable result block with byte count and par

## Out of scope
- Global leaderboard/accounts
- LM-based coherence scoring
- Alternate algorithms (BWT/zstd) as difficulty modes

## Risks & unknowns
- Without a coherence gate, degenerate repetition may dominate and feel cheap
- Teaching moment vs. fun balance — could feel like homework
- CompressionStream browser support (Safari lagged); may need pako fallback

## Done means
On a fresh day, typing a valid five-word sentence shows a stable byte count, a more repetitive-yet-legal rewrite scores strictly lower, and the shareable block reproduces the same number on another browser — proving the score is deterministic and gameable.
