## Overview

A 4-player, ~8-minute cooperative writing game for a shared TV and private phones. The room composes a single sentence — a note left for whoever uses this room next — but no person, and no screen, ever holds more than a fragment until the sentence is sealed, read aloud once, and printed unsigned. It's exquisite corpse with the folds moved: not sequential, not adjacent, and with a feedback signal instead of blind luck.

## Problem

Exquisite corpse is a one-joke format: everyone writes blind, the result is nonsense, everyone laughs once. There's no *play* between writing and revealing. Fold Line adds a gradient — you can tell you're making it worse — and takes away the compensating comfort of ever seeing the thing.

## How it works

The TV shows a skeleton: 8 slots with a part-of-speech hint and a title ("A note to whoever finds this room next"). Each phone **privately** owns 2 non-adjacent slots and shows only those as text fields. Every other slot renders on your phone as ▮ blocks matching the current letter count — you know a word is 6 letters, never which.

Each commit (5 per player) sends your slot text to the server, which scores the **whole** sentence for coherence and unicasts back one private needle: WARMER, COLDER, or NO CHANGE versus your own previous commit. Nobody sees anyone else's needle.

The **TV** shows only fold-lines: the sentence as blurred bars, and one unlabeled group tension bar. The room argues out loud under one rule — describe your words, never say them. ("Mine's a verb, past tense, and it went cold when I made it longer.")

After 20 total commits or 5 minutes, the sentence seals. The host reads it aloud, once. Then every phone taps KEEP or BURN: unanimous KEEP renders a printable, unsigned card. That's the entire win condition.

## Technical approach

PartyKit Durable Object; phone PWAs over WebSocket. State: `{slots: [{i, pos, ownerId, text}], commits: [{playerId, i, before, after, score}], scoreHistory}`. Slot text is unicast **only** to its owner; everyone else receives `{i, length}`. The full sentence exists only server-side until the seal event — that's the load-bearing bit, and it's why one passed-around phone kills the game outright.

The hard part is the needle. A single LLM coherence call is noisy enough that WARMER/COLDER becomes a coin flip. Mitigation: fixed judge prompt, temperature 0, score three times and take the median, and only report a direction when |Δ| clears a tuned threshold — otherwise report NO CHANGE honestly rather than inventing signal. Commits queue server-side so scoring is serialized and every needle refers to a well-defined prior state.

## v1 scope

- 4 players, one sentence, 8 hand-authored slots, one round
- 5 commits each, hard 5-minute cap
- One judge call (×3 median) per commit; no streaming, no partial scoring
- Seal → read aloud → unanimous KEEP → PNG card

## Out of scope

Multiple rounds, player-authored skeletons, images, voice input, any leaderboard.

## Risks & unknowns

- Judge noise makes the gradient meaningless — the core risk; measure needle stability in playtest before building anything else.
- Verbal leakage: the no-saying-words rule is social only, unenforced.
- Latency: 3 judge calls per commit may exceed 3 s; pre-warm and cache identical sentences.
- Nonsense output might be the *good* outcome — v1 treats a funny broken sentence as a win, not a failure.

## Done means

Four phones fill eight slots without any client ever receiving text it doesn't own; the TV displays no legible word before the seal; the needle returns the same direction on ≥70% of repeated identical commits in a 20-commit playtest; a unanimous KEEP renders a downloadable PNG of the sentence with no names on it.
