## Overview

**Too Many Cooks** is a silent cooperative reduction game for exactly 4 players, one TV, four phones. A board of twelve tiles must be whittled to exactly one — the tile the whole room secretly agrees on. The catch: cuts must be *distinct*. Two cooks reaching for the same tile spoil each other, and the tile survives, scarred.

It is a double bind: **anti-coordinate the cuts, converge on the keep**, with no talking.

## Problem

Elimination games are usually pure subtraction — remove what you dislike until something remains, and agreement is an accident of arithmetic. Here removal is a contested action. You cannot simply cut what you hate, because everyone else hates it too and the cut will collide. You have to model what the other three are cutting *right now*, and spend your action on something nobody else will touch — which means the board narrows only when four people are silently reading each other correctly.

## How it works

**PUBLIC (host TV).** Twelve tiles (evocative nouns or icons: *hot sauce, a fire drill, your ex's dog…*), always visible to all. Scars accumulate here. A turn clock.

**PRIVATE (phone).** Each phone shows the same twelve tiles, but **three of them are blacked out on your phone only** — your personal mask. You may never cut a masked tile, you are never told anyone else's mask, and the masks are dealt so every tile is cuttable by at least two players and no tile is cuttable by all four. Your mask means you experience a different board than the person beside you.

**Each turn (12 s).** Every phone secretly taps one cuttable tile. Locks are simultaneous; the server holds all four until the deadline.

**Resolve.** A tile cut by *exactly one* player is removed. A tile cut by two or more **survives** and gains a permanent visible **scar** on the TV. The room learns *how many* scars a tile has — never who cut it, never who collided with whom.

Scars are the vocabulary. A scar says "at least two of us wanted this gone," which is also loud evidence that it is not our answer. A tile that has never once been touched across five turns is either everyone's darling or everyone's blind spot.

**Five turns.** **Win:** exactly one tile remains. **Lose:** the board hits zero, or time expires with two or more.

The endgame is the whole game: from four tiles, four cooks must cut three *distinct* tiles and leave the *same* one standing — four minds landing on one tile at the same instant, having never said a word.

## Technical approach

PartyKit / Durable Object room; host tab + phone PWAs over WebSocket. State: `{tiles: [{id, alive, scars}], masks: {playerId: [tileId]}, turn, submissions}`.

Submissions are write-only until the server-clock deadline — critically, another player's pick must never appear in *any* phone's socket traffic, even hidden client-side, or the game is trivially cheatable with devtools. The server resolves atomically at deadline: group picks by tile, remove singletons, scar the rest, broadcast a single diff.

**The genuinely hard part:** deadline fairness. A pick arriving 200 ms after the clock hits zero on a laggy phone still needs to count if it was *sent* before — so submissions carry a client timestamp validated against a per-connection RTT estimate, with a fixed 400 ms grace window. Secondary: mask generation must satisfy the coverage constraints above (rejection-sample the deal), and a dropped phone must auto-pass rather than stall the turn — a pass is publicly visible as a missing cut, which is itself information the room will read.

## v1 scope

- Exactly 4 players, one hand-authored 12-tile board, one game
- 5 turns, 12 s each, one tap per turn
- TV: tiles, scar counts, turn counter, win/lose
- Reveal screen: every mask and every cut, turn by turn

## Out of scope

- Multiple boards or categories, player counts other than 4
- Any scoring beyond win/lose, rematch flow, persistence
- Custom tile decks

## Risks & unknowns

- Collision rate may be so high the board never narrows; may need 6 turns or a "scarred tiles cost double to cut" release valve.
- The private mask may feel arbitrary rather than characterful — needs playtest to see if it produces "why did nobody kill that?" moments or just confusion.
- Twelve tiles may be too many to hold silently; 9 might be the real number.

## Done means

Four phones and a TV, no talking: the room lands on exactly one surviving tile in at least one of four attempts, and in the post-game reveal no player can correctly name who made more than half the cuts.
