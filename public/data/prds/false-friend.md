## Overview
A hidden-role word game for 4-6 players in a room with one TV and everyone on their phone. The group collaboratively translates a single sentence from a made-up language into English — but one player's private dictionary has been quietly corrupted, and the group has to sniff out whose contribution doesn't belong.

## Problem
Most 'one of you is different' games make the imposter LIE. The itch here is subtler and meaner: the imposter isn't lying, they're being faithful — to a source of truth that's wrong. They read a plausible, internally-consistent view and only discover the betrayal when their honest work clashes with everyone else's. That gaslit 'wait, why does my word look weird' feeling is the whole game.

## How it works
The host TV shows a 5-6 word sentence in an invented language, e.g. `KODA VREN MALO SITHE PENU`, with each word slotted to a player. Each phone PRIVATELY shows a small dictionary — just the ~8 entries that player needs — plus which word is theirs to translate. Players tap their English translation; as each locks in, the TV fills that slot, assembling a shared English sentence live.

Exactly one phone (the False Friend) has ONE dictionary entry subtly wrong — `VREN = river` for everyone, but `VREN = fire` on the imposter's phone. When their slot fills, the sentence reads almost-sensibly-but-off ('the fire carried the boat downstream'). Then a REVISION round: any player may flag one slot and propose a replacement word from their own dictionary; the TV shows competing candidates. Now the imposter has agency and a dilemma — their dictionary still insists on 'fire,' so defending their word exposes them, but caving to the group's 'river' means abandoning the only truth they were given. Everyone privately votes the corrupt player; reveal.

The TV shows only the shared sentence and vote tally. Dictionaries never appear on it.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `Room { roomCode, phase, sentence: Word[], players: {id, name, assignedSlot, dict: Map<token,english>, isImposter} }`. On start, server generates one canonical dictionary, clones it per player, then mutates exactly one entry on one player. Sync is trivially cheap — slot fills and revision proposals are small events; server is the single source of truth for the assembled sentence and broadcasts diffs. Genuinely hard part: authoring dictionaries so the corrupted word produces a sentence that's WRONG but not gibberish (must stay grammatical and tempting), plus balancing which slot is corrupted so it's neither trivially obvious nor invisible. Curated word/sentence templates in v1 sidestep procedural generation.

## v1 scope
- 4 players, one round, one hand-authored sentence + dictionary set.
- One corrupted entry, fixed position.
- Fill phase → one revision round → private vote → reveal.
- Phones: dictionary + your slot + tap-to-translate + vote.

## Out of scope
- Multiple rounds, scoring across rounds.
- Procedurally generated languages.
- Imposter knowing they're corrupted (they don't).
- More than one corrupted word.

## Risks & unknowns
- Authoring balance: too-obvious vs. undetectable corruption.
- Does the revision round create real tension or just noise?
- Reading-heavy; may drag with slow readers.

## Done means
Four phones join a room code, each sees a private dictionary, the TV assembles a live sentence, one phone's word reliably reads 'off,' a revision round runs, and a private majority vote correctly fingers the corrupted player more than chance in playtests.
