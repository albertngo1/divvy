## Overview
A three-player, four-minute silent co-op puzzle for a living room with a TV and three phones. Everyone looks at the same grid of sixteen cards. Nobody sees the same grid. The room wins by all picking cards that agree — pairwise, on three different axes, none of which any single player can fully perceive.

## Problem
Most "secretly match each other" games hand everyone identical information and ask them to guess the group's focal point. That collapses instantly: the group picks the obvious one, feels clever, and the game is over. Nobody converged — everyone was just basic in parallel. The itch is a matching game where the players genuinely *cannot* see the same thing, so agreement has to be constructed instead of stumbled into.

## How it works
Sixteen cards in a 4x4 grid. Each card carries three attributes: SHAPE (4 values), COLOR (4 values), COUNT (1-4 pips).

Each player is dealt two channels, cyclically:
- Alice sees COLOR + SHAPE (pips hidden)
- Bob sees SHAPE + COUNT (everything rendered flat grey)
- Cara sees COUNT + COLOR (all shapes rendered as identical rounded blanks)

No player sees all three. Every *pair* shares exactly one channel.

**Private, on each phone:** that player's masked 4x4 grid — the missing attribute isn't dimmed, it's simply not there — plus a lock button.

**Public, on the TV:** the grid drawn as sixteen featureless numbered silhouettes (so it's useless for cheating), and a single number 0-3.

All three lock a card simultaneously. The server scores three links:
- Alice-Bob link satisfied if their two cards share SHAPE
- Bob-Cara if they share COUNT
- Cara-Alice if they share COLOR

The TV shows only the count of satisfied links — never which. Then it appends the attempt to a public history strip: three grid positions and a score. That strip is the entire language of the game. Talking is banned; the only way to say "I think it's the blue axis" is to spend an attempt saying it. Four attempts, 3/3 wins.

## Technical approach
Host browser tab plus phone PWAs against one PartyKit Durable Object per room (Cloudflare), room code in the URL.

State: `{ grid: Card[16] (server-only), assignment: playerId -> [chanA, chanB], currentPicks: Map, attempts: [{picks, score}] }`. Masking is authoritative and server-side: a phone's payload physically omits the attribute it can't see, so devtools reveal nothing. Sync is a lock-step barrier — server buffers picks, broadcasts only when all three have locked, then scores.

The genuinely hard part is grid generation, not sync. A random grid is usually degenerate: either dozens of winning triples (trivial) or zero (unwinnable), and often a score of 2 is reachable a hundred ways so the feedback carries no signal. Fix by rejection sampling — brute-force all C(16,3)=560 triples, keep only grids with 1-3 solutions and a well-spread score histogram. Cheap enough to run per room at join time.

## v1 scope
- Exactly 3 players, exactly 1 grid, exactly 4 attempts
- Fixed channel assignment (color+shape / shape+count / count+color)
- TV shows silhouettes, a 0-3 number, and the attempt history strip
- No accounts, no persistence, no timer, no rematch button (refresh the tab)

## Out of scope
- 4+ players (needs a general link-graph, not a triangle)
- Sound, animation polish, photographic cards instead of shapes
- Difficulty tiers, hint system, spectator view

## Risks & unknowns
- 0-3 may be too coarse; four attempts may feel like coin flips rather than deduction
- Players will simply talk — v1 has no enforcement beyond the rule text on the TV
- The masked render must feel like a different world, not a broken one; grey blanks may read as a loading bug

## Done means
Three phones join a room from a TV-displayed code, each receives a provably different masked grid, four simultaneous lock-and-reveal cycles run without desync, and in playtests with silent rooms the group wins roughly 30-50% of the time — with at least one observed instance of a player deliberately "wasting" an attempt to transmit an axis to the others.
