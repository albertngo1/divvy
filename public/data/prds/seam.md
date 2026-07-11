## Overview
Seam is a cooperative, per-phone match-3 for 3-4 players sharing a TV. It steals the falling-gem match-3 genre (Bejeweled / Puzzle Fighter) and shatters its solitaire core across phones, so the highest-value moves physically cannot be made by one person.

## Problem
Match-3 is the purest solo game there is; even couch versions (Puzzle Fighter) are just two people playing separate boards next to each other. Nobody has built a match-3 where clearing gems *requires* another human to move at the same instant. The itch: make a genre famous for hypnotic isolation into something you can only beat by talking.

## How it works
The TV shows one wide grid divided into color-tinted vertical strips, one per player. Each phone (PRIVATE) shows that player's strip zoomed up with touch-swap controls, plus an **incoming queue**: the next three gem columns that will drop into *their* strip, visible to no one else. Players swap adjacent gems to make 3+ matches; ordinary matches score small.

A **seam match** — a same-color line spanning the boundary between two neighboring strips — pays a large multiplier, but the completing swap touches both strips, so BOTH neighbors must hit "commit" within a 1.5s server-validated window. Because only you can see your own incoming queue, you have to narrate it ("three reds landing in my column 4 — line up your edge!"). One round is 90 seconds to hit a shared target score.

PRIVATE per phone: own strip zoom, swap controls, hidden incoming queue. SHARED TV: full current board, combined score, timer, and a big seam-flash animation when a cross-strip clear fires.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `board` = columns, each tagged to a player; server owns the gem grid. Every client renders the full board, but each client's incoming queue is generated from a per-player RNG seed held only by server+that client, so future gems never hit others' wires. Swaps are optimistic then server-confirmed. Seam commits: server buffers the first commit and waits up to 1.5s for the partner before resolving or rejecting. Hard part: keeping gravity/cascade resolution byte-identical across TV and every phone in real time — solved with a 20Hz authoritative server tick that clients interpolate against, never simulating cascades locally.

## v1 scope
- 3 players, 9-column board (3 columns each)
- 4 gem colors only, one seam type
- 90-second timer, single target score
- Verbal coordination, no in-game chat

## Out of scope
- Versus/garbage-sending, power gems, 4th player, spectator mode, reconnect.

## Risks & unknowns
- Cascade desync between TV and phones under latency.
- Is queue-narration fun or just noisy chaos?
- Touch-swap responsiveness on cheap phones; whether the 1.5s commit window feels tight or forgiving.

## Done means
On 3 phones + a TV, the party clears normal matches, at least one seam clear fires from two simultaneous commits with the TV showing the multiplier flash, and the group reaches the target score inside 90 seconds in a real playtest — with no phone ever receiving another player's incoming queue.
