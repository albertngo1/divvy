## Overview
A 3–4 player writing-sabotage game. One paragraph lives on the TV. Everyone gets the same paragraph on their phone as tappable word-chips, plus a **secret objective** for how the final text should end up. All edits are submitted blind and simultaneously — and any two claims that overlap even by one word are *both* thrown out, with the contested words scarred into permanent █ blocks. It's a merge conflict as a party game. For word-game groups who want negotiation with no enforcement.

## Problem
Collaborative-writing party games are additive: everyone contributes, the pile gets funnier. Nothing models the actual experience of two people reaching for the same sentence — where the result isn't a compromise, it's rubble. And the theme demands a game where *agreement is the failure*: here, two people who both correctly identify the best word in the paragraph destroy it for everybody, including themselves.

## How it works
**Host screen (public):** the paragraph, huge, ~30 words. Scars render as black blocks. Nothing about anyone's pending claim is ever shown here until resolution.

**Phone (private):** the same paragraph as word-chips. You drag across a contiguous run of 1–4 words to CLAIM it, then pick one verb: **CUT** (delete the run), **SWAP** (reverse its word order), or **SHOUT** (uppercase it). Also private: your **objective** ("the final paragraph must end in a question", "must still contain the word *inheritance*", "must be under 20 words") and a private highlight of 3 words worth double to you — so your greed is shaped differently from everyone else's, and nobody can tell whether your desperation about a word is real.

You get 45 seconds per wave, and you can talk the entire time. You can also lie the entire time; nothing is enforced. At lock-in the server resolves: claims with intersecting word-index ranges are all discarded and their intersecting words become SCARRED — unclaimable forever, rendered as blocks. Surviving claims apply, left to right, animated one at a time on the TV. Wave 2 runs on the mangled, scarred remains. Then objectives flip face-up and someone reads the wreckage aloud.

## Technical approach
Socket.IO over Tailscale Serve (or PartyKit). State: `doc{tokens[]{id,text,scarred}}`, `players[]{id,objective,doubleWords,claim}`, `wave`. Phones send `claim{tokenIds[],verb}` on lock-in; nothing streams during the wave, so real-time sync is easy — a 45s countdown and a set of sealed submissions.

The genuinely hard part is **stable token identity across waves**. CUT shortens the document, so wave-2 claims must reference tokens by immutable `id`, not index, and scars must travel with their tokens through deletions and reversals. Resolution is index-range intersection over the *current* token order, then a rebuild that preserves ids. Get this wrong and the scars drift onto the wrong words, which is instantly visible on the TV and destroys trust in the game.

Second hard part is content: paragraphs must have unevenly juicy words (a few obviously load-bearing ones) so collisions are tempting rather than random, and the three verbs must compose into something still readable.

## v1 scope
- 3 players, one hardcoded paragraph, two waves, then reveal
- 3 verbs, claims capped at 4 words
- Objectives from a hardcoded list of 6; scored by show of hands, not code
- No lobby polish, no round two, no persistence

## Out of scope
Custom paragraph submission, freeform text entry, more verbs, automated objective scoring, multiple paragraphs, undo.

## Risks & unknowns
Collisions may be too rare with 3 players on 30 words — may need a shorter paragraph or wider claims. Talking may solve it too cleanly; the private double-words are the intended defense against clean negotiation, but if they're too weak the game is just polite. Phone drag-select on word chips must be forgiving or the input itself becomes the challenge.

## Done means
Three phones claim spans blind; two deliberately overlapping claims are both rejected, the shared words appear as █ on the TV and grey out on every phone, the non-overlapping third claim applies, and wave 2 accepts claims on the post-CUT paragraph with scars still on the correct words.
