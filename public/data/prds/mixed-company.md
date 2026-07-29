## Overview

A 3–5 player, one-round party game (~6 minutes) for people who like word games with a cold, arguable number at the end. Each phone is privately assigned a **world**: a short paragraph of text — a 1974 marine-diesel repair manual, a group chat mid-breakup, a county zoning appeal, a fantasy novel's third book. That paragraph is loaded as the context prefix for a small in-browser language model. Everyone then writes one sentence. The scoring engine is literal per-token surprisal: how unsurprised *your* primed model is by your sentence, minus how unsurprised *everyone else's* is.

## Problem

LLM party games almost all use the model as a taste judge ("pick the funniest") or a generator. Taste-judging is arbitrary and the room knows it. Perplexity is not taste — it is a measurable claim about whether a piece of text *belongs somewhere*. And nobody has built a game where every player's copy of the model has been differently poisoned, so the same sentence gets four incompatible readings and that disagreement is the whole score.

## How it works

1. **Deal.** Host TV shows only "4 worlds in play." Each phone privately shows its world paragraph — ~120 words of flavor text. You never see anyone else's.
2. **Write (90s, simultaneous).** Each phone shows a text box and a private live **At Home** meter — as you type, your phone scores the draft against your own prefix and shows a needle. This is a private oracle; it tells you nothing about the other worlds.
3. **Cross-score.** All sentences are scored under all N prefixes. Host TV shows an anonymized N×N heatmap of z-scored surprisal — columns are sentences, rows are unlabeled worlds — plus the raw sentences.
4. **Score.** Points = (mean surprisal of your sentence across the other worlds) − (surprisal under your own). A sentence that's bland everywhere scores zero. A sentence that's gibberish everywhere scores zero. You need it to be *fluent in exactly one dialect*.
5. **Bonus round (30s).** Each phone privately guesses which heatmap row is which player. Reading the matrix is the social payoff: the two worlds that agree about a sentence are secretly adjacent.

Private: your world, your live meter, your draft, your row-guess. Shared: sentences, heatmap, final scores.

## Technical approach

Host browser tab runs transformers.js with Qwen2.5-0.5B (distilgpt2 as the fast fallback). A prefix's KV cache is computed once per world at deal time; scoring a 25-token sentence under it is one teacher-forced forward pass, so N² scoring of five sentences is ~25 short passes — under two seconds on any laptop GPU. Phones run the *same* model locally via WebLLM for the private live meter only, so drafts never leave the device before submit.

State lives in one Cloudflare Durable Object per room: `{roomId, players[{id, worldId, sentence, submittedAt}], worlds[], scoreMatrix}`. Sync is submit-and-broadcast; there is no tight real-time loop, which is the mercy of this design.

The genuinely hard part is **normalization**. Absolute NLL is dominated by sentence length, rare proper nouns, and punctuation — a sentence containing "Nebuchadnezzar" is surprising to every world. The fix is that the scoring quantity is already relative: z-score each sentence's NLL *across the N worlds*, so per-sentence lexical difficulty cancels out. Normalization and the game's actual signal are the same operation, which is lucky and should be stated loudly to anyone tempted to "improve" it.

## v1 scope

- One round. Four hardcoded world paragraphs, 3–4 players.
- distilgpt2 on the host only; the private phone-side meter is a stub that says "scoring on submit."
- Heatmap as a plain HTML table of numbers.
- No accounts, no rejoin, no persistence.

## Out of scope

Phone-local WebLLM, multi-round, player-authored worlds, model choice, mobile Safari memory tuning, any animation.

## Risks & unknowns

A 0.5B model may not discriminate genres sharply enough at 25 tokens — the heatmap could be mush. Mitigation: pick maximally distant worlds and test with hand-written extremes first. Second risk: players may find optimizing a number joyless rather than funny; the read-the-matrix bonus round is the hedge.

## Done means

Four phones join, four different worlds appear, four sentences are written, and the TV shows a heatmap in which a deliberately on-genre sentence scores at least 1.5 z below its own world and above 0 in every other — verified with three planted test sentences before any human plays it.
