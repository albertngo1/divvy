## Overview

A four-player, single-round word game. The room co-writes one eight-word sentence, each player adding words from a private tile rack. Three players read the true sentence on their phones. The fourth reads a version where every word *someone else* played has been replaced by a stable one-hop semantic neighbour — dog→wolf, kitchen→basement, quietly→slowly. Their own words are untouched, so their memory never contradicts their screen. They are not told.

## Problem

Collaborative writing games (Consequences, exquisite corpse) are pure chaos with no deduction layer, and "one player has different info" games usually announce the asymmetry so the imposter can play it. The interesting feeling — *why is everyone building toward something that doesn't fit?* — only exists if the corrupted player believes their screen. This game is about the slow, private suspicion that the room has lost the plot, when actually you have.

## How it works

**The TV shows no text at all.** It shows whose turn it is, a 20-second timer, eight slots filling in, and a reaction ticker. Every readable word lives on a phone. That single decision makes per-phone architecture non-negotiable.

1. **Racks.** Each phone privately holds six word tiles drawn from a curated 200-word bank (nouns, verbs, adverbs, connectors).
2. **Build.** Round-robin, twice around. On your turn you tap one tile; it appends to the sentence. Your phone re-renders the sentence-so-far. The Reader's render applies the swap map to other players' words only, consistently — the same true word always drifts to the same fake word, so no flicker gives it away.
3. **Quote budget.** After the eighth word, each player may push **exactly one two-word adjacent fragment** from their view to the TV. This is the only verbatim text the room ever shares, and it's enforced by the UI, not by honour. Fragments land on the TV unattributed at first, then attributed.
4. **Table talk.** 60 seconds of open discussion, describing the sentence without more quoting.
5. **Vote.** Everyone privately names the Reader. The Reader votes too — they may not know it's them. Reader scores if uncaught, or if they self-identify *and* correctly name one swapped word.
6. **Reveal.** TV prints both sentences, word-diffed.

## Technical approach

Host tab + phone PWAs + a PartyKit Durable Object (or Socket.IO over Tailscale Serve). Model: `room{bank, racks:{pid:[6]}, sentence:[{pid, word}], readerId, swapMap, fragments[], votes}`. The server holds one true sentence; each socket gets a rendered projection. Swaps come from a **static curated JSON table** (word → one neighbour), not a runtime LLM call: deterministic, zero latency, reviewable for taste.

The hard part is coverage and consistency. Free typing would produce words with no neighbour, and pass-through gaps are a giveaway — hence the tile rack, which guarantees every playable word has a swap. Sync is easy (one append per 20s); the real work is guaranteeing no true text ever reaches the host channel.

## v1 scope

- 4 players, one sentence, eight words, one round
- 200-word bank with hand-written neighbours, 6-tile racks, no refills
- One 2-word quote per player, one vote, one diff reveal
- TV renders four states total; no animation

## Out of scope

Free typing, multiple rounds, 3 or 5+ players, grammar checking, sentence scoring, LLM-generated swaps, saved transcripts.

## Risks & unknowns

Eight words may be too short for drift to matter — the fix is 12, but that lengthens the round. A one-hop swap may read as a normal weird sentence, since these sentences are weird anyway; neighbour distance needs playtest tuning. The quote-budget phase might resolve it instantly, in which case fragments become one word each.

## Done means

Four phones build one sentence, exactly one phone rendered the drifted version consistently throughout, all four quote fragments post to the TV, the vote resolves, and the diff screen shows at least three swapped words that the Reader confirms they never questioned.
