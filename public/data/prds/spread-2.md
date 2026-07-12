## Overview
Spread is a 3–6 player concurrent-room game where the scoring engine is the language model's actual next-token probability distribution. Each round the model proposes a shortlist of candidate words for a blank; players privately claim words, and you win the hidden probability mass of your claim — unless someone else grabbed it too. For people who enjoy market/draft tension without a board.

## Problem
Most LLM party games reduce the model to 'most likely word' (a single right answer) or 'perplexity number'. The rich softmax *distribution* — the model's spread of belief across many plausible words — is untapped. The itch: a game that makes you reason about where the model quietly puts its mass, while also reading the room, blind.

## How it works
The host TV shows a sentence with one blank ('The detective slowly ___ the door.') and eight candidate words the model surfaced (top-k), listed in RANDOM order with their probabilities HIDDEN. Each phone PRIVATELY sees the same eight words and taps to claim exactly one — you're betting it holds more of the model's probability mass than the crowd expects. You cannot see anyone else's claim.

Reveal: the host un-hides the softmax. Your score = the model's probability for your claimed word × 100. Collision rule: if N players claimed the same word, they split its mass N ways. So the naive move (grab the obvious #1) gets crowded and diluted; a lonely claim on a solid #3 can outscore a four-way split on #1. Highest banked points wins the round.

Private per phone: your claim, until reveal. Shared: the stem, the candidate list, the final distribution. A single passed phone destroys it — the blind, simultaneous, secret claims are load-bearing; the whole tension is anticipating both the model AND everyone else's greed at once.

## Technical approach
Host tab runs transformers.js + distilgpt2; a single forward pass yields the full next-token distribution, from which the host extracts top-k whole-word candidates (filtering subword fragments/punctuation, renormalizing over the shortlist). Authoritative WebSocket server. Data model: Round{stem, candidates[{word, prob}], claims:{playerId→word}}; server withholds probs until all claims land or a 30s timer fires. Sync is simple (claims are tiny) — the genuinely hard part is candidate curation: raw top-k is full of ' the', ' a', and subword junk, so the host must post-process into a clean set of ~8 distinct real words whose probabilities still sum to a meaningful, spread-out distribution (avoid one word at 95%).

## v1 scope
- One stem, one round, 3–6 players
- Fixed shortlist of 8 curated candidate words per stem
- 30s claim timer, single reveal, single scoreboard
- distilgpt2, host-side inference

## Out of scope
- Multi-round markets, carrying odds between rounds
- Player-authored stems, adjustable k
- Wagering variable stakes / partial claims

## Risks & unknowns
- Distributions may be too peaked to be interesting — needs stems tuned for a flat-ish spread
- Subword→word aggregation changing effective probabilities
- Whether the collision-split math is intuitive enough to grasp in one round

## Done means
Four phones join, all see the same eight-word shortlist with odds hidden, each locks a private claim within the timer, the host reveals the true distribution, and the scoreboard correctly awards probability mass with collisions split — in one self-contained round.
