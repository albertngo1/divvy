## Overview

Well Read is a one-round writing duel for 4 players and about 8 minutes, built on a fact most perplexity games ignore: **surprisal is observer-relative**. There is no single "the model" here. Each phone privately holds a different 120-word passage — a museum wall label about bog bodies, a bread recipe, a HOA complaint thread, a Warhammer lore excerpt — and the host keeps a separately-conditioned copy of the model for each player. Everyone writes one sentence on the same deliberately vague topic. Your sentence is then scored against all four primed models at once.

## Problem

Entropy party games keep treating the LLM as an impartial referee, so the game collapses into "be weird" or "be bland." That's a one-axis joke. The actual interesting thing about perplexity is that it's a function of *what the reader has just read* — which is exactly how in-jokes, jargon, and talking past each other work. Well Read mechanizes the feeling of saying something completely normal and watching the room's face change.

## How it works

1. **Deal (60s).** Each phone privately shows only its own passage. Nobody else ever sees it. The host TV shows four anonymous covers ("Reader A… D") and a topic card: *"Describe what was in the garage."*
2. **Write (90s).** Each phone gets a text box, max 20 words, plus one private **taste test**: type a draft and see your own home surprisal in bits/token, and — critically — nothing about anyone else's. The TV shows only a public count of taste tests used, so burning your one peek is visible and costly.
3. **Score.** Host computes, for every sentence × every reader, the mean per-token negative log-likelihood with that reader's passage as prefix. Your score = mean **away** surprisal (the other three readers) − your **home** surprisal, in bits/token.
4. **Reveal.** TV plays a 4×4 heat grid, sentence by sentence, lighting each cell as it resolves — one warm cell in a row of cold ones is the whole payoff. Then each phone privately guesses which passage each rival read; a correct guess is worth a flat bonus and is scored independently of the surprisal spread.

Private per phone: your passage, your live taste-test meter, your guesses. Public on TV: sentences, the heat grid, meter-use counts, final scores.

## Technical approach

Host browser tab runs transformers.js with Qwen2.5-0.5B-Instruct (q4, WebGPU); distilgpt2 is the CPU fallback. Phones are dumb PWA views — no model on device — so "private" is enforced by server routing, not client compute. PartyKit Durable Object per room holds `{players[], passages[], sentences[], meterUses[], grid[][]}`; phones send `draft`, `submit`, `guess`; host is the only inference worker and pushes `scores` to the DO.

The genuinely hard part is making 16 scoring passes cheap enough that the reveal doesn't stall. Trick: compute each 120-token passage's KV cache **once** at deal time and keep all four resident, then every scoring pass is a teacher-forced run of only ~25 sentence tokens against a cached prefix. Per-token mean NLL (not sum) prevents short-sentence gaming; a floor on token count blocks two-word entries.

## v1 scope

- Exactly 4 players, one round, one hardcoded topic
- 5 handwritten passages, dealt without replacement
- One taste test per player, publicly counted
- Heat grid reveal + a single flat guessing bonus
- Local network only; QR code join, no accounts

## Out of scope

Multiple rounds, player-authored passages, on-device inference, spectators, persistent scoring, any model larger than 0.5B.

## Risks & unknowns

A 0.5B model may not be sensitive enough to 120 tokens of prefix for the home/away gap to exceed noise — needs a spike measuring the spread on 20 hand-written sentence/passage pairs before anything else is built. Passages that are too topically loud make guessing trivial. Cold-start model download (~350MB) needs a pre-lobby warm-up screen.

## Done means

Four phones join by QR; each sees a different passage and nobody else's; all four sentences score against all four prefixes in under 6 seconds; and in a live playtest at least one sentence lands home-cold/away-hot by a margin the room *audibly reacts to* before the score is shown.
