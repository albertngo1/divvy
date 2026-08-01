## Overview

A 4-player hidden-agenda game about contaminating a shared context window. Everyone writes one sentence into a common memo; the memo conditions a small local LLM; you're paid in bits of surprisal reduction on a word only you know. For groups who enjoy influence games and will find it very funny that `linoleum` and `divorce` are fighting over a distilgpt2 attention head.

## Problem

Prompt-conditioning games usually give each player their own private prompt and their own private score, so nobody actually interacts — it's four solitaire games with a leaderboard. The interesting object is a *single shared context* that four people are all secretly steering at once, where your poison and my poison interfere, dilute, and occasionally accidentally help each other.

## How it works

The host TV shows one fixed public test prompt: *"Dear valued customer, we regret to inform you that"*. Each phone privately shows one secret target word drawn from a mid-frequency list.

**Phase 1 (60s, simultaneous):** each phone privately writes one sentence, max 15 words, to be added to a shared "briefing memo." Your phone shows a private live meter: current Δbits for your word if the memo were just yours. It cannot show the real number, because the other three sentences don't exist yet — that gap is the game.

**Phase 2:** the server shuffles the four sentences into one memo, prepends it to the test prompt, and the host model scores every player's secret word. Score = `surprisal_baseline − surprisal_conditioned`, in bits, averaged over five checkpoints along a fixed greedy 25-token continuation.

**Phase 3 (45s, private):** the memo appears on the TV, sentences unattributed. Each phone privately assigns each sentence to a player. If at least half the room fingers your sentence correctly, you forfeit half your bits — which is the whole reason you can't just write "penguin penguin penguin."

Host screen only ever shows the memo and the final bar chart. Targets, drafts, meters and accusations all live on phones.

## Technical approach

Host tab runs distilgpt2 through transformers.js; phones are PWAs; a PartyKit DO holds authoritative state `{players, targets, drafts, memoOrder, baseline, deltas, attributions}`. Phase 1 needs only a debounced solo-preview pass per phone (host-side, result routed to one socket). Phase 2 is one greedy 25-token generation plus teacher-forced scoring of four target words at five positions — under a second, so no streaming sync problem.

The hard part is **measurement validity**, not networking. Δbits for a small model over a ~60-token memo is a small, noisy signal, and a naive single-position measurement is dominated by whatever token the model was going to emit anyway. Hence: fixed continuation, multiple checkpoints, sum of subword logprobs for multi-token words, and a curated target list pre-screened so every word's baseline surprisal sits in a workable 8–14 bit range. A word that's already likely has no headroom and makes a dead player.

## v1 scope

- 4 players, one round, one hardcoded test prompt
- 8 pre-screened target words
- 60s write, one 45s attribution pass, one reveal
- Δbits computed once; no re-rolls, no interim scores
- Attribution penalty is a flat halving

## Out of scope

Multiple rounds, player-authored prompts, editing the memo after submission, sentence-ordering strategy, larger models, saved transcripts.

## Risks & unknowns

Distilgpt2 may barely respond to a 60-token memo, collapsing the score range — mitigation is checkpoint averaging and possibly a larger model. Attribution may be trivially easy with four players who know each other, making subtlety the only strategy and blunting the poisoning fun. Balance between "blatant and caught" and "subtle and ineffective" is entirely a playtest question.

## Done means

Four phones submit four sentences blind; the host builds one memo, generates a visibly memo-warped completion on the TV, and shows a bar chart in bits where at least two players moved their secret word by more than 1.5 bits and at least one player was correctly fingered and halved — start to finish, one round, under four minutes.
