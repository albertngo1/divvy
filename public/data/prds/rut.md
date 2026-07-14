## Overview
A snappy social word game for 3-6 players. Everyone fills the same blank with a single word; you want to be predictable to a tiny language model but unpredictable to the room. The model's next-token ranking is the objective scoreboard; the other players are the trap.

## Problem
"We asked the model" games reward either pure weirdness or pure flatness. None capture the real tension: wanting the *obvious* answer while dodging everyone else who wants it too. The obvious word is a rut everybody falls into together — and gets nothing for.

## How it works
The host TV shows a shared stem with one blank: "A balanced breakfast needs a glass of ___." A 30-second timer runs. Each phone PRIVATELY types ONE word. The host feeds the stem to distilgpt2 and gets the ranked next-token distribution. Your score = a predictability bonus based on your word's RANK in that distribution (top-1 = big points, tail = few) — BUT if two or more players submitted the same word, all of them score ZERO on it.

So the model's #1 word is a trap: everyone grabs "milk" and cancels out. You want the model's #4 that you bet nobody else will pick — predictable enough to score, unique enough to survive. Host reveal: the model's top-10 with probabilities, each player's word placed on that ladder, collisions struck through in red, survivors tallied.

Private per phone: your single word, blind and simultaneous — the whole game collapses if picks aren't secret and concurrent (a passed phone lets you copy or dodge others). Shared host screen: the stem, timer, and the reveal ladder.

## Technical approach
Host runs distilgpt2 via transformers.js: one forward pass on the stem → logits at the blank → softmax → ranked vocab. Each player's word is mapped to its token(s) and scored by rank. Data model: `Room{code, stem, players[], picks{playerId:word}, phase}`; scoring computed host-side. WS server via PartyKit / Durable Object or Socket.IO over Tailscale Serve. Sync is trivial (one word per phone). The genuinely hard part is a FAIR, PREDICTABLE word→rank mapping: casing, plurals, leading-space tokens ("Ġmilk" vs "milk"), and multi-token words. v1 rule: canonicalize to lowercase + leading-space single token; an exact match gets its rank, anything unmatched scores 0 with a clear "not on the model's radar" message. Filter the ladder to alphabetic tokens so punctuation/junk tokens don't dominate.

## v1 scope
- One round, one hand-picked stem
- 3-6 players
- Single-token exact-match scoring; collision = zero
- Reveal ladder with strike-throughs
- Local network

## Out of scope
- Multi-round, multi-token/synonym crediting, category themes, persistent scores

## Risks & unknowns
- Degenerate convergence (everyone stacks on #1 → all zeros; funny once, flat if repeated)
- Single-token mapping excludes many natural words — can frustrate
- distilgpt2's top tokens can be junk/punctuation; needs filtering
- Players need the "predictable but unique" rule made obvious on screen

## Done means
Four phones each submit one word; within ~2s the host shows the model's top-10 ladder, places each word, zeroes collisions, and names the highest surviving scorer as round winner.
