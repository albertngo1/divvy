## Overview
Long Tail is a fast word game for 3–5 players. The host screen shows a single fill-in-the-blank stem; each phone privately submits one word; a small in-browser language model scores how plausible each word is. You win by finding a word the model considers reasonable that sits in an *under-populated* corner of its distribution — plausible, but not what your friends will pick.

## Problem
Most fill-the-blank games reward either the single obvious answer (everyone ties) or pure shock nonsense (a race to the bottom). Long Tail rewards the third thing that's actually hard: the plausible answer nobody else reaches for. The model — not a crowd vote — is the arbiter of "plausible."

## How it works
The host displays a stem deliberately chosen to be HIGH entropy — one the model finds many continuations plausible for (e.g. "She opened the fridge and found a ___ where the milk should be."). Each phone privately types one word. The model computes P(word | stem) for every submission. **Scoring:** your word banks its probability × 100 — but ONLY if you didn't collide with another player; colliding words score zero for everyone in the collision. Because the blank is high-entropy, probability mass is spread thin across many valid words, so the game is navigating that spread without bumping into a peer. Play it safe with the obvious word and you'll collide; wander too far and the model rates you implausible; the sweet spot is the long tail.

**Each phone shows privately:** the shared stem, your text input, and your own scored result. **The host screen shows publicly:** the stem, then a dramatic reveal plotting every submission on a probability axis with collisions greyed out, and the round winner.

## Technical approach
Host runs transformers.js (gpt2) and is authoritative for scoring. Server (PartyKit / Durable Object) holds `roomId`, `stem`, and `submissions{playerId: word}`. Flow: host broadcasts the stem; phones submit; server collects all words then signals the host; host computes P(word|stem) per submission plus a collision check, and broadcasts scored results. Sync is simple (one submit round, one reveal). The genuinely hard part is collision detection beyond exact string match — true semantic near-duplicates ("cat"/"kitten") — which v1 explicitly punts on, and reliably authoring stems that are high-entropy enough that divergence pays.

## v1 scope
- One hand-picked high-entropy stem, 3–5 players
- Exact-string collision only (lowercased, trimmed)
- Single round; highest surviving banked word wins
- Gibberish self-punishes via low probability (no filter needed)

## Out of scope
- Semantic collision clustering, multiple rounds/packs
- Profanity/gibberish filtering, per-player secret constraints
- Multiplayer scoring beyond a single stem

## Risks & unknowns
With free text, exact-string collisions may be rare → uniqueness becomes trivial → the game collapses to "pick the highest-probability word" and everyone converges on the obvious (which then *does* collide). The entire design hinges on tuning stem entropy so the obvious word is a collision trap. Tiny-model probabilities are noisy for rare words.

## Done means
Four players privately submit a word to one stem; the host reveals all words ranked by model probability with exact collisions zeroed; the highest surviving word wins — with no phone having seen another submission before the reveal.
