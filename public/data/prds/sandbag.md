## Overview

Four players share one 8-word sentence on the TV. Under each word is a bar: how surprised a small language model was to see that word there. Each player secretly owns one slot and is scored on how tall their bar ends up relative to the sentence average. For word-game groups who want a fight that's fully visible but whose stakes are entirely hidden.

## Problem

Perplexity games almost always ask you to *write* something surprising. That collapses into thesaurus-diving. The itch is that surprisal is conditional — P(word | what came before) — so the interesting lever isn't your word at all, it's everyone else's. No party game has made that lever the whole game.

## How it works

The host shows the 8-word sentence and a live **skyline**: one surprisal bar per word, fully public, redrawn after every turn. Nobody's score is public, because nobody knows who owns what.

Each phone privately shows: your slot index highlighted, your live score (`surprisal at my slot − mean surprisal of the sentence`), and an edit console — pick any slot, choose a replacement from a searchable 800-word list.

**The crux rule: you may not edit your own slot.** You cannot make your word weird directly. You spike it by wrecking its left context so the model can't see it coming, and you flatten a rival by making their neighbourhood so predictable that anything there is obvious. Since ownership is secret, the only tell is behavioural — whoever keeps sanding down slot 6 probably doesn't own slot 6.

Four turns, all edits submitted simultaneously on a 25-second timer. Two players targeting the same slot **both bounce** — the turn is wasted and the TV announces the collision without naming names, which is itself information. Only the **final** state scores, so turn 4 is a bloodbath.

One brake: if the whole sentence's perplexity exceeds a cap, everyone's score is halved. Word salad spikes every bar equally and ruins the commons, so the room self-polices toward sentences that are strange but still sentences.

Reveal: the TV drops the ownership map and replays all four skylines as an animated flipbook.

## Technical approach

distilgpt2 via transformers.js in the host tab. One teacher-forced forward pass over the 8-token sentence yields every per-token surprisal at once (~50ms) — no generation, no sampling, fully deterministic and replayable. The word bank is pre-filtered to single-token entries and every word is scored with a leading space, so tokenizer boundary effects can't silently change a slot's value.

Server is a PartyKit Durable Object holding `{sentence: string[8], owners: {playerId → slot}, turn, pendingEdits: {playerId → {slot, word}}}`. Sync is a simple barrier: collect edits until all four submit or the timer fires, resolve collisions, hand the new sentence to the host for one inference, broadcast the new skyline. The hard part is resolution *legibility* — the room must be able to read four simultaneous edits and one collision off a single animation, or the whole deduction layer dies.

## v1 scope

- 4 players, one seeded 8-word sentence, 4 turns
- One secret slot each; you may not edit your own
- 800-word picklist, no free typing
- Collisions bounce; perplexity cap halves all scores
- No lobby, no reconnect, no round two

## Out of scope

Free text entry, multi-token words, longer sentences, multiple rounds, spectator betting, per-turn scoring feed.

## Risks & unknowns

The biggest unknown is whether four turns is enough for a spike to survive to the end — it may need 5, or a rule that turn 4 is single-target only. A restricted picklist may feel like a cage; the fix is a *thematically* strange bank (nouns from taxidermy, law, weather) rather than a big one. Ownership may be trivially readable if players fixate; the collision rule is the main obfuscator and needs playtesting.

## Done means

Four phones each privately hold a slot they cannot touch; four turns of simultaneous edits resolve with same-slot collisions bouncing both players; the TV skyline redraws within 1 second of each barrier; and the final screen ranks all four players by final-slot surprisal minus sentence mean, with the halving rule visibly triggered when the room lets the sentence rot.
