## Overview

A 4-player, 90-second cooperative panic game. One player (the **Cartographer**) holds the only view of a small maze and one token. The other three are **Pieces**, and each Piece's phone shows nothing but two large unlabeled pads. Nobody — not even the Piece pressing — knows what those pads do. The Cartographer sees what moved. The room has to talk its way from "the token went north" back to "that was Priya's left pad."

For people who like Spaceteam's yelling but are tired of games where the yelling is just reading words aloud.

## Problem

Map-holder games usually reduce to one person narrating a screen while everyone else obeys. The Cartographer becomes a tour guide and the Pieces become a keyboard. The itch: make the *control scheme itself* the hidden information, so the blind players have something to contribute besides limbs, and the sighted player can't just dictate.

## How it works

The server secretly binds each Piece's two pads to two of the six moves (N/S/E/W, and two no-ops that just cost a tick). Bindings are random, overlapping, and never shown to anyone.

- **Cartographer's phone (private):** the 6×6 maze, walls, the token, the exit. Nothing about who controls what.
- **Each Piece's phone (private):** two blank pads and a tiny "swallowed" indicator. No maze, no compass, no labels.
- **Host TV (shared):** a fog-of-war trail of visited tiles with no walls drawn, the wall-bump count, and the clock. Enough to feel progress, not enough to navigate.

The server accepts exactly one press per 400 ms tick — first arrival wins, the rest get a private buzz meaning "you were swallowed, try again." So when the Cartographer shouts "something went east!", three people simultaneously claim it. **Every wall bump re-permutes all bindings.** All hard-won knowledge evaporates on the exact move that hurt you, which is the joke and the pressure.

Win: token reaches the exit before 90 s. Bumps aren't fatal, they're amnesia.

## Technical approach

PartyKit / Cloudflare Durable Object room, authoritative server, host tab + phone PWAs over WebSocket.

State: `{ mazeId, token{x,y}, bindings: Map<playerId,[Move,Move]>, bumps, tick, deadline }`. Bindings live only on the server; a phone's payload is literally `{padsEnabled: true}`.

Sync: fixed 400 ms server tick. Presses carry a client timestamp corrected by an NTP-style offset measured during lobby; the server orders arrivals within the tick window by corrected timestamp, applies the winner, and fans out (a) full token state to the Cartographer socket only, (b) an anonymized `moved`/`bumped` event to the TV, (c) `accepted` or `swallowed` to the pressing phones.

The genuinely hard part is **attribution fairness under jitter**: on wifi, a 200 ms disadvantage makes one player feel permanently swallowed. Mitigation: clock offset per client, a 120 ms grace so near-ties resolve by corrected time rather than arrival, and a rotating tie-break that favors whoever lost the last contest.

## v1 scope

- Exactly 4 players, 1 maze, 1 round, 90 s.
- Hardcoded 6×6 maze, fixed exit.
- Two pads per Piece, six-move binding pool, reshuffle on bump.
- TV shows: visited-tile fog, bump count, clock.
- No accounts, no scoring beyond win/lose, room code join.

## Out of scope

Multiple rounds, maze generation, traps/keys, spectators, reconnect-mid-round, mobile haptics beyond one buzz, any leaderboard.

## Risks & unknowns

- Reshuffle-on-bump may be too punishing; may need "reshuffle only one player's binding."
- Six moves across three players may be too big a search space for 90 s — tune to four moves.
- If the Cartographer just brute-forces by calling "everyone press pad A," the deduction dies; the 400 ms single-press tick is the intended defense and needs playtesting.

## Done means

Four phones join by room code; the Cartographer sees a maze nobody else can; pressing a pad moves the token within 500 ms; a wall bump visibly changes what pads do (verifiable in a server log diff); and a real group of four, given no rules beyond "get out," reaches the exit at least once in three tries while audibly arguing about who moved.
