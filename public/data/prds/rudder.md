## Overview
Rudder is a real-time hidden-team party game (4–6 players) where a small in-browser LM generates a sentence token by token, and the players — not the model — choose each next word by private vote. Half the room secretly wants a coherent sentence (low perplexity); half wants chaos (high perplexity). The model's final perplexity, scored against a threshold, decides the winning team.

## Problem
Every LLM party game so far is a *writing* game scored after the fact. Nobody has made the generation itself a live tug-of-war. The itch: steering an autoregressive model in real time, blind to your neighbors, while trying to read who's secretly pulling the other way — social deduction fused with an actual language model as the battlefield.

## How it works
At game start each phone PRIVATELY learns its team: **Helm** (wants low final perplexity) or **Wake** (wants high). The host TV shows a seed stem, e.g. *"The detective opened the door and"*. Each turn the host runs distilgpt2, takes the top-5 candidate next tokens, and broadcasts those 5 words to every phone. Each phone PRIVATELY taps one candidate; the server tallies votes and appends the plurality winner (deterministic tie-break) to the shared sentence, which grows visibly on the TV. This repeats for exactly 6 tokens. Then the host computes the full sentence's perplexity, compares it to a pre-tuned gate, reveals win/lose, and unmasks every player's secret team.

Private per-phone: your hidden team, and your per-turn vote. Shared host screen: the growing sentence, the candidate words each turn, the live perplexity meter, and the final reveal. The fun is that Wake players must sabotage without being obvious — always picking the weirdest word paints a target on you.

## Technical approach
Host tab is authoritative: loads distilgpt2 (transformers.js), owns the token sequence, and each turn does one forward pass to get top-k logits. Phones are WebSocket controllers (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Game { seedTokens[], turn, roles{playerId->team} }`, `Turn { candidates[5], votes{playerId->idx}, deadline }`. Sync strategy: strict turn barrier — server opens a turn, waits for all votes or a 10s timeout (missing = abstain), appends the winner, advances. The genuinely hard part is the real-time round barrier under flaky phone connections plus keeping per-turn model inference fast enough (<1s) so the tug-of-war feels live; distilgpt2 top-k on a short context is cheap enough on a laptop.

## v1 scope
- 4–6 players, ONE sentence of exactly 6 tokens, one round.
- Fixed seed stem, fixed top-5 candidates, single hidden-role split.
- One perplexity gate hardcoded; binary team win/lose reveal.
- 10s per-turn timeout with abstain.

## Out of scope
- Multiple sentences, scoring across rounds, variable team sizes.
- Player-tunable sentence length or candidate count.
- Reconnection recovery mid-turn beyond treating drops as abstain.

## Risks & unknowns
- Small player counts make vote ties frequent; tie-break rule must feel fair, not random-feeling.
- The perplexity gate needs tuning so neither team wins trivially.
- Saboteurs may be too easy or too hard to spot with only 6 tokens.

## Done means
Four phones each hold a secret team, vote privately across six live turns to build one sentence on the TV; the host scores its perplexity against the gate, declares the winning team, and unmasks roles — with every turn's vote staying private throughout.
