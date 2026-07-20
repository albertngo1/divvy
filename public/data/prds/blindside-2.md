## Overview
A party word game for 3-6 players where a small in-browser language model (distilgpt2 via transformers.js) is the referee. Everyone shares one fixed FINAL word for the round; each player privately writes the sentence that leads into it, trying to make the model as blindsided as possible when that known word arrives. For groups who like wordplay with a mean streak.

## Problem
Perplexity party games mostly reward minimizing surprise or maximizing whole-sentence chaos — both get samey and gamey. The unscratched itch is the pleasure of setting a *trap*: crafting a perfectly grammatical lead-in that makes an utterly ordinary word land like a slap. Garden-path sentences are inherently funny; nobody's turned that specific effect into a competitive per-phone mechanic.

## How it works
The host TV reveals a target word for the round, e.g. "spreadsheet," shown as a trailing slot: "________ spreadsheet." Each phone privately composes the lead-in (roughly 5-12 words) that ends immediately before the target. Writing is simultaneous and blind; timer ~75s. At lock, the host concatenates each player's lead-in + the shared target, runs the model, and scores ONLY the surprisal of the final target token given that lead-in. Higher surprisal = better trap. A grammar gate (a quick blind thumbs vote where each phone rates two random others, or a lightweight grammaticality check) zeroes out gibberish so pure token-spam can't win. Reveal ranks sentences by target-surprisal, reads them aloud, and crowns the biggest blindside.

PRIVATE per phone: your lead-in draft and a live LOCAL surprisal-on-target meter (the phone runs the model as you type, so you iterate toward a bigger trap). SHARED host screen: the target word, timer, and final ranked reveal. No phone ever sees another's lead-in before reveal — the simultaneous, hidden authoring is the game.

## Technical approach
distilgpt2 in each phone PWA drives the live local meter; the host re-scores authoritatively at reveal with the same model and canonical tokenization so results are consistent. WebSocket server (PartyKit / Durable Object) holds room state: {roundTargetWord, players:{id, leadIn, submitted}, phase}. Sync: phones emit only a debounced final "submitted" event; host pulls all texts at reveal and scores sequentially (a few hundred ms each), then broadcasts ranked results. Genuinely hard part: consistent surprisal of a *specific* token across phone and host — pin the tokenizer, ensure the target tokenizes identically regardless of preceding whitespace, and score the exact target token index. Local meter is advisory; host is truth.

## v1 scope
- 3-6 players, ONE round, one hardcoded target-word list.
- Local live meter + host authoritative rescore.
- Simple blind thumbs plausibility gate.
- Single ranked reveal screen.

## Out of scope
- Multiple rounds or cross-round scoring.
- Fancy grammaticality model.
- Player-chosen target words.

## Risks & unknowns
- Local vs host tokenization drift → confusing score mismatches.
- Degenerate spam that inflates surprisal but reads as nonsense — the plausibility gate must actually bite.
- distilgpt2 load time on older phones.

## Done means
Five phones join; each writes a lead-in privately; host assembles lead-in + shared target, scores the target token's surprisal, and shows a correct ranked reveal where the highest-surprisal grammatical lead-in wins — and scores reproduce identically on rerun of the same inputs.
