## Overview
Mouthpiece is a 3–6 player concurrent-room game about *summoning*. Each phone is privately handed a different secret target word (say 'volcano', 'divorce', 'banana'). Your job: write a short opening that makes a tiny language model rate your word as the most likely next token — without naming it or an obvious variant. You're building a runway so the model leaps to your word on its own.

## Problem
Manipulating perplexity of your own text is well-trodden. Mouthpiece flips the target: the scored thing isn't your sentence, it's whether you can steer the model toward a word only YOU know. That secret-and-different-per-phone target turns it into a private craft puzzle plus a reveal comedy.

## How it works
PRIVATELY, each phone shows your secret target word and a box for a prompt of ≤12 words that must not contain the target or an obvious morphological variant (checked client- and server-side). The host TV shows only names, a lock tally, and a timer — never anyone's word or prompt.

Example: target 'divorce' → you write *'After twenty silent years, the lawyer slid the papers across and said the word:'* — you never typed 'divorce', but the model badly wants it next.

At reveal the host runs each prompt through distilgpt2 and scores the model's probability of the target word as the immediate next token (teacher-forced across the target's BPE tokens, geometric-mean normalized). The TV ranks players, reveals each (prompt → target → summon score), and — for laughs — shows the model's actual greedy continuation of each prompt, which often lands somewhere absurd. Optional bonus: before scores drop, phones privately guess whose prompt scored highest.

Per-phone privacy is load-bearing three ways: targets are secret and different, prompts are written simultaneously and blind, and the reveal delight depends on nobody having seen the words. A passed-around phone leaks every target.

## Technical approach
Host browser tab runs distilgpt2 via transformers.js and is authoritative scorer. Phones are PWA WebSocket clients (PartyKit Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{targets{playerId→word}, phase, subs{playerId→{prompt,score}}}`. Targets drawn from a curated ~40-word deck server-side so each round is different-per-phone. Sync: phone emits `submit(prompt)`; server validates the no-target-word rule, marks locked, broadcasts count only. On all-locked the host scores each prompt (one forward pass per prompt + short teacher-force of the target) and generates a fixed-length greedy continuation for the reveal. Hard part: robust 'contains the target' guarding against lemmas/plurals/leetspeak, and multi-token target fairness (short targets summon more easily) — v1 normalizes and biases the deck toward comparable-length words.

## v1 scope
- One round, 3–6 players, one target word each from a fixed deck.
- Prompt ≤12 words, banned-word check, host-side scoring + greedy reveal.
- No cumulative score.

## Out of scope
- Multi-round scoreboards, custom word decks.
- Sampling temperature options, on-phone inference.
- Robust synonym/lemma banning beyond a basic stemmer.

## Risks & unknowns
- Some deck words are near-impossible to summon; needs playtest curation.
- Ban-check false negatives let clever spellings sneak the word in.
- Multi-token length bias in scoring.

## Done means
5 phones each receive a distinct secret word, submit a blind prompt, the host scores next-token summon probability via distilgpt2, and the TV shows a ranked reveal with prompts, targets, and each model continuation — with a clear winner and no word ever leaked before reveal.
