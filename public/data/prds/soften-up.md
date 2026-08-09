## Overview

Four players co-write a single sentence on the TV, one word at a time, drawing from a shared bank of 60 bits of surprisal. Each phone privately holds one **cargo** word — something awkward like *ferret*, *chandelier*, *manifesto*. You score by playing your cargo before the bank runs dry, and you score *more* the cheaper it is when you play it. Cheap means the model already expected it.

For groups who want a semi-cooperative sentence game with a live, private price ticker doing the sweating for them.

## Problem

Most collaborative-sentence games have no pressure and no reason to be sneaky. Here the sentence is a commons everyone is quietly deforming toward their own hidden word, and the cost of doing it too obviously is that three other people can see the ground being softened.

## How it works

1. Server deals each phone a private cargo word from a curated rare-ish list.
2. Round-robin. On your turn you type one word (or a 2-word phrase). Host prices it: the sum of its tokens' surprisal in bits under the current buffer. That cost burns from the shared 60-bit bank, publicly, with the number shown on the TV.
3. Any turn you may instead play **your cargo**. Its live cost is deducted, you score `max(0, 12 − bits)`, and your cargo is revealed on the TV.
4. When the bank hits zero the sentence is frozen. Anyone still holding cargo scores 0.

**Phone shows privately:** your cargo word and a live price meter in bits, recomputed every time the buffer changes — your cargo went from 11.4 bits to 2.9 because someone just wrote "reached into the cage for the small furry". **TV shows publicly:** the sentence, the bank, each word's cost as it burns, and one anonymous alarm — how many players' cargo prices dropped sharply this turn. Two people softening at once is visible; who they are is not.

That alarm is the engine. Cheapen your cargo and the room learns *someone* is close, guesses at the shape of it, and spends their turn wrenching the context sideways — which costs bits from a bank you all need.

## Technical approach

Host tab runs `transformers.js` (distilgpt2 or Qwen2.5-0.5B ONNX q4, WebGPU with WASM fallback). Every buffer change triggers five short teacher-forced passes: the played word, plus all four cargos re-quoted. Well under 400ms.

Authoritative PartyKit Durable Object holds `{buffer, tokens, bankBits, turnIdx, phones:[{id, cargo, scored, lastPrice}]}`. Host is the pricing oracle; server owns the bank arithmetic so a refreshed host tab cannot rewrite history.

Sync: strict turn lock — non-active phones get a disabled composer, so there's no simultaneous-write race. Private quotes are unicast to the owning socket; the TV receives only the count of drops over threshold.

Hard part: quote fan-out must stay per-socket and must arrive fast enough that the meter feels live during someone else's turn, otherwise the tension evaporates. Leading-space tokenization has to be handled or costs jump erratically.

## v1 scope

- 4 phones, one sentence, one round, 60-bit bank, hard cap of 14 turns.
- 20-word hardcoded cargo list; no player-supplied words.
- One cargo per player. Scores shown once, at the freeze.

## Out of scope

Multiple rounds, cargo swapping, undo, rejoin, difficulty tiers, model selection.

## Risks & unknowns

60 bits may be far too many or too few — needs playtest calibration against distilgpt2's actual scale. The anonymous drop-alarm threshold is a tuning problem: too sensitive and it fires constantly, too dull and there's no tell. Small models may price common nouns weirdly after ungrammatical buffers.

## Done means

Four phones play a full sentence to freeze; at least one cargo is played at under 4 bits; every phone's meter visibly moves within 500ms of another player's word landing; no phone's cargo word or price appears in any other client's traffic before reveal.
