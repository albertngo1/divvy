## Overview
Nerve is a cooperative, silent, real-time party game — a phones-plus-TV riff on the tabletop hit *The Mind*. Each player privately holds hidden number(s); the room must play them in one global ascending sequence onto a shared pile, with zero communication. For groups who love tense, telepathic co-op rather than trash-talk.

## Problem
*The Mind* is magical but needs a physical deck, careful dealing, and everyone squinting across the table. Its whole thrill is the *wait* — sensing when it's your turn to commit. Phones can capture that commit moment precisely, deal instantly, and enforce hidden hands perfectly, while a shared host screen supplies a communal heartbeat everyone stares at together.

## How it works
The server deals each player a private hand from 1–100. Each PHONE shows ONLY that player's own number and one glowing PLAY button — nothing about anyone else. The HOST TV shows the shared pile's top number, a row of hearts (lives), and a slowly rising tension meter. No talking, no signaling. You simply wait, feeling out whether your number is next-lowest in the whole room, then tap PLAY. Your card flips onto the host pile. If any unplayed card anywhere was lower than what you just played, the room loses a life and the TV reveals the miss. Private phones are load-bearing: the entire game is numbers you must never reveal — pass one phone around and everyone sees every hand, and there is no game at all.

## Technical approach
Authoritative WebSocket room (PartyKit / Durable Object). Data model: `room {code, level, lives, pileTop, players[]}`, `player {id, hand[], connected}`. The server holds all hands; each phone is sent ONLY its own `hand` — other hands are never broadcast. On PLAY the phone sends `{playCard}`; the server validates ascending order and broadcasts pile + mistake events to everyone. The genuinely hard part is fairness under near-simultaneous taps: two phones commit within 50ms. The server total-orders by receipt timestamp and rules a play a mistake if, at processing time, any unplayed card anywhere is lower. Round-trip must feel instant (<150ms) or the "did I just blow it?" tension collapses.

## v1 scope
- 3 players, one round
- Each holds exactly ONE hidden card (1–100)
- 2 shared lives
- Silent play only; tap PLAY to commit
- Win when all 3 cards land ascending; lose on second mistake
- One WIN / LOSE screen

## Out of scope
- Multi-card levels and level progression
- Thrown-star / collective-lowest-reveal mechanic
- Difficulty scaling, sound design, reconnection mid-level

## Risks & unknowns
- Without face-reading, phone-mediated tension may be flatter — likely needs a shared audio/breathing pulse on the TV to recreate the wait.
- Talking/cheating is honor-based.
- Simultaneous-play resolution edge cases must feel fair, not arbitrary.

## Done means
Three phones each show one hidden number; players silently tap them onto the pile; a full ascending sequence shows WIN, an out-of-order play names the exact miss and shows LOSE, and no phone ever displays another player's number.
