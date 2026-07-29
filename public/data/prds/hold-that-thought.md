## Overview

Hold That Thought is a 3-player cooperative game about interruption, for a TV and phone PWAs. Each phone privately holds a recitation you must read aloud continuously *and* a queue of interruptions you're required to inflict on a named teammate. You are simultaneously the person being derailed and the person derailing.

## Problem

Devils & the Details is about doing chores while being pestered. But every voice party game treats overlapping speech as *failure* — collision, stepped-on, dead air. Nobody has made overlap the **objective**: the round cannot be won unless you break into someone else's sentence, extract a verbal answer, and survive the same being done to you.

## How it works

**Private on your phone:** an 8-line recitation (an inventory count — "crate four, eleven jars, two crowbars…") with a live cursor showing where your phone thinks you are; plus 2 interrupt cards that unlock on a timer, each naming a target and a demand ("get BO to say the word PEAR").

You read your lines aloud in order; your phone advances the cursor from your own voice. When a card unlocks you must cut into your target mid-line and extract the demanded word. Their phone hears them say it — resolving your card — and also registers that they left their recitation. When they resume, they must resume at the *correct* line; repeating or skipping is a **DROP**.

**Shared TV:** three progress bars, an unresolved-interrupt count, a DROPS counter, and the clock. Never any contents.

The comedy is structural: to resolve your card you must interrupt someone who is mid-interrupting someone else, and the instant you answer *them* you've endangered your own thread. Win = all three recitations finished and all six cards resolved in 120 s with ≤2 drops.

## Technical approach

PartyKit Durable Object per room. Each phone runs Web Speech recognition against a tiny closed vocabulary — its own 8 lines plus its demand tokens — and a 20 Hz RMS meter. A phone only advances its cursor when its owner is the argmax-RMS mic in that window, which is how own-voice is separated from room cross-talk. Interim transcripts are fuzzy-matched (phonetic + Levenshtein) against the next expected line; an in-order match advances the cursor, an out-of-order match books a DROP.

Model: `Player {lines[], cursor, drops}`, `Card {id, from, to, demandToken, state, windowMs}`. Cards are registered server-side; when the *target's* phone reports the demand token inside the interrupter's active window, the server resolves it and fans out. Phones stream cursor deltas and RMS at 10 Hz; the server is authoritative on cursors, drops, and card state.

Hard part: word-level attribution in genuine cross-talk. Two mitigations, one clever: the closed vocabulary, and **disjoint vocabularies across players** — no two recitations share a word, so a neighbour's speech can never advance your cursor by construction. Failsafe: a tap-to-advance button, present but deliberately awkward.

## v1 scope

- 3 players, one 120-second round
- Hand-authored recitation set: 8 short lines each, vocabulary disjoint across players
- 2 cards per player, one demand type only ("get X to say WORD")
- Drops detected only from out-of-order matches
- TV: three bars, unresolved count, drop counter, end card
- Room code, no accounts, no reconnect

## Out of scope

Scoring/leaderboards, 4+ players, additional demand types, LLM-generated recitations, reconnect, native apps, replay export.

## Risks & unknowns

- ASR in three-way cross-talk may still be unreliable; the tap failsafe is insurance, not design.
- Interrupting is socially costly — a dominant player can hijack the round. Short rounds and required-cards-per-player are the counterweight.
- Disjoint vocabularies may make recitations read as arbitrary word salad; needs a writing pass for flavour.
- The "resume at the right line" rule may be invisible in the moment; the cursor UI has to be unmissable.

## Done means

Three phones, one TV, one 120-second round: each player's cursor advances purely from their own speech with zero taps, at least one card resolves because a target verbally answered mid-line, at least one DROP is registered from a bad resume, and the TV shows the final tally within a second of the buzzer.
