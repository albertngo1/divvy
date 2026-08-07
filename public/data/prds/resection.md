## Overview

A 4-player cooperative deduction game that inverts the usual blind-maze deal. The **Cartographer** holds the map on their phone and knows every tile's terrain — but has no idea where anybody is. The three **Walkers** know exactly what their own tile feels like and nothing else. Nobody can locate anybody without the other side.

For groups who want the maze game to be a puzzle rather than an obedience drill.

## Problem

Every blind-navigation party game gives the mapholder omniscience: map plus your position. That makes them a GPS and you a car. Strip the positions out and the mapholder becomes a detective running a particle filter out loud, while the Walkers become sensors with editorial control — and both jobs are actually fun.

## How it works

A 4×4 grid. Every tile carries some subset of three sensations: **draft**, **hum**, **damp**. Sensations repeat across the board on purpose — no tile is uniquely identified by any single one.

Each round:

1. Each **Walker's phone privately** shows only what their current tile has, e.g. `DRAFT · DAMP`, plus a private hunch pad. They pick **exactly one** sensation to report. They may also report `NOTHING` — a real move, since silence is itself evidence.
2. The **host TV** shows the three reports attributed by name: "Ana: HUM. Ben: NOTHING. Cy: DAMP." It never shows the map or anyone's position.
3. The **Cartographer's phone** shows the full terrain grid with a live candidate-set overlay: every tile still consistent with each Walker's report history, shaded per Walker. This is the only screen where the deduction is visible, and it fills up with mud fast.
4. The Cartographer issues one direction to each Walker via their private phone — no talking, taps only. Walkers must move.
5. A wall bounce is announced publicly ("Ben didn't move") — a free, brutal disambiguator the Cartographer can deliberately fish for.

Goal: get all three Walkers onto the single exit tile within 7 rounds. The Cartographer must decide when to stop localizing and start walking people, and Walkers must decide whether to report the sensation that helps *them* get pinned or the one that keeps their teammate's candidate set from exploding.

## Technical approach

Host tab plus phone PWAs against an authoritative WebSocket server — one PartyKit room / Durable Object per game, or Socket.IO over Tailscale Serve.

```
Grid  { tiles: [{ draft, hum, damp, wall: Dir[] }] × 16, exit: cell }
Walker { playerId, cell, report: 'DRAFT'|'HUM'|'DAMP'|'NOTHING'|null }
Candidates { [playerId]: Set<cell> }   // server-recomputed, Cartographer-only
PublicLog { round, reports[], bounces[] }
```

Candidate sets are recomputed server-side each round: intersect prior candidates propagated through the issued move with the tiles matching the new report (`NOTHING` filters to tiles lacking that Walker's whole reported set so far — the subtle case, and the one most likely to be wrong).

Sync: intents only. Three projections — Cartographer gets grid plus candidate overlay, each Walker gets own-tile sensations plus PublicLog, host gets PublicLog. Reports resolve at a barrier so nobody can react to a teammate's report before committing their own.

Genuinely hard part: the simultaneity barrier plus a correct candidate filter. Get the `NOTHING` semantics wrong and the Cartographer's overlay confidently eliminates the true tile, which is unrecoverable and looks like a game-design failure rather than a bug.

## v1 scope

- Exactly 4 players: 1 Cartographer, 3 Walkers.
- One hand-authored 4×4 grid with a verified-solvable sensation layout.
- 7 rounds, no lives, no hazards.
- End screen showing the true map with each Walker's actual path traced.

## Out of scope

Grid generation, difficulty tiers, lying Walkers, Cartographer text chat, scoring beyond win/lose, more than 4 players, reconnect.

## Risks & unknowns

The candidate overlay may make the Cartographer's job mechanical — if the puzzle solves itself on screen, the fun is gone and the overlay should be coarsened to counts rather than shading. Walkers may find one-report-per-round too thin to feel like play; a second report unlocked at round 4 is the obvious relief valve. 4×4 may be too small to ever be genuinely ambiguous.

## Done means

Four phones join by code; each Walker sees only their own tile's sensations; the Cartographer sees a live candidate overlay that provably narrows as reports land; reports are barrier-committed so no Walker can see another's before locking; a full 7-round game ends on a reveal screen with all three true paths drawn.
