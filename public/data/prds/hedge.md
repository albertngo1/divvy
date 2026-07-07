## Overview
Hedge is a spectator-betting party game for 3–5 players. The shared host screen (TV/laptop) completes a prompt one word at a time using a small in-browser language model; each player's phone is a private betting slip. You're not guessing the text — you're wagering on *where the model will hesitate*. It's for groups who enjoy reading a black box like a poker face.

## Problem
Everyone has intuitions about when an AI "knows" the answer versus when it's flailing, but that intuition is invisible and untested. Hedge turns the model's uncertainty into a live, legible, wager-able signal — you win by out-reading the room on the machine's confidence.

## How it works
The host loads a prompt with a known hesitation point (e.g. "The capital of the country whose flag has a maple leaf is ___"). The model greedily generates ~4 tokens. Before EACH token is revealed, a private betting window opens on every phone: you split your chips between **CONFIDENT** (the model's next-token entropy will be low) and **CONFUSED** (high). Bets lock, the host reveals the token AND animates an entropy needle showing the model's actual Shannon entropy at that position, and the server pays out proportional to how right you were.

**Each phone shows privately:** your current bankroll, your CONFIDENT/CONFUSED chip sliders, a lock button, and your personal payout after each reveal. **The host screen shows publicly:** the prompt, the text unfolding token by token, the dramatic entropy gauge after each lock-in, and a chip-total leaderboard. Crucially, nobody sees anyone else's bet — the whole game is refusing to copy the sharp player.

## Technical approach
Host tab runs transformers.js (distilgpt2/gpt2) and is authoritative for entropy. A WebSocket server (PartyKit / Cloudflare Durable Object) holds room state: `players[]`, `bankroll`, `roundIndex`, `locked{playerId: {confident, confused}}`. Flow per token position i: host computes the next-token distribution, broadcasts `betting_open{position:i}` **without the distribution**, phones POST bets, server collects and signals lock, host reveals token + entropy, server computes payouts, broadcasts `resolved`. Sync strategy: server is the clock; host only publishes entropy after all bets lock. The genuinely hard part is (a) gating so the distribution never leaks pre-lock, and (b) normalizing raw entropy into a fair 0–1 "confusion" scale using the model's typical per-token entropy range, so payouts feel calibrated rather than random.

## v1 scope
- One hand-picked prompt with a clear hesitation point
- 4 revealed tokens, 3–5 players
- Binary bet only (confident vs confused), flat 10 chips per token
- Greedy decode (text is fixed; only betting is live)
- Winner = most chips after 4 reveals

## Out of scope
- Multiple prompts / prompt packs, model selection
- Prop bets on the specific token, side pots, all-ins
- Sampling-based (non-greedy) generation

## Risks & unknowns
Small-model entropy can cluster (often overconfident) → flat, boring rounds; mitigate with curated prompts that reliably hesitate. Entropy of tiny models is noisy. Per-token compute latency on a laptop-grade host may stall the betting cadence.

## Done means
Four players on four phones; the host reveals a 4-token completion; each token has a live private betting window; the entropy needle animates on reveal; bankrolls visibly diverge; a winner is crowned — with no phone ever seeing another's bet before lock.
