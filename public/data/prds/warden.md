## Overview
A one-vs-many hidden-movement game for 4 players (v1): one **Warden** whose phone is the full prison map, and three **Inmates** whose phones show only the fog around their own token. Inmates race to the fence; the warden predicts where the blind bodies will step and sweeps them.

## Problem
Asymmetric 'hidden map' games (Scotland Yard, dungeon crawls) need a board everyone shares or a referee reading aloud — awkward, and a passed phone leaks everyone's position. The itch: give each blind piece its *own* private, divergent fog-of-war and let one player hold the omniscient board, so the information asymmetry is the mechanic, not an honor system.

## How it works
The **Warden's phone (PRIVATE)** shows the entire grid: walls, the fence exit, and all three inmate tokens updating live. Each tick the warden taps ONE cell to searchlight; anyone standing in or moving through it is caught (out).

Each **Inmate's phone (PRIVATE)** shows a fogged grid: only cells they've already entered are lit, their token, and the four adjacent cells shown as 'open' or 'wall' from their last probe. They tap an adjacent cell to queue a move. Inmates talk out loud to pool what they've each privately seen — but only they know their own exact position and remaining route.

The **host TV (SHARED)** shows a tense prison-yard scene, a tick countdown, and a caught/escaped tally — never the live map. Every 4 seconds all inmates move simultaneously; the server resolves the warden's searchlight against everyone's path. First inmate to the fence wins for the inmates; warden wins by catching two of three.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `{ grid:[[cell]], exit, inmates:{id:{x,y,revealed:Set,alive}}, warden:{sweepCell} }`. Sync strategy: server holds ground truth; it pushes each inmate ONLY their own token + freshly revealed adjacency, and pushes the warden the full token set. Turn loop: collect queued moves + warden sweep, resolve on a fixed tick, emit private deltas. The genuinely hard part is fog correctness under simultaneity — a move and a sweep landing on the same cell in the same tick must resolve deterministically and identically for warden and victim, so resolution is fully server-side and clients render only confirmed deltas.

## v1 scope
- 1 warden, 3 inmates, one round
- Fixed 5x5 grid, one fence exit, ~6 ticks
- Tap-to-queue moves; one searchlight per tick
- Caught/escaped tally on TV

## Out of scope
- Multiple sweeps, walls the warden can move, power-ups
- Reconnect, variable grid sizes, >3 inmates

## Risks & unknowns
- Do inmates feel too blind early on? May need a free first-probe.
- Warden may be strictly favored on a 5x5 — tune sweep count/grid size.
- Voice pooling could trivialize the map; test whether private fog stays meaningful.

## Done means
Four phones join via QR; each inmate sees only their own fog and queues moves; the warden sees all tokens and sweeps one cell per tick; a simultaneous move+sweep resolves identically on both sides; TV shows a fog-free tally ending the round.
