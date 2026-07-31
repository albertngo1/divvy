## Overview

A 4-player, ten-minute clue-writing game for a TV plus four phones. Each player privately writes a one-sentence clue for a secret target word. Before anyone sees it, a small in-browser LLM devours every predictable word in the sentence and replaces it with a plausible lie. Your job is to be understood by the room *through* the damage.

## Problem

Clue games reward the obvious phrasing, and every group converges on the same tired hint. Meanwhile, LLM party games almost always use the model as an author or a judge — a black box that hands down a verdict. Here the model is a mechanical adversary with a rule you can feel: it eats clichés. Surprisal isn't a score printed at the end, it's the physics of whether your words reach the table at all.

## How it works

The host screen shows a public board of 12 nouns (BARNACLE, PIANO, CURFEW…). Each phone is privately dealt one of them as its target — nobody else knows which.

Each phone privately composes a clue of at most 15 words. While typing, that phone — and only that phone — shows a single live number: *"4 of 11 of your words will survive."* Never which ones. That ambiguity is the whole tension.

On lock, the host runs each clue through the model in one teacher-forced pass under a fixed neutral prefix ("Here is a hint: "). Every whitespace-word whose summed token surprisal falls below θ (≈4 bits) is replaced by the model's runner-up prediction for that position. The TV renders survivors in white and substitutions in sickly yellow italic — so readers know exactly *where* the model lied, but not what stood there.

Clues reveal one at a time. The other three phones each privately tap one of the 12 board words; picks are simultaneous and locked, so there's no anchoring on whoever shouts first. Author scores +1 per correct guesser; each correct guesser scores +2.

## Technical approach

Host browser tab runs distilgpt2 (or Qwen2.5-0.5B) via transformers.js on WebGPU. One forward pass over the full clue yields logits at every position — surprisal of the actual token and the argmax alternative come free from the same pass. Substitution happens at whitespace-word granularity: sum subword surprisals, swap the whole word, so you never emit half-a-token gibberish.

Authoritative state lives in a PartyKit/Durable Object room: `{ phase, board[12], players: {id, targetIdx, draft, mangled, guess}, scores }`. Drafts are never broadcast — only the owning socket receives `heat:{survivors, total}`.

The hard part is the live private counter. Four phones typing means four inference streams contending for one WebGPU context. Debounce 250ms, serialize through a single-inference queue on the host, keep only the newest request per phone and drop stale ones, round-robin so no phone starves. Second hard part: the model lives in the host tab, which technically sees every draft — v1 assumes the host is an unattended TV, and moves inference into a worker with no DOM access.

## v1 scope

- Exactly 4 players, one round, one clue each
- Fixed 12-noun board, hardcoded θ, English only
- distilgpt2; ~30s model load with a loading screen
- No reconnect, no lobby, no avatars, no mobile keyboard polish

## Out of scope

Multi-round play, custom word decks, persistent scores, spectators, model selection, per-word reveal animation, localization, tuning θ per player.

## Risks & unknowns

θ calibration is everything: too aggressive and every clue is unreadable soup, too gentle and nothing visibly changes. Runner-up tokens may be near-synonyms (harmless) or absurd (funny) — unclear which dominates. distilgpt2 may find proper nouns uniformly surprising, making name-drops trivially safe. Mobile typing under a live meter may feel stressful rather than tense.

## Done means

Four phones, one round: every clue on the TV shows at least one colored substitution, at least one guesser is demonstrably misled by a substituted word, final scores render, and no draft text ever appears on the host screen before the reveal phase.
