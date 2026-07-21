## Overview
Sleight is a 3–6 player party game built on the gap between what LOOKS fluent to a person and what SCORES fluent to a language model. Each player secretly holds one of two opposite missions and writes a single sentence that maximally splits human intuition from model perplexity. For people who enjoy hidden-role bluffing plus the eerie ways a small LLM disagrees with your gut.

## Problem
Every perplexity party game so far treats the model score as the truth. But the interesting truth is that model perplexity is NOT human intuition — text can read like gibberish yet score low, or read smooth yet spike. No game has made that divergence the whole point, with secret asymmetric goals exploiting it in opposite directions.

## How it works
Each phone privately draws a secret TYPE:
- **Trojan**: write a sentence humans rate FLUENT but the model scores HIGH perplexity (secretly weird to the machine).
- **Gremlin**: write a sentence humans rate WEIRD but the model scores LOW perplexity (secretly obvious to the machine).

Under a timer, each phone privately writes one sentence about a shared topic word shown on the host. Phones show ONLY your own type card and your text box (no live model meter — you must feel the gap yourself). Then a blind voting phase: the host displays sentences one at a time (authorless), and every phone privately taps a human-fluency slider (fluent ↔ weird) for each sentence but their own. Meanwhile the host silently scored each sentence's perplexity with distilgpt2. At reveal, each sentence gets a GAP score = distance between averaged human-fluency rank and model-perplexity rank, signed by the author's secret type. Biggest correctly-directed gap wins; a Trojan that everyone found smooth but the model hated is a perfect sleight.

## Technical approach
Host tab is authoritative: distilgpt2 via transformers.js scores perplexity offscreen during the vote so it can't leak. WebSocket server (PartyKit Durable Object or Socket.IO over Tailscale Serve) state: `{players:[{id,type,text,humanVotes[]}], topic, phase}`. Types dealt per-socket, never broadcast. Human votes stream in privately and aggregate on host. Hard part: the whole game hinges on humans NOT seeing model scores until reveal and NOT knowing authorship during voting — strict phase gating and per-socket secrecy are the load-bearing sync problem. Ranks (not raw ppl) normalize away model-scale weirdness.

## v1 scope
- One round, 3–6 players, two types dealt ~50/50
- One shared topic word from a small list
- Blind private per-phone fluency vote (single slider per sentence)
- Host-side authoritative perplexity; gap = |humanRank − modelRank|

## Out of scope
- Multi-round, more than two types, chip betting
- Explaining WHY the model disagreed (token heatmaps)
- Tie-break subtleties

## Risks & unknowns
- Players may not intuit model behavior at all round one; a demo pair primes them
- Human votes with 3 players are noisy — may need a 4-player floor
- Rank-gap math needs a clean tie policy

## Done means
Four phones each get a secret Trojan/Gremlin type, write blind, privately rate each other's sentences without seeing authors or model scores, and the host reveals a signed gap ranking crowning whoever split human and model judgment widest in their assigned direction — one round, under three minutes.
