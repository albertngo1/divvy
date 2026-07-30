## Overview

A 20-minute party game for 3-4 players that steals save-scumming — not the roguelike's permadeath, but the shameful thing players actually do to it. The shared TV runs one seeded dungeon run; every phone holds exactly one secret SAVE and one LOAD. Pressing LOAD rewinds the entire room to a moment only you chose, restoring your purse while deleting everyone else's last few minutes. For groups who enjoy a table going quiet with suspicion.

## Problem

Rewinding is the most emotionally loaded verb in single-player games and it's completely absent from party games. Undo mechanics at a table are either public (so they're just a boring take-back) or unenforceable. The itch: make a rewind *secret in origin* and *public in consequence*, and let the group feel the exact dread of a friend who might be holding a better version of the past.

## How it works

The run is 8 rooms, revealed one at a time from a fixed seed. Each room shows a hazard and a loot value on the TV. All phones simultaneously choose GRAB or GUARD (8-second timer). GRAB adds the loot to your private purse and one token to the party's public wound count; GUARD adds nothing. If wounds exceed the room's printed threshold, the party wipes and all unbanked purses zero out.

**Private on your phone:** your purse, your GRAB/GUARD choice until lock, your SAVE button, your LOAD button — and, critically, *whether you have already saved*. Tapping SAVE emits no sound, no animation, nothing on the TV. **Public on the TV:** room number, hazard, loot, wound count, and only *banked* totals.

Tapping LOAD is the fireworks: the TV rewinds room-by-room to your snapshot, names you, and re-deals the identical seeded rooms. Your purse is restored to its saved value; so is everyone else's, which is the knife — you rewind to before your bad GRAB and also before their good ones. Then everyone replays rooms they've now seen, so foreknowledge is real, exactly as in the source material.

## Technical approach

One PartyKit Durable Object per room code. State is an append-only event log (`{seq, epoch, type, playerId, payload}`) plus a seeded PRNG cursor; room contents derive from `xorshift(seed, roomIndex)`, never from stored randomness. A save is `{playerId, seq, cursor}`. A LOAD truncates the log to `seq`, increments `epoch`, replays, and broadcasts.

The genuinely hard part is the rewind race. Inputs for room 6 are in flight when the log truncates to room 3; they must not land. Every broadcast carries `epoch`, every phone stamps its input with the last epoch it saw, and the DO drops mismatches with an explicit `stale` ack so the phone re-renders instead of showing a dead spinner. Simultaneous LOADs in the same tick resolve by DO arrival order; the second becomes stale and is refunded.

## v1 scope

- 3 players, one run, 8 rooms, one seed hardcoded
- GRAB/GUARD only; one save and one load per player
- TV: room card, wound count, banked totals, rewind animation
- Phone: purse, two buttons, choice toggle

## Out of scope

Multiple runs, meta-progression, relics, spectators, reconnect-mid-rewind, scoring beyond final purse.

## Risks & unknowns

A rewind may feel purely punitive rather than delicious — needs the TV to sell it theatrically. Replaying known rooms could bore; 8 rooms may be too many. Two loads in one game might collapse the run into stalemate.

## Done means

Three real phones complete a run in which one player saves at room 2, loads at room 6, the TV rewinds, the same rooms re-deal identically, in-flight room-6 inputs are rejected as stale, and final purses match a hand-computed ledger.
