## Overview
Swerve is a concurrent-room party writing game where your score is how much you surprise a small in-browser LLM — measured as perplexity — without your continuation collapsing into nonsense. Shared host screen plus 3–6 phones as private controllers.

## Problem
"Be creative" games have no objective creativity meter, so they degrade into popularity contests. Swerve installs one: per-token perplexity. But raw perplexity rewards gibberish, so it's pinned against a human coherence gate. The tension between fooling the machine (be unpredictable) and keeping people on board (stay readable) IS the game.

## How it works
The host screen shows a shared sentence stem: "By the third day, the lighthouse keeper finally ___." Each phone PRIVATELY writes a continuation (≤12 words) — simultaneous, hidden, no copying off a neighbor. The host's LLM computes the perplexity of each continuation given the stem (mean per-token surprise): high perplexity means you swerved hard from the expected word. Then the twist — continuations appear ANONYMOUSLY on the host screen, and every phone privately votes each one COHERENT or WORD-SALAD. Your perplexity only counts if a majority calls you coherent; gibberish gets zeroed. Winner = highest surviving perplexity: the most unpredictable thing that still reads as a real sentence. Private writing (simultaneous, no peeking) and private voting (no bandwagon) are both load-bearing.

## Technical approach
The host tab runs one small causal LM (transformers.js GPT-2 / WebLLM) as the authoritative scorer; phones are PWA WebSocket clients (PartyKit / Durable Object / Socket.IO over Tailscale Serve). Data model: Room{code, phase, stem, players[]}, Player{id, text, perplexity, votesCoherent, votesSalad}. Flow: server broadcasts stem → collects private texts → host scores perplexity by summing per-token −log p over one forward pass on stem+text and normalizing by token count → server opens the vote phase, collects one coherence vote per continuation per other player → server computes survivors and ranks. The genuinely hard part: stable per-token NLL across variable-length inputs, batching all forward passes on the host without freezing the tab (a Web Worker), and a fair length-normalization so long weird sentences don't dominate short punchy ones.

## v1 scope
- One round, one stem, 3–6 players.
- One model, host-side scoring.
- Binary coherent/salad vote, simple-majority gate.
- Winner = max normalized perplexity among survivors.

## Out of scope
- Multiple stems / rounds, cumulative scoring.
- Weighted or graded coherence votes.
- Anti-collusion, model choice.

## Risks & unknowns
- Perplexity normalization: needs to be strictly per-token to be fair across lengths.
- Players may vote strategically (salad the leader) — acceptable chaos, or does it need anonymized shuffling?
- Six forward passes may jank the host tab without a worker.
- Is "coherent" a clear enough vote label for a fast party read?

## Done means
Six phones submit hidden continuations to one stem, the host computes each one's per-token perplexity live in-browser, phones privately vote coherence, and the host screen ranks survivors by perplexity and names a single winner — one round, no reload.
