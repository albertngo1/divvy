## Overview

A 4-player living-room game where no human types a single word. A tiny in-browser LLM writes the entire sentence on the TV; the players only decide what it is *forbidden* to say. For groups who like Codenames-shaped deduction but are done writing jokes into a phone.

## Problem

Every LLM party game so far casts you as the author: write a funny line, let the model rubber-stamp it. That's Quiplash with a perplexity skin. Nobody has built a game around the other half of a language model — *constrained decoding*. There's a specific pleasure, untapped, in watching a model visibly strain against a wall you built, while everyone else can only hear the strain and not see the wall.

## How it works

Each phone is privately dealt one Gag Card, which is a vocabulary constraint enforced as a hard logit mask: "no word over five letters", "nothing starting with a vowel", "no word containing T", "nothing in the 200 most common words", "no plural nouns". The host draws a prompt ("The night the museum caught fire, ...") and generates 24 tokens under the *intersection* of all four masks.

Shared TV: the sentence appearing word by word, and one live STRAIN gauge in bits — the total extra surprisal the masks cost — with no attribution whatsoever.

Privately on your phone: your own card, your own secret running strain contribution, and a haptic flash on each token where *your* mask was the binding one. So you know exactly how loud you are and nobody else does.

Then one guess round: each phone privately assigns the other three players to one of six visible candidate cards. Points for correct attributions, plus a "Loudest Wall" bonus for the highest measured blame. A card that never bound once scores nothing — so you spend the read-aloud pretending it did.

## Technical approach

Host browser tab runs transformers.js with SmolLM2-135M (int8). Phones are dumb PWA controllers — no model download. Server is one PartyKit Durable Object: room state machine (`lobby → deal → generate → guess → reveal`), player list, card assignments, guesses. Host is authoritative for inference and pushes token frames.

Cards are precompiled offline into `Uint8Array(vocabSize)` bitmasks, one per card, shipped as a 32KB blob. Per decode step: `p_free = softmax(logits)`; retained mass `m = Σ p_free[allowed]`; step cost `= -log2(m)`. Blame is exact and cheap — recompute retained mass with player *i*'s mask alone lifted; the delta is their bits.

The genuinely hard part is not sync (frames are 20 bytes at 3/sec) — it's **empty intersections**. Four masks can jointly leave zero legal tokens. Fallback: lift the single most restrictive mask for that step and fire a public "SOMEONE FLINCHED" animation naming nobody. Card decks must be pre-vetted by simulation so the typical round bites 30–60% of steps without deadlocking every other token.

## v1 scope

- 4 players, exactly one round, one prompt, 24 tokens
- 6 hand-tuned Gag Cards, simulated against 50 prompts
- One guess round, one reveal screen showing the true blame bars
- No accounts, no persistence, room code only

## Out of scope

Multiple rounds, scoring across games, player-authored cards, mobile host, more than 6 players, any model larger than 135M.

## Risks & unknowns

Stilted text may read as generic model slop rather than as *someone's fault* — that kills attribution. Mitigate with cards whose fingerprints are audible (no-vowel-initial words are unmistakable). Second risk: a 135M model is already incoherent enough that added strain is invisible.

## Done means

Four phones join by code; four masks are dealt privately; the TV generates 24 tokens where the logged intersection was non-empty at ≥90% of steps; each phone's private blame total sums to the public STRAIN gauge within 0.1 bits; and in playtest, at least half of guesses beat random.
