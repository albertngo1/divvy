## Overview

A 3-player silent convergence game for a living room with a TV and phones. The host screen asks a question everyone knows the answer to. Nobody is allowed to give it. Instead each phone privately offers a different menu of *wrong* answers, and the room wins only when all three players lock the identical lie. Being right is worthless; being wrong **together** is the whole game.

## Problem

Trivia rewards the one person who knows. Convergence games usually hand everyone the same options, which collapses into "pick the most obvious thing" in one move. The itch: a matching game where knowledge is actively a trap, and where you cannot just read the room off a shared screen — you have to model what's on someone else's screen.

## How it works

Host TV (public, all round): the question — *"Who invented the telephone?"* — plus attempt counter, a DISTINCT ANSWERS number (3, 2, or 1), and a per-seat STUCK/MOVED dot showing only whether each player repeated their previous pick, never what it was.

Each phone (private): the same question and a menu of **five wrong answers**. The true answer never appears. The three menus are generated so exactly one decoy is on all three, and every other decoy is on at most one other phone. Menu order is shuffled per phone.

Everyone locks simultaneously. Then two things happen. Publicly, DISTINCT ANSWERS updates. Privately, your phone alone tells you: *"2 of 2 others had this option on their menu"* — 0, 1, or 2. That number is the whole engine. A player reading 2 knows they are standing on the shared decoy and should freeze (their dot goes STUCK, the public signal to come to them). Players reading 0 know their pick isn't even printed on the frozen player's phone and must hunt elsewhere on their own menu. No talking, ever.

Room wins when all three lock the same wrong answer within 4 attempts. Reveal: TV shows the true answer, the agreed lie, and all three menus side by side.

## Technical approach

PartyKit Durable Object per room; host tab and phone PWAs over WebSocket. State: `{question, decoyPool, sharedDecoy, menus: {playerId: string[5]}, attempt, locks: {playerId: choice}, history}`. Menus are dealt server-side and never broadcast — a phone receives only its own array, so the fun survives a peeked screen. Locks are buffered and only resolved when all three arrive, so no one sees a partial state.

The hard part is not sync (three clicks per 30s) but *authoring*: the decoy pool must be plausible enough that no single option is a runaway Schelling point, or attempt 1 solves it by luck. v1 hand-authors one question with 11 decoys and randomizes which is shared.

## v1 scope

- Exactly 3 players, one question, one round, max 4 attempts.
- One hand-authored decoy pool; shared decoy picked at random per game.
- Host screen: question, distinct-count, three STUCK/MOVED dots, attempt counter.
- Phone: five buttons, lock, private availability number.
- Win/lose screen with all menus revealed.

## Out of scope

Scoring, multiple rounds, 4+ players, question packs, reconnect recovery, sound, animation.

## Risks & unknowns

The private 0/1/2 signal may be *too* strong — one player freezes and the others still cannot guess which of five lies they hold. Mitigation lever: menu size. Conversely, a famous decoy (Edison) may dominate and trivialize round 1.

## Done means

Three phones join a room, each shows a distinct 5-lie menu with exactly one common element, simultaneous locks resolve, the host shows the distinct-count and stuck dots without leaking answers, and a game reaching three identical locks fires the reveal screen.
