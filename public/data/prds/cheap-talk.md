## Overview
A 6-minute game for 3–4 people, TV plus phones. One paragraph grows on the shared screen. Every word anyone adds is *priced* — its cost in bits is the surprisal the tiny LLM assigns it given the paragraph so far. You have a private wallet and a private secret word you must land before you go broke. Cheap talk isn't.

## Problem
Writing party games score the *output*: funniest, cleverest, most-voted. Nobody makes language actually cost something. Surprisal is a real, computed, non-arbitrary price, and pricing turns the shared context into an economy with a genuinely weird property: **other players' words change your prices.** If someone writes "the burrow was empty," FERRET just got cheap for you, and they'll never know they subsidized you.

## How it works
**Setup.** TV shows a seed: *"The inspector arrived at nine and found"*. Each phone privately gets a secret word from a 20-word list, a wallet of 60 bits, and a live price oracle.

**Three beats.** Each beat, everyone simultaneously writes a continuation of ≤6 words. Price = sum of −log₂ p(token | the paragraph **frozen at beat start**). Your phone shows a running total and per-word coin badges as you type. Only you see it.

**Landing.** You may include your secret word. It costs its current price like anything else, but you collect a **bounty** = its price against the seed minus its price now — literally, how much cheaper the room made it. So you want to wait while the paragraph drifts your way. 

**Rent.** Every beat costs 8 bits just to exist. Waiting isn't free either.

**Resolution.** Submissions append in ascending price order — cheapest speaks first — but pricing was frozen, so order never punishes anyone within a beat. It only shapes the *next* beat's prices, which is where the knife-fight is.

**Score.** Bounty collected + bits remaining. Zero if you never land.

The TV shows the paragraph, the frozen-context hash, and wallet bars. Never the targets, never anyone's drafts, never the oracle.

## Technical approach
PartyKit Durable Object. State: `{beat, contextHash, paragraph: [{playerId, text, priceBits}], players: {id, wallet, secret, draft (server-only)}}`.

Host tab is the sole inference site (transformers.js, distilgpt2-int8). Endpoint: `price(candidateText) → per-token bits[]`, always evaluated against the frozen prefix. At beat start the host runs **one** forward pass over the paragraph prefix and caches the KV state; every player's pricing request then only runs their ≤6-word suffix. Phone → 300ms debounce → unicast reply.

Hard parts: (a) reusing one KV cache across many concurrent per-player suffix passes inside a single tab without corrupting it; (b) making the price feel *fair* — "ferret" is multiple subword tokens, a leading space changes everything, so we always price with a leading space and sum subwords into a single word-level cost; (c) proving simultaneity to a suspicious table — the TV prints the frozen-context hash each beat so nobody can claim they got priced against someone else's word.

**Why per-phone is load-bearing:** the oracle is a *probing* tool. Every word you price is a word you were considering. A shared phone would broadcast your target within two queries. Probing must be continuous, private, and concurrent — that's the whole game.

## v1 scope
- 3 players, one seed sentence, exactly 3 beats
- 60-bit wallets, 8-bit flat rent, 20-word target list
- Bankruptcy = a text line saying you're out
- Plain-text scoreboard

## Out of scope
Multiple rounds, bit trading, negotiation phase, custom seeds, undo, spectators, model swapping, mobile inference, sentence-quality judging.

## Risks & unknowns
1. **Calibration is a total guess.** A rare noun might cost 18 bits and "the" 0.6. Wallet and rent numbers are made up until playtested.
2. **Does steering actually work?** distilgpt2 may be too weak for a human-written 6-word nudge to meaningfully drop a target's surprisal. If it doesn't, the game has no engine.
3. Bounty may be degenerate — everyone just waits for beat 3.
4. A 6-word cap may produce unreadable paragraph slop, which is either the charm or the failure.

## Done means
First: an offline script showing that a human-written 6-word steer drops the target word's surprisal by ≥3 bits for at least 7 of 10 sample targets. Only then build the room. Then: 3 phones, each with a private live price meter the TV never mirrors, the frozen-context hash printed each beat, wallets visibly draining, and at least one word landed for a nonzero bounty in a real playtest.
