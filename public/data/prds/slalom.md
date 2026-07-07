## Overview
Slalom is a 4–5 player cooperative concurrent-room game. The host TV shows a sentence skeleton with numbered blanks and a big perplexity needle; each phone is privately assigned a disjoint set of those blanks. Together the table is trying to co-write a single sentence that is *precisely medium-weird* — landing the model's perplexity inside a target gate. For groups who like the group-high of barely threading a needle without being able to talk their way through it.

## Problem
Cooperative party games usually let players openly coordinate, which turns into one loud person dictating. And LLM-scoring games so far are competitive (lowest/highest perplexity wins). The untapped itch: a *shared* target band where the sentence is a blind collage — you contribute your slots without knowing what anyone else wrote, so nobody can steer the whole thing, and the reveal of the assembled nonsense against the needle is the payoff.

## How it works
The host shows e.g. `"The ①1 ②detective ③1 the ④2 under a ⑤3 moon."` Slots are colored and dealt so each phone privately owns a distinct subset (phone 1 owns slots ①③, phone 2 owns ②④, etc.). Each phone screen shows ONLY its own slots with input boxes, a hint of the surrounding fixed words, and the target gate (e.g. 'land perplexity between 80 and 140'). Players type blind and lock in. The host assembles the full sentence, runs it through the model once, and animates the needle. If it lands in the gate, the room wins; the host reveals the full absurd sentence and each player's contribution. A near-miss shows which direction (too tame / too wild) they overshot — the hook for an immediate rematch. Per-phone is load-bearing: because slots are disjoint and private, a single passed-around phone destroys the whole game — the fun *is* four people independently guessing how their fragment will combine.

## Technical approach
Host tab runs distilgpt2 (transformers.js) and computes sentence perplexity = exp(mean token NLL) in one forward pass. Phone PWAs over an authoritative WebSocket server (PartyKit / Durable Object or Socket.IO via Tailscale Serve). Data model: `Room{template, slots[], assignment{playerId:[slotIds]}, phase}`, `Slot{id, ownerId, word}`. Sync: server deals slot ownership at round start and broadcasts only each player's own slots; phones return `{slotId, word}`; server assembles authoritatively and asks the host to score. Hard part: the target gate must be tuned so it's reliably *reachable but not trivial* for a given template — perplexity ranges vary wildly by skeleton, so gates are precomputed per template by sampling random fills offline.

## v1 scope
- One hardcoded 5-slot template, one round, 4 players
- Disjoint private slot dealing
- Single perplexity gate + win/lose + direction hint
- Full-sentence reveal

## Out of scope
- Multiple templates / difficulty tiers
- Per-player scoring or streaks
- Dynamic gate calibration at runtime

## Risks & unknowns
- Gate tuning: too wide = trivial, too narrow = frustrating
- Players may not intuit how their fragment moves the needle
- One-token typos swinging perplexity unfairly

## Done means
4 phones each receive their own private slots, fill them blind, the host assembles and scores the sentence in one pass, the needle animates, and the room correctly sees win-or-miss with a direction hint — no phone ever seeing another's slots before reveal.
