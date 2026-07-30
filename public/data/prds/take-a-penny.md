## Overview

A silent, three-player cooperative swap game for a living room with a TV and phones. Each player privately holds a small hand of icon tokens. The room wins when all three hands are **identical as multisets** — same four tokens, in any order. Nobody may speak, and nobody ever sees another hand. The only shared object is a public six-slot "penny tray," and the only legal move is trading one of your tokens for one of the tray's. What you dump into the tray, and what you conspicuously leave behind, is the entire language.

## Problem

Convergence games usually reduce to a private dial plus a public warmth meter: you wiggle, the bar moves, you binary-search. That's a solo optimization problem wearing a party hat. The itch here is a convergence channel that is **stigmergic and deniable** — you communicate by rearranging a shared environment, and every message is ambiguous. Dropping a moon in the tray could mean "I hate moons" or "here, you need a moon." Reading that ambiguity, silently, is the game.

## How it works

Six token types (acorn, key, bell, dice, moon, spoon). Eighteen physical token instances are in play: three private hands of four, and six face-up tray slots.

**Each phone privately shows:** your four tokens, and nothing about anyone else's. **The host TV publicly shows:** the six tray slots live, a shared 90-second clock, and a single **match meter** — the size of the three-way multiset intersection, 0 to 4. It never shows who is holding what, who just swapped, or which token type is close.

The only action: tap one of your tokens, then tap a tray slot. That's an atomic swap — your token lands in the slot, the slot's token lands in your hand. 1.5s per-player cooldown, otherwise fully simultaneous. Win when the meter hits 4.

The deal is generated backwards from a hidden target multiset T of four tokens: place three copies of each element of T (12 instances) plus 6 decoys, shuffle all 18, deal 4/4/4 and 6 to the tray. A solution therefore always exists, and 1-in-1-out swaps conserve every count, so the room can never destroy it.

## Technical approach

Authoritative WebSocket server (PartyKit / one Durable Object per room, or Socket.IO behind Tailscale Serve). Data model: `Room { code, phase, deadline, tray: [TokenInstance|null; 6], hands: {playerId: TokenInstance[4]}, matchMeter }` where `TokenInstance = {id, type}`. Clients hold no authority; a phone sends `{swap: {handTokenId, traySlotIndex, expectedTrayTokenId}}`.

The genuinely hard part is contention, not latency. Two players will grab the same visible token in the same 200ms. The server treats each swap as a **compare-and-swap**: if `tray[slot].id !== expectedTrayTokenId`, reject with `STALE` and roll nothing back — the loser's phone buzzes and re-renders, hand untouched. This must be transactional and single-threaded per room (Durable Objects give this free). Broadcast tray deltas to all clients; broadcast hands only to their owner; recompute the meter server-side after every accepted swap. Optimistic UI on the phone with a 250ms ghost state, reconciled from server truth.

## v1 scope

- Exactly 3 players, one round, 90s.
- Six token types, hands of four, six tray slots.
- One action verb (swap), one cooldown, one meter.
- Win screen: reveal all three hands side by side and the tray's leftovers.
- No accounts, no lobby beyond a 4-letter room code.

## Out of scope

More players, multi-round scoring, a traitor role, timed tray refresh, animations beyond a slide, spectator view, reconnect-mid-round recovery.

## Risks & unknowns

The strategy may be too easy: if the meter climbs monotonically, greedy swapping might solve it without any reading of intent. Mitigation levers are hand size and decoy count, tuned by playtest. Opposite risk: total gridlock where three players cycle the same token forever — the shared clock plus visible meter stagnation is the only nudge. Also unknown whether players can tolerate not knowing *which* token the meter credits.

## Done means

Three phones join a code, each sees a distinct private hand, all three can swap concurrently without the tray ever showing a duplicated or vanished token id under a scripted 10-collision burst, the meter reflects true intersection size within 100ms of each accepted swap, and a real room of three strangers reaches a 4/4 match at least once in five attempts with zero words spoken.
