## Overview
A fast word-craft party game for 3-6 players who love the click of a phrase that makes its next word a foregone conclusion ("hermetically ___"). Each player privately writes a sentence *prefix* that corners a small in-browser LM into near-certainty about the next word. The model's raw uncertainty is the score.

## Problem
Every perplexity party game so far scores a whole *written string*. Nobody has made a game out of the model's uncertainty at a single *moment* — the Shannon entropy of its next-token distribution. That entropy is exactly the satisfying feeling of an inevitable collocation, and it's begging to be a scoreboard.

## How it works
The host TV shows a loose theme (e.g. "food," or freeform) and a 60-second timer. Each phone PRIVATELY shows a text box where you type a prefix that ends right before the word you're forcing — you never type the forced word yourself. On submit, the host runs your prefix through distilgpt2 and computes the Shannon entropy (in bits) of the next-token distribution at the cut point. **Lowest entropy wins** — you cornered the model hardest.

Reveal on the host screen: an entropy-sorted leaderboard, each player's prefix, and the model's top-1 "foregone" word with its probability ("...sealed → 0.94"). Optional bonus round before entropies are shown: each phone privately guesses the forced word for one randomly assigned OTHER player's prefix; a correct guess scores.

Private per phone: your prefix as you write it — hidden until reveal. Shared host screen: theme, timer, leaderboard, and the foregone-word reveal.

## Technical approach
Host tab loads distilgpt2 via transformers.js (WebGPU, WASM fallback) — the only place the model runs, keeping scoring authoritative and identical for everyone. Phone PWAs connect over WebSocket (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code, players[], phase, theme}`; `Submission{playerId, prefixText, entropyBits, top1Token, top1Prob}`. Phones only send prefix strings. Host takes the final-position logits, softmaxes, and computes H = -Σ p·log2 p (optionally over a top-k truncation for stability). The genuinely hard part: entropy is hyper-sensitive to tokenization and trailing whitespace — a prefix ending with a space vs. without produces wildly different distributions. Must define and standardize the cut point (canonical trailing-space handling) and restrict prefixes to end at a word boundary, or scores feel arbitrary.

## v1 scope
- One round, one freeform theme
- 3-6 players
- Host runs distilgpt2; entropy leaderboard + foregone-word reveal
- Deduction bonus optional / cut if time-boxed
- Local network only

## Out of scope
- Multi-round scoring, the deduction bonus, anti-cheat, on-phone inference, animations

## Risks & unknowns
- Whitespace/tokenization normalization is make-or-break for fair entropy
- Players may not intuit "entropy" — need "how many words could come next?" framing on screen
- Degenerate mid-word prefixes forcing a wordpiece; distilgpt2's top-1 can be quirky

## Done means
Four phones submit prefixes; within ~2s of the last submit the host shows an entropy-sorted leaderboard with each prefix's forced word and probability, and highlights the lowest-entropy player as the winner.
