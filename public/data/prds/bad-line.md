## Overview

A 4-player word game where a tiny in-browser LLM is not the referee but the *phone line*. Each player secretly holds a target word and must get it across to exactly one other player — through a channel that silently deletes any word whose surprisal falls outside a hidden band. For groups who like Codenames but want the twist to be the medium, not the message.

## Problem

Every perplexity party game so far treats the model as a scoreboard: write text, get a number, compare numbers. That's a spreadsheet with a laugh track. The model's per-token surprisal is far more interesting as a *filter* — a thing that decides what other people are allowed to hear you say. And the deep joke writes itself: the words that carry the most information are exactly the words the model finds most surprising, so a "boring words only" channel makes communication nearly impossible in a way everyone can feel.

## How it works

Four phones, a derangement: A sends to B, B to C, C to D, D to A. Each phone privately gets (1) a target word from a fixed list — `dentist`, `divorce`, `linoleum` — and (2) as *receiver*, a hidden band: LOW (word surprisal < 3 bits), MID (3–7), or HIGH (> 7). You never learn your own receiver's band; you only learn your own, and only implicitly.

During one live 90-second window you type a clue sentence. Your phone shows, privately, your raw text **and** the redacted version your receiver is actually getting — words outside their band become `███` of matching length, updating as you type. So you're doing two things at once: conveying `dentist` and reverse-engineering a censor by watching which of your words survive. Your receiver's phone shows only the redacted stream, live, plus a private 6-word shortlist; they lock a guess whenever they want.

The host TV shows nothing readable — just four anonymized bars ("Channel C: 71% blocked") and the clock. Reveal at the end: raw sentence, redacted sentence, band, guess.

## Technical approach

Host browser tab loads distilgpt2 via transformers.js and acts as the scoring worker; phones are PWA clients; a PartyKit Durable Object is authoritative. Phones send debounced (250ms) full-text deltas over WS. The host runs one forward pass per draft, computes per-token surprisal `-log2 P(t | prefix)`, aggregates subword tokens into whitespace words by summing (giving proper `-log2 P(word)`), applies the receiver's band, and returns a mask array. The DO fans that mask to exactly two sockets: sender and receiver. Nobody else ever sees it.

Room state: `{players, edges, targets, bands, drafts: {pid: {text, wordSpans, bits, mask}}, guesses}`.

The genuinely hard part is not throughput (four short sentences per 250ms is trivial for distilgpt2) — it's **token↔character alignment**. BPE tokens carry leading spaces and split mid-word, so mapping token spans back to character offsets in the user's raw text, stably, while they're editing mid-sentence, is fiddly. Track offsets from the tokenizer directly rather than reconstructing by decoding.

## v1 scope

- Exactly 4 players, one round, 90 seconds
- 8 fixed target words, 3 fixed bands
- One host-side distilgpt2 instance, no per-phone models
- Redaction is mask-only (`███`), word count and punctuation preserved
- Receiver guesses from a private 6-word shortlist; sender +2, receiver +2 on a hit
- Single reveal screen, no rematch, no persistence

## Out of scope

More players, multiple rounds, free-text guessing, per-phone models, band bidding/negotiation, spectator mode, audio.

## Risks & unknowns

Band calibration is everything — LOW may be unplayable and HIGH may be trivially readable; needs live tuning of thresholds against real clue text. Surprisal is context-dependent, so identical words vanish and reappear as you edit, which is either the best or the worst part. Model load is ~80MB on the host. And it may turn out that redacted sentences simply aren't decodable at all — the shortlist is the safety net.

## Done means

Four phones join by QR. A sender types "you sit in the chair and open wide," sees three words turn to `███` within 400ms, rewrites, and their receiver — watching the same redaction independently — picks `dentist` from six options before the 90-second clock runs out, with the host revealing all four channels and their hidden bands.
