## Overview

Drone is a real-time elimination game for 3-6 players: a battle royale of banality. Every phone is a private text field; the host TV is a scoreboard of hearts. A small in-browser LM reads each player's stream word by word, and any word that costs too many bits kills you a little. For groups who want a fast, loud, physical-feeling round rather than a write-and-reveal.

## Problem

Perplexity games are almost always turn-based reveal games: write, wait, score, laugh. There's no game in this genre with *live pressure*, where the model's judgment lands while your thumbs are still moving. Drone makes surprisal a continuous hazard instead of a verdict.

## How it works

On GO, all phones unlock simultaneously. You type prose. On every space, the host model scores that word's surprisal given **your own** running prefix.

- Word above the threshold (~9 bits) → **strike**. Three strikes, you're out.
- Repeating a bigram you've already used → strike (kills "and then and then").
- Last player alive wins; if the 90s cap hits, fewest strikes wins.

So far that's a race to write oatmeal. The twist is the **SHOCK**: at random moments the host privately hands each phone a different rare word — *aardvark*, *escrow*, *tambourine* — and a countdown of six words. You must use it within the window or take a strike. And when you use it, it's scored like any other word.

The game is therefore: build a *runway*. You have four or five words to steer your own context so the model finds "aardvark" cheap when it lands. Everyone is doing this at once, blind, with different words, under a clock.

**Private per phone:** your text, your shock word and its countdown, your live bits-per-word meter. **Shared host screen:** each player's name, hearts remaining, and only their single most recent word ticking past — enough to make the room shout, not enough to copy strategy from.

## Technical approach

Durable Object room; host tab runs transformers.js/distilgpt2. Phones send `{playerId, word, seq}` on each space over WebSocket. The host keeps a **per-player KV cache** and does one incremental forward pass per new word, batching arrivals in ~150ms windows so N players share passes.

State: `{phase, deadline, players:{id,name,strikes,words[],shock:{word,deadlineIndex}|null,alive}}`. Shocks and text stay private; only `{name,strikes,lastWord,alive}` broadcast.

Genuinely hard part: N independent KV caches on one single-threaded model with a ~300ms end-to-end budget, plus out-of-order/late words needing sequence-number reconciliation — a strike that lands two seconds after you typed the word feels broken, so the pipeline must stay shallow and drop rather than queue.

## v1 scope

- 3-4 players, ONE round, 90s hard cap
- Fixed threshold, 3 strikes, exactly 2 shocks per player from a 20-word list
- Bigram-repeat check only; no grammar checking
- Host tab does all inference; no reconnect, no lobby, no rematch

## Out of scope

Difficulty tuning, per-player handicaps, multi-round tournaments, phone-local models, spectators, replay export.

## Risks & unknowns

Threshold calibration is everything — too tight and everyone dies in ten seconds, too loose and nobody dies. Typing speed variance may dominate skill (consider word-count-based rather than time-based shocks). Model throughput with 4 live streams on a laptop is unproven. Degenerate strategies (endless comma clauses) may need a banned-token list.

## Done means

Four phones plus a host: all type at once, strikes appear on the TV within ~300ms of the offending word, shocks arrive privately and differently per player, someone is eliminated, a winner is declared — and a first-time player understands the rule "be boring" without explanation.
