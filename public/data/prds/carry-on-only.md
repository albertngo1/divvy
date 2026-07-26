## Overview

A 3-player couch game where compression *is* the toy. Everyone privately writes a sentence, then must pack it into a hard bit budget — the cost of keeping a word is its surprisal under a small in-browser LLM — and then everyone unpacks someone *else's* wreckage. For friends who like Codenames-shaped "say the most with the least" pressure but want the constraint to be real information theory instead of a house rule.

## Problem

Every LLM party game so far uses the model as a *judge*: write something, get scored. Nobody has used it as the **channel**. Compression is what a language model actually does, and the fact that predictable words are nearly free while punchlines are expensive is a live, counterintuitive economy that nobody has ever been allowed to play inside. The itch: "which three words carry my whole joke?"

## How it works

**Phase 1 — Write (60s, private).** Host shows one prompt ("what went wrong at the wedding"). Each phone privately writes 8–16 words. The TV shows only three "writing…" pills.

**Phase 2 — Pack (60s, private).** Your phone re-renders your sentence with a **price tag on every word**: `-log2 p(word | kept words before it)`. Tap words to keep or drop; dropped words become `___`. Two caps: **≤ 24 bits** and **≤ 6 kept words**. The magic is the *re-rating* — the price of every downstream word recomputes on each tap, because the skeleton is priced as if it were the whole document. Drop "wedding" and suddenly "cake" costs 11 bits. The host screen shows only three allowance meters filling.

**Phase 3 — Unpack (60s, private).** Derangement: your phone now shows a *different* player's skeleton (`the ___ ___ the cake ___ ___ marzipan`). Type your reconstruction. One free **"let the model fill"** button greedily completes the blanks as an editable first draft — the model is the decompressor, and it is bad at it.

**Reveal.** TV plays original vs. reconstruction as a word-by-word diff; each sender/receiver pair scores content-word recall.

## Technical approach

PartyKit Durable Object per room. Model: `Message {authorId, original, keptMask, costBits, skeleton, receiverId, reconstruction}`. The server computes the derangement and pushes each connection **only** its assigned skeleton — originals never leave the DO until reveal.

Pricing is authoritative in the host tab: quantized distilgpt2 via transformers.js. A phone sends `{maskHash, keptMask}`; host returns per-word bits (subword logprobs summed per word).

The genuinely hard part is **live re-rating latency**: every toggle invalidates all downstream prices, so it's a full forward pass, and three phones toggle concurrently. Mitigation: 150ms debounce, cancel-superseded per player, cache by mask hash, KV-cache reuse on the longest unchanged prefix, and score the *masked* string (short) rather than the original.

## v1 scope

- Exactly 3 players, one prompt, one round
- Fixed caps: 24 bits, 6 words; submit blocked until both satisfied
- Model-fill button, single use
- Score = content-word recall, stopwords stripped
- Host-tab model, room code in URL, no accounts, no rematch

## Out of scope

Multi-round; a receiver yes/no question; an adversarial spoofer role; semantic-similarity scoring; on-phone models; 4+ players; persistent scores.

## Risks & unknowns

Word-level aggregation over BPE subwords is fiddly and must be exact or prices lie. Recall scoring may feel brutal — probably needs stemming. Degenerate strategy: keep only cheap function words (nearly free, useless) — the 6-word cap plus recall scoring should punish it, but needs playtesting. Cold model load (~90MB) on the host.

## Done means

Three phones join by QR; each writes privately; prices visibly re-rate on every tap and both caps are enforced client- and server-side; each phone receives exactly one *other* player's skeleton; the TV shows three diffs with recall percentages; and the WS log confirms no phone ever received its own or a third party's original.
