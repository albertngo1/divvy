## Overview

A 4-player forensic bluffing game. A passage from a public-domain novel is on the TV. Somewhere in it, four consecutive words were written by one of the players. The room has to point at the seam. The instrument that reveals seams — a small LM's per-token surprisal trace — has been deliberately smashed into four partial views, one per phone, and one of the people reading their view aloud is the person who put the seam there.

## Problem

Everyone now claims they can "tell when it's AI." Almost nobody can, and nobody has ever seen the actual signal their intuition is groping at. This puts the signal on the table as a physical object — jagged bars, a rolling average, the model's second-choice word — and then makes it a social problem, because no single instrument is sufficient and one instrument is held by a liar.

## How it works

**Phase 1 — forge (60s, fully private).** Each phone shows a *different* 70-word passage with one 4-word span blanked. You write a replacement span. Your private live meter shows your span's surprisal against the passage's own local band: *"you: 2.9 bits/word — this book runs 5.4–8.1 here."* Too flat and you read as machine-smooth; too spiky and you read as vandalism. You are trying to match **texture**, not meaning. Nobody sees your passage or your meter.

**Phase 2 — splice.** The server picks one player's passage at random, splices in their span, and puts the whole thing on the host screen with no marks. Only its author knows the passage is theirs and where the seam is. The other three know only that it isn't theirs.

**Phase 3 — instrument (3 min, talking out loud).** Each phone receives a *different* partial view of the same surprisal array:
- A: bar heights for content words only
- B: the model's top alternative word at each position, no numbers at all
- C: a 5-token rolling average curve, no per-word detail
- D: exact bit values for 20 randomly chosen tokens

No view locates the seam alone. You must read yours aloud. The author reads theirs aloud too, wrongly.

**Phase 4 — commit.** The room votes on phones for one contiguous 4-word span. Right: 3 points to each non-author. Wrong: 5 to the author.

## Technical approach

Host tab runs distilgpt2 via transformers.js/WebGPU; one forward pass over ~90 tokens is trivially fast, so the spliced passage is scored at display time. Durable Object state: `{passages[4], submissions{}, chosenIdx, tokens[], logprobs[], viewSpec{playerId → mask}, votes{}}`. Critically, **views are derived server-side** — each phone receives only its own masked slice, never the full array, so opening devtools buys nothing.

The genuinely hard parts: (1) partitioning that is provably insufficient alone and sufficient together — this needs tuning against real logprob traces, not vibes; (2) the phase-1 live meter, which needs per-keystroke scoring against a cached KV prefix of the passage's left context, on the host, for four writers at once; (3) baseline normalization — per-book perplexity varies enormously, so bands must be per-passage z-scores, never absolute bits, or every player just writes to hit 6.0.

## v1 scope

- Exactly 4 players, 4 hardcoded passages, 4 hardcoded view types.
- One round, one splice, one vote, reveal, stop.
- 4-word spans, contiguous, span selection by tapping the first word on your phone's copy of the text.

## Out of scope

Variable player counts, an all-AI "no human span" bluff round, score history, on-phone inference, custom passage upload, rematch.

## Risks & unknowns

- A tiny LM may not separate a careful human span from Dickens at all. Needs a pilot on real traces before anything else is built; if the signal is weak, spans go to 6–8 words.
- With 4 players the author is 1-of-3 by elimination, but the score is on WHERE not WHO, so this is survivable — worth confirming it doesn't collapse the tension.
- Surprisal bars are hostile on a phone screen; view B (alternative words) may end up carrying the whole game.

## Done means

A room that has never seen a logprob finds the seam in a passage none of them has read, and at least one player says "wait — that bit's too smooth" while pointing at the right four words.
