## Overview
A deduction game for 4 players where the group shares one oracle and one board, but thinking alike is the only way to lose. Host TV shows 12 candidate cards and a growing public transcript of answered questions; each phone is a private notebook and question terminal.

## Problem
Group deduction games collapse into one loud person asking the obvious question while everyone nods. And "great minds think alike" is always framed as a compliment — no game has ever charged you for it.

## How it works
The TV shows 12 cards (objects, animals, famous things). The server picks one secret answer. Each phone privately shows the same 12 cards with **two different cards crossed out** — private eliminations, never the answer, different per player. So everyone's "obvious next question" is subtly different, but not different enough.

Three rounds. Each round, all four players have 40s to privately type one yes/no question. On lock, the server embeds all four questions and computes pairwise cosine similarity. Any pair above threshold **collides**: both are voided, both askers take a −1 strike, and the TV displays the two questions side by side under GREAT MINDS. Surviving questions are answered YES/NO publicly and pinned to the transcript forever — answers are a commons everyone benefits from, so burning your turn on a collision funds your rivals.

After round 3, each phone privately locks a guess. Correct = 3 points, minus strikes.

Private on phone: your two eliminations, your draft question as you type, and an **obviousness meter** scored against ~30 precomputed generic questions for this board. It tells you your question is basic. It never tells you it collides — that would defuse the whole thing.

Public on TV: the board, the answered transcript, collision shaming, the clock.

## Technical approach
Host tab + phone PWAs + a PartyKit Durable Object. Model: `Room{answerId, board[12], players[{id, eliminated[2], strikes, guess}], rounds[{questions[{playerId, text, embedding, voidedBy}], answers[]}]}`.

Submission is a hard barrier: everyone locks, then one adjudication pass. Embeddings via Workers AI `bge-base-en-v1.5`; cosine matrix over ≤4 vectors is trivial. Surviving questions go to a **single batched LLM call** that answers all of them against the secret answer in one structured JSON response — batching matters, because separate calls produce mutually contradictory answers and the room stops trusting the oracle. A `unclear` verdict voids the question with no strike.

The hard part is not sync — it's threshold calibration and the ~4s adjudication stall. 0.86 cosine flags "is it alive?" vs "is it a living thing?" but must not flag "is it red?" vs "is it round?". Needs tuning against real logged questions, with an LLM tiebreaker only on borderline pairs.

## v1 scope
- 4 players, one hardcoded 12-card board
- 3 rounds, 40s each, 2 private eliminations per player
- Fixed cosine threshold, no per-room tuning
- Text only, no images, no rejoin, no persistence

## Out of scope
- Multiple boards, image cards, audience play, lying elimination cards, streaks, more than 3 rounds

## Risks & unknowns
- Threshold calibration is the entire game feel and is currently a guess
- A wrong oracle answer destroys trust instantly
- Phone typing is slow; 40s may be the wrong window
- Degenerate strategy: ask deliberately weird useless questions to dodge collisions. Partially self-punishing (nobody learns anything, nobody can guess), but unproven

## Done means
Four phones and a laptop play one full board: at least one real collision fires and both questions appear side by side on the TV, every adjudication pass completes under 6s, no two answers in the transcript contradict each other, and at least one player correctly identifies the answer using only the public transcript plus their private eliminations.
