## Overview

A 3-4 player cooperative guessing game for a living room. A real paragraph (a novel opening, a Wikipedia lede) is walked through one word at a time. The room must jointly guess each next word. The catch: every phone is fed a **different length of context window** — one player sees only the last two words, one sees the last six, one sees everything — and no player is ever told which one they are. The game is a playable scaling law: you discover, socially and painfully, that the person who sounds most certain is the one who can see the least.

## Problem

Every "guess the next word" game is a trivia contest that the best reader wins. And every LLM party game so far treats the model as a judge sitting outside the room. Here the *asymmetry inside the model* is the game: short-context prediction is confidently, fluently, locally-plausible wrong, and that is exactly what a bad teammate sounds like.

## How it works

**Host screen (TV)** never shows a single word of the passage. It shows the beat number (1-8), a bits-spent meter, the three anonymous candidate words during the argue phase, and — only at the very end — the true passage read out in full.

**Each phone privately shows** (a) its own window: the last W true words of the passage, W ∈ {2, 6, ∞}, dealt secretly at game start; (b) its own model's top-5 next-word predictions with probability bars, computed from *that truncated window only*; (c) a text box and a submit button.

Each beat: all three players privately submit one candidate word, simultaneously. The TV then reveals the three candidates unlabeled and opens a 25-second open-mic argue phase — this is the whole game, three people arguing from incompatible evidence. Then each phone privately votes for one candidate; plurality becomes the room's guess (ties → alphabetical). Cost for the beat = −log₂ P(guess | **full** context) under the host's full-context model, capped at 12 bits. The true word is never revealed mid-game — only the bits paid — so nobody can rebuild the passage from the TV. Room wins if total cost stays under 60 bits.

## Technical approach

Host browser tab runs `transformers.js` with distilgpt2 and owns all inference: per beat, three truncated forward passes (one per window size, for the private top-5s) plus one full-context pass to price the room's guess. A PartyKit / Durable Object room is authoritative for state.

Data model: `Room { passageTokens[], cursor, budgetBits, players[{id, windowSize, submission, vote}], beats[{candidates[], chosen, bits}] }`.

The genuinely hard part is **not** inference — it's that the naive "broadcast room state to all clients" pattern leaks the entire game in one message. The server must apply a per-socket projection: `viewFor(playerId)` slices `passageTokens[cursor-W .. cursor]` and attaches only that player's precomputed top-5. Every socket gets a structurally different payload, and any dev-tools peek at another payload ends the game. Second hard part: the four forward passes must finish inside the ~1.5s gap between submit-close and argue-open, so predictions are computed one beat *ahead* speculatively where possible.

## v1 scope

- Exactly 3 players, window sizes hardcoded {2, 6, ∞}, randomly dealt
- One passage, 8 beats, single round
- Submit → argue (25s) → vote → bits
- Cooperative score only; final full-passage reveal on TV

## Out of scope

- Wagering/betting chips, multiple rounds, per-player scoring
- Guessing your own window size for bonus points
- Passage packs, difficulty tuning, spectators

## Risks & unknowns

- distilgpt2 tokenization means "words" ≠ tokens; v1 restricts guesses to whitespace words and scores the first token, which will occasionally feel unfair
- The ∞-window player may simply dominate every argument, collapsing the fun; mitigate by choosing passages with strong local misdirection
- Eight beats may be too few for players to form trust models of each other

## Done means

Three phones join, each renders a visibly different window and top-5 list for the same beat, the TV displays zero passage words until the final reveal, the room completes 8 beats with a real bits total, and a player inspecting another phone's socket payload finds no passage text they weren't dealt.
