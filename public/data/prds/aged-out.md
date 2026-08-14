## Overview
A 4-player competitive word game where the shared resource is a **single 96-token context window** of a small in-browser LLM. Each player secretly holds a probe sentence. Your score is how *unsurprising* your probe is under whatever is currently in the window. You steer the shared context toward your own secret topic by writing into it — but the window is FIFO, so everything you add pushes the oldest words out, including the setup you built two turns ago.

## Problem
Every LLM party game treats the prompt as a fresh, private thing you write and submit. Nobody has made the *context itself* the contested board — a shared, decaying, finite piece of real estate that four people are silently fighting over. The mechanic is only legible because perplexity gives it a real, live number.

## How it works
One round, four ticks.

At setup, each phone privately receives a **probe sentence** on a distinct topic — *"the referee waved off the goal"*, *"the soufflé collapsed in the oven"*, *"the second stage failed to separate"*, *"the tenant withheld November's rent"*. You never say it aloud. Each phone also gets a **token budget of 40** for the whole round.

The context window starts with a neutral 40-token seed paragraph on the host screen.

Each tick, all four phones simultaneously compose a short phrase (the phone shows a live token counter and refuses to send if you can't afford it). All four phrases are appended in a randomized order; the window overflows and drops tokens from the front until it's back to 96.

The host screen shows: the live context text with the about-to-fall-off prefix greyed and shrinking, and **one needle** — the *average* bits/word across all four hidden probes. It never shows individual scores, so nobody knows who is currently winning, only whether the room as a whole is drifting coherent or incoherent.

Each phone privately shows *its own* probe's bits/word, updated every tick. That divergence — public average, private truth — is the whole tension. Long verbose phrases dominate the window and evict rivals faster, but drain your budget so you go mute for the final ticks, and the last tick is worth double.

After tick 4, probes are revealed on the host and final bits/word is scored, lowest wins. The reveal is funny because everyone finally sees the four incompatible topics they were all shoving into one paragraph.

## Technical approach
Host browser tab + phone PWAs + a PartyKit Durable Object as authority. The host tab runs `transformers.js` with a small causal LM (SmolLM-135M or distilgpt2, WebGPU with a WASM fallback) and is the only place inference happens.

Data model in the DO: `{window: TokenId[], budgets: {pid → int}, probes: {pid → string}, pending: {pid → phrase}, tick, phase}`. Phase machine: `compose → resolve → score`. On resolve, the DO fixes an append order, tokenizes with the same tokenizer the host uses (shipped to the DO as a WASM tokenizer so counts agree exactly), truncates from the front, and broadcasts the new window.

The genuinely hard part: **five perplexity evaluations per tick** (four probes + the room average) at sub-second latency, plus the fact that clients must agree on token counts *before* the server does, or the budget UI lies. Fix: ship the tokenizer to the phone PWA too and treat the DO's count as authoritative on conflict, with the phone showing a slightly conservative estimate. Batch all five probe evaluations into one padded forward pass; on a 135M model this is ~150ms on an M-series host tab.

## v1 scope
- One round, four ticks, exactly 4 players, hardcoded probes.
- Fixed 96-token window, fixed 40-token budget, no double-value last tick.
- Host shows: context text with greyed eviction zone, one average needle.
- Phone shows: text box, token counter, your own bits/word.
- Reveal screen: four probes, four final numbers.

## Out of scope
- Lobby, reconnect, variable player count, probe generation.
- Any scoring beyond raw bits/word (no normalization, no handicaps).
- Phone-side inference.

## Risks & unknowns
- A 135M model may be too dull to move bits/word measurably from a 10-token phrase — needs a pilot measuring the effect size before building any UI.
- Degenerate strategy: just type your probe's nouns repeatedly. Mitigation is a repeated-token penalty, but that adds rules; may instead cap phrase length to 12 tokens and accept some of it.
- The greyed eviction zone might be unreadable on a TV at 8 feet.

## Done means
Four phones, one host tab, one round. Every tick, all four phrases land, the window visibly loses its front, and each phone's private bits/word number moves in the right direction when that player writes on-topic. Reveal shows four probes and a winner. A pilot log proves an on-topic 10-token phrase moves a probe's bits/word by at least 0.3 bits.
