## Overview
Splice is a cooperative-pairs word game for 4–6 players where a small in-browser LLM scores *only the junction* between two blindly-written sentence halves. The lever is seam surprisal: not whole-sentence perplexity, but the model's shock at the exact moment your partner's words meet yours.

## Problem
Perplexity games have scored whole sentences, target bands, and deltas. The unexplored spot is the SEAM — the specific tokens where two independent authors join. It turns perplexity into a blind-coordination problem: can two people who can't see each other's writing make a smooth weld?

## How it works
Players are split into pairs sharing one topic word (e.g. "airport"). Within a pair, one phone is secretly assigned PREFIX and the other SUFFIX. Each privately writes their half (5–9 words) knowing only the shared topic and their role — never their partner's text. The host TV shows the topic and which pairs are still writing, nothing else.

At lock-in the host joins each pair's halves (`prefix + " " + suffix`) and runs distilgpt2 (transformers.js). Score = the summed surprisal of the boundary window: the last token of the prefix and the first ~2 tokens of the suffix, i.e. the model's surprise crossing the seam. Low seam-surprisal = a smooth splice = high score for the PAIR. The reveal animates each joined sentence with a surprisal heat-stripe, spotlighting the weld point in red or green, so you instantly see whose seam fused and whose clunked. Lowest-seam pair wins together.

PRIVATE per phone: your role, your half, and a hint of your own text's local smoothness. SHARED on host: topic, pair progress, and the final heat-striped reveal. Because neither half is visible to the partner and both are written simultaneously, a single passed-around phone cannot reproduce the blind-coordination that IS the game.

## Technical approach
Authoritative WebSocket server (PartyKit / Socket.IO over Tailscale Serve) holds `{pairs:[{topic, prefixText, suffixText, locked}]}` and withholds each half from the partner until reveal. Host tab runs the canonical distilgpt2 pipeline; on reveal it tokenizes each joined string, records per-token log-probs in one forward pass, and sums the log-probs over the boundary window (aligned by tracking the token index where the suffix begins). The hard part: reliably locating the seam token index after BPE re-tokenizes across the join (a word can merge across the space), plus normalizing so a naturally rare topic word at the boundary isn't unfairly punished — v1 clamps the window to the first suffix content-token.

## v1 scope
- One round, 4–6 players, fixed pairs.
- Single shared topic word; roles auto-assigned.
- Host-side seam scoring; heat-stripe reveal.

## Out of scope
- Rotating pairs, multi-round tournaments, phone-local scoring.
- Handling >2 authors per sentence.

## Risks & unknowns
- Seam window definition is finicky; bad alignment = nonsense scores.
- Pairs may accidentally collide grammatically well by luck; may need best-of-two seams.
- Blindness may frustrate — needs a good topic word to anchor shared intuition.

## Done means
Two pairs of phones write blind halves, the host correctly joins each, computes seam surprisal from a single forward pass, and renders a heat-striped reveal naming the winning pair within 3s of lock-in.
