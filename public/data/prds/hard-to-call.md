## Overview

A 4-player real-time game where a small in-browser LLM is not a judge but a **coin**. The room must cooperatively keep the model uncertain — a confident next token is disqualified as an unfair flip — while each player privately needs the coin to land a specific way. Cooperative on the supply of randomness, cutthroat on its contents.

## Problem

Entropy games almost always ask you to chase a number: write low perplexity, hit a band, spike the meter. That makes the model a scoreboard. Nobody has made the model's uncertainty a *resource the room has to manufacture before anything can happen at all*, where the manufacturing is shared and the spending is private.

## How it works

A sentence grows on the TV, one word at a time. At each step the host computes the next-token distribution:

- **Entropy ≥ 1.5 bits:** the sampled word is a legal flip. Its first letter decides the bit — a–m = **0**, n–z = **1** — and the bit is appended to a public tape.
- **Entropy < 1.5 bits:** "too sure to call." The word is still appended to the sentence, but no bit is emitted and the shared 12-flip clock does not advance. The tape stalls and everyone loses tempo.

Turn order rotates. On your turn, **your phone privately shows three candidate continuation phrases** (2–3 words each) drawn from different regions of the distribution, annotated with only *their* predicted entropy — not their letter skew. You pick one; the room sees the resulting words but never sees the two you rejected.

**Phone (private):** your secret 4-bit pattern, your two **Peek** charges (a Peek reveals the a–m/n–z split of the current top-5 mass, once), and your three candidates on your turn.

**Host screen (public):** the sentence, the running bit tape, the live entropy gauge with the 1.5-bit gate line, and the flip counter. No patterns, no peeks.

First player whose 4-bit pattern appears as a contiguous run on the tape wins. If the tape reaches 12 flips with no winner, the room loses together — which is the point: steering hard toward your own bits makes the model predictable, stalls the tape, and starves everyone including you.

## Technical approach

Host tab runs Qwen2.5-0.5B via transformers.js on WebGPU, keeping a KV cache so each step is one incremental forward pass (~40ms). Phones are PWA clients on a PartyKit Durable Object. Model: `Room { sentence: token[], tape: bit[], turnIdx, players: {id, pattern, peeksLeft} }`. The server is authoritative on turn order, pattern assignment, and win detection; the host tab is authoritative on the distribution and posts `{word, entropy, bit|null}` per step.

Hard part: candidate generation must be *fast and honest*. Sampling three continuations of 2–3 tokens each means branching the KV cache three ways and rolling back — the same rollback problem as any speculative decode, but on a phone-latency budget. v1 cheats: candidates are 3 single tokens taken at ranks 1, ~8, and ~30, no rollback needed.

## v1 scope

- One fixed seed sentence, 4 players, 12 flips max
- 3-bit patterns, not 4 (they hit sooner)
- Single-token candidates at fixed ranks
- One Peek each; no scoring beyond win/lose

## Out of scope

Multi-round, phrase candidates, teams, von Neumann debiasing, letter-split customization, spectator mode.

## Risks & unknowns

The a–m/n–z split is not remotely unbiased under real token frequencies — the tape may skew hard to one bit and make patterns unfair; needs a measured per-corpus split point. The 1.5-bit gate may almost always pass (or almost always fail) depending on the sentence; the threshold likely has to adapt. Steering toward a letter class may be too hard to feel intentional, collapsing the game into watching a random tape.

## Done means

Four phones join, the tape reaches 12 flips inside 4 minutes, at least two flips are visibly refused by the gate for being too confident, and one player's 3-bit pattern is announced as a hit on the host screen without any phone ever having shown another player's pattern.
