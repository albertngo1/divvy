## Overview
A rewriter that compresses arbitrary prose into a fixed, tiny vocabulary — Ogden's Basic English (850 words), the Thing Explainer list (1000), ASD-STE100 Simplified Technical English (~900, mandatory in aerospace maintenance manuals), or Toki Pona (137) as the stress test — using **error diffusion** rather than nearest-word substitution. For technical writers under controlled-language mandates, health-literacy editors, ESL material authors, and constrained-writing hobbyists.

## Problem
Every plain-language tool does the same thing: for each hard word, pick the closest allowed word, independently. That is thresholding, and it produces the text equivalent of banding — every specialist term collapses to "thing", "make", "use", and the accumulated meaning loss is invisible because each local swap looked defensible. Nobody tracks the residual.

## How it works
Generate left-to-right, constrained to the allowed vocabulary. Maintain a residual vector `r = E(source prefix) − E(output prefix)` in a shared sentence-embedding space: what you meant to say minus what you have actually said. Bias the next token choice toward `target + α·r`, and spread `r` across the next three slots with Floyd–Steinberg-style weights (7/16, 5/16, 4/16). Concretely: dropping "photosynthesis" leaves a large residual that the next words repay as "sun", "food", "leaf". The UI is side-by-side source/output with a heat overlay per word showing residual magnitude (a literal banding meter), an α slider from 0 (plain nearest-word) to 1 (full diffusion), and a cumulative drift chart down the paragraph.

## Technical approach
Python service + a single static HTML page. Constrained decoding via llama.cpp with a GBNF grammar generated from the vocabulary list (plus inflections from `lemminflect`), so the model physically cannot emit an out-of-vocab token. Beam search, width 8; beam score = `logprob + λ·cos(E(out_prefix), E(src_prefix) + α·r)`. Embeddings from `gte-small` or `all-MiniLM-L6-v2`, re-embedded per beam step (cheap at paragraph scale, cache aggressively). The genuinely hard part: sentence-embedding space is not linear enough for honest vector subtraction, so the residual drifts into nonsense at high α. Fallback that likely wins: a discrete **meaning-debt ledger** — extract source content words, track which are still unexpressed, and apply an NMT-style coverage penalty to beams that leave debts unpaid. Ship both and let α select between them.

## v1 scope
- One vocabulary (Ogden 850), English only, one paragraph at a time
- CLI (`carry --alpha 0.6 file.txt`) plus one HTML demo page
- α slider, per-word residual heatmap, total drift number
- Nearest-word baseline built in for comparison

## Out of scope
Editor plugins, other languages, ASD-STE100's grammar rules (vocabulary only), real-time typing.

## Risks & unknowns
Diffusion may not beat thresholding at all; grammar-constrained decoding can degenerate into repetition; residual arithmetic may be pseudo-science dressed as signal processing.

## Done means
On 50 Wikipedia lede paragraphs, rewrite each with α=0 and α=0.6 at identical vocabulary compliance, then have a judge model answer three comprehension questions per source paragraph using only the rewrite. Diffusion wins on answer accuracy by a margin that survives a bootstrap over paragraphs, and the demo page renders both versions with the heatmap.
