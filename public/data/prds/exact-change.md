## Overview

A 4-player cooperative writing game for a living room with a TV and four phones. The host screen shows one prompt and one bill: **120 bits**. Every word anyone types costs its surprisal under a small in-browser language model. The room must pay the bill *exactly* — not approximately — by collectively tuning how obvious their writing is.

## Problem

Party writing games reward being funny, which means the two wittiest people perform and everyone else fills out a form. And the current crop of "AI party games" use the model as an opaque taste judge, which feels arbitrary and unappealable. Exact Change makes the model a **cash register** instead: a transparent, mechanical, per-word price you can watch tick up. Nobody argues with the register. You argue about who's going to spend the last nine bits.

## How it works

**Host screen (public):** the prompt ("Describe the inside of your fridge to a stranger"), the bill (120), and one giant gauge showing the running total — split into LOCKED (solid) and FLOATING (shimmering). Nothing else. No names, no per-player split.

**Each phone (private):** a text box, and beneath every word a coin showing its cost in bits: `-log2 p(word | your own text so far, plus every answer already locked)`. Your subtotal, huge, at the top. You see only your own.

Everyone types at once, talking out loud the whole time. The gauge trembles because it is summing four live drafts, so you learn the *total* and never the split — the only way to find out who is being expensive is to ask, and people lie about being expensive.

**LOCK** is the one real decision. Locking freezes your bits and re-prices everyone still floating, because the model now conditions on your text. Lock first and you pay retail. Lock last and your fridge words are dirt cheap — the model has already read three fridge answers — but you're the one who has to hit the exact remainder with cheap currency, which is like paying $9.17 in nickels.

Round ends when all four lock. Win at total within ±3 bits.

## Technical approach

distilgpt2 (~82M) via transformers.js on WebGPU, running **only in the host tab**; phones are dumb renderers. Server is a PartyKit Durable Object holding `{prompt, bill, players: {id, draft, bits[], subtotal, lockedAt}, lockOrder[]}`. Phones send debounced (250ms) draft deltas → DO → host. Host runs a single-threaded scoring queue: for a dirty draft, score `[locked answers in lock order] ++ [that draft]`, keep per-token logprobs of the draft segment only. Fan-out: each phone gets its own `bits[]`; host gets the sum.

The hard part is four people typing at once against one GPU queue. Needs job coalescing (drop stale scoring jobs per player), and a shared KV-cache for the locked prefix — it's byte-identical across all four players, so cache once and fork per draft. If the public total lags more than ~400ms the "STOP TYPING" panic stops landing, and the panic is the game. Second hard part: the lock cascade, where every floating price changes at once and the gauge must jump honestly rather than ease smoothly.

## v1 scope

- Exactly 4 players, 1 prompt, 1 round, fixed 120-bit bill.
- Subword bits summed and rendered per whitespace-delimited word.
- Win/lose only. No points, no rematch button.
- Join by 4-letter code on a URL; no accounts, no lobby art.

## Out of scope

Multiple rounds, prompt packs, handicaps, on-phone inference, spectator mode, persistence, voting on funniest answer.

## Risks & unknowns

- Degenerate play: one player types "the the the" for ~0 bits and dumps the whole bill on someone else. Likely needs a per-player band (must land 15–60), but v1 should ship without it and watch.
- Does re-pricing on lock read as the game cheating? Needs a loud "PRICES DROPPED" flash.
- Tokenizer weirdness (leading space, casing) making a coin feel arbitrary; tapping a word should show the model's top-3 alternatives so the price is explicable.

## Done means

Four phones, one laptop, a group that has never played: they land within ±3 bits, and afterward someone explains — unprompted — that locking last was the cheap seat.
