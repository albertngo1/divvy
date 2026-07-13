## Overview
Watermark is an anonymity party game for 4–6 players: a shared host screen shows the lineup of answers, each phone is a private writing desk. There is no points tally and no winner-per-game — each round, you individually either "stayed anonymous" or "got watermarked." The goal is to disappear into the crowd while carrying a handicap that betrays you.

## Problem
"Guess who wrote it" games (blanking, quiplash-style attribution) are fun but toothless — with a good poker face anyone blends in, so the deduction is soft. The itch: make anonymity *hard-won*. Give every writer a forced tell they must hide in plain sight, so staying unidentified is a real skill, not luck.

## How it works
The **host screen** shows one shared prompt ("the worst possible superpower"). Each **phone privately** shows the same prompt PLUS a secret **watermark**: a mandatory ordinary word you must use naturally in your answer ("linoleum", "clockwise", "regardless"). Different word per player; you never learn anyone else's. You write 1–2 sentences and submit. The host then displays all answers shuffled and anonymized, numbered. Now each phone privately does two things: (1) for each answer, secretly guess *who wrote it*, and (2) you're privately told ONE other player's watermark and may optionally "call" which answer it's hiding in — a correct call publicly exposes that writer. After everyone locks in, the host reveals: each answer lights up with its author and its watermark. You **win the round** (a quiet "you stayed anonymous" badge, no number) if a majority failed to attribute your answer AND nobody correctly called your watermark. The optional keepsake: the anonymized answer set printed as a little "redacted anthology."

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `player {id, watermark, targetPlayerId}`; `answer {playerId, text}`; `guesses {voterId → {answerId → guessedPlayerId}}`; `calls {callerId → answerId}`. Phases (write → attribute → reveal) are server-driven state machine; server holds all secret watermarks and never sends a player their own-visible-only data to others. The genuinely hard part isn't sync (turn-based, low-rate) but **watermark selection**: words must be common enough to hide yet distinctive enough that a sharp reader can spot them — a tuned wordlist plus per-round de-dup so no two players get words that rhyme or collide.

## v1 scope
- One room, one prompt, one round, 4 fixed players.
- Hand-curated list of ~20 watermark words.
- Attribution guesses + the single optional watermark "call."
- Reveal screen showing author + watermark per answer.

## Out of scope
- Multiple rounds, scoring across rounds, prompt packs.
- The printed "redacted anthology" keepsake export.
- Difficulty tiers, custom prompts, spectators.

## Risks & unknowns
- Balance: watermarks too easy = everyone gets caught; too hard = the handicap is meaningless.
- Short answers may not give enough surface to hide a word.
- With 4 players the attribution pool is small — may need 5–6 to feel anonymous.

## Done means
Four phones join, each writes an answer embedding its private secret word, the host shows the anonymized lineup, players attribute + optionally call, and the reveal correctly shows for each player whether they stayed anonymous — with at least one playtester surprised they got watermarked.
