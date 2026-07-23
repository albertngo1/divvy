## Overview
Pin is a 3-6 player writing race where you compete to make a tiny in-browser model as *certain* as possible about its next word. Instead of chasing surprise, you engineer inevitability — the sentence where the completion is a foregone conclusion. For groups who like the perplexity theme but want the funny inverse: airtight clichés, tautologies, dead giveaways.

## Problem
Every perplexity game so far rewards *surprise* — high perplexity, garden-path traps, big deltas, hitting target bands. Nobody has gamified the opposite pole: minimizing next-token entropy by free authorship. "Who can most completely pin the model to one answer" is a fresh, comedic skill (write the most inevitable setup) and it teaches the distribution from the confident end.

## How it works
The host shows one shared topic word, e.g. `cold`. Each phone PRIVATELY writes a lead-in of ≤12 words that must contain the topic word and ends right before an implied blank, trying to make the model's next-token distribution as peaked as possible — a sentence where only one word can follow (`Ice is extremely` → `cold`). While you type, your phone shows a live local "Certainty" meter (top-1 probability, computed on-device via transformers.js) and the model's current top-guess word, so you can feel the pin tighten. Writing is simultaneous, blind, 60 seconds. The host rescores authoritatively and ranks by highest peak probability (lowest entropy). A blind one-tap grammaticality gate kills degenerate spam.

PRIVATE (phone): your draft, your live certainty meter, and the model's private top-guess hint.
SHARED (host): the topic word, the timer, and the final ranked reveal — each sentence with the model's top word and a big certainty %.

## Technical approach
Both host and phones can run distilgpt2 via transformers.js (phones for the live meter, host authoritative). A WebSocket server (PartyKit / Durable Object over Tailscale Serve) carries the topic, timer, submissions, and gate votes. Data model: `Room{topic, phase}`, `Player{id, text, certainty, topGuess}`. Sync: broadcast topic + timer → phones compute the meter locally (nothing streamed) → submit text at lock → host runs one forward pass per sentence, taking the softmax top-1 probability of the next token → rank. Hard part: mobile model load/perf — debounce the phone's forward passes to ~1 per 500 ms, show a first-load spinner — and correct handling of the trailing-space boundary so the "next token" is the intended blank.

## v1 scope
- 1 topic word, ≤12-word lead-in that must contain it, 60-second timer
- Single round, 3-6 players
- Rank by host-side top-1 next-token probability
- One blind grammaticality gate

## Out of scope
Multi-round play, topic-card decks, full-vocab entropy vs top-1 tuning, ML anti-spam, temperature control.

## Risks & unknowns
Mobile transformers.js load time and jank; players may converge on samey near-tautologies (mitigated by the required topic word); top-1 probability vs true Shannon entropy as the metric (v1 uses top-1 for stability); tokenization of the blank boundary strongly affects scoring.

## Done means
Four phones write topic-containing lead-ins with live certainty meters moving as they type, the host ranks by model top-1 probability and reveals each top-guess word with its %, all in one round, no phone seeing another's draft before lock.
