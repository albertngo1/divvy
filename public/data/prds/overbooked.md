## Overview
Overbooked is a 3-5 player concurrent-room game for the awkward pre-dinner crowd. The host TV shows a small airplane seat map; every player holds a phone that is secretly their own boarding pass with a private seating rule. The room wins only if the whole plane fills with a valid, collision-free assignment — and it has to happen without a word.

## Problem
Most 'everyone win together' party games are pure comms — you just talk it out. The itch here is the opposite: talking is banned, and the natural instinct to converge on the 'obvious good seat' is exactly what kills you. Coordination is the failure mode; two brains reaching for the same slot get punished.

## How it works
The plane has N seats (6 for 4 players) laid out on the host TV as a grid of dots. Each phone PRIVATELY holds one boarding constraint — 'window only', 'aisle only', 'front half', 'must not sit adjacent to an occupied seat', 'even row'. Your phone renders the same seat map but greys out every seat your constraint forbids, so each player literally sees a different set of legal seats.

Play runs in synchronized ticks. Each tick, everyone taps one tentative seat on their phone (only their legal ones are tappable) and commits. The server resolves simultaneously:
- Two or more players committed the same seat → COLLISION. Both dots flash red on the host TV, both players are ejected back to un-seated, and a strike is logged.
- Otherwise your seat locks and shows as your color on the host TV.

The host TV shows only committed, colored seats — never anyone's constraint, never anyone's tentative pick. So you learn where people have LANDED but never where they're about to reach. The room must feel out a full unique assignment satisfying everyone's hidden rules within 5 ticks and 2 total strikes.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit Durable Object). Data model: `seats: {id -> playerId|null}`, `players: {id, color, constraint, tentativePick, seated}`, `tick`, `strikes`. Sync: fixed ~4s tick; phones send `commit(seatId)`; at tick close the DO resolves all commits, detects duplicate seatIds, applies ejections, broadcasts the new committed map. Constraint legality is validated server-side against current board state (adjacency rules depend on live occupancy). Hard part: adjacency constraints make legal-seat sets shift every tick, so phones must re-derive their greyed map from each broadcast without leaking it to the host.

## v1 scope
- 4 players, 6 seats, one plane, one round
- 4 fixed constraint types, dealt one per player
- 5 ticks, lose on 3rd collision, win on full valid board
- Host: seat grid + collision flash; phone: greyed map + tap-to-commit

## Out of scope
- Multiple flights / rounds, scoring beyond win-lose
- Constraint variety packs, difficulty scaling, spectators
- Any chat or emoji comms channel

## Risks & unknowns
May solve too fast or deadlock into unsatisfiable constraint sets — needs a solvability check when dealing. Tick pacing vs. impatience is untested.

## Done means
4 phones join, each gets a distinct hidden constraint, simultaneous commits resolve with duplicate-seat ejections visible on the host, and a legal full assignment triggers a win screen — all with zero talking required by the rules.
