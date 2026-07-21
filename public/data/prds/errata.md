## Overview
Errata is a 3–4 player cooperative defusal panic in the Keep Talking / Devils & the Details lineage, for a couch full of people who like shouting instructions under a timer. The twist: there is no single manual-reader sitting on the sidelines. Everyone is simultaneously a defuser AND a reader, wired in a circle.

## Problem
Keep Talking and Nobody Explodes splits the room into an active defuser and passive manual-readers who just… read. Half the table is idle. Errata dissolves that split: every player is heads-down on their own module while *also* being the only person who can read someone else's instructions. No one is a spectator.

## How it works
Each phone shows two things, privately:
1. **YOUR module** — a small interactive puzzle (v1: a 4-button keypad) with live state you can manipulate but with **no instructions**.
2. **The instruction page for the player to your LEFT** — a spoken rule table you can read but cannot touch.

So to solve your keypad you must get your rules voiced *to* you by the player on your right, while you're busy voicing the left player's page *to them*. It's a circular dependency: defusing requires continuous, overlapping cross-talk. There's no "your turn" prompt — you recognize what your neighbor needs from what they shout.

The host TV shows only the shared 90s countdown, one status light per module, and a strike counter (3 wrong entries = BOOM). The private asymmetry — touch-mine / read-theirs — is entirely load-bearing; a single passed phone collapses the whole loop.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve or PartyKit). Data model: `modules[{ownerId, type, state, solution, instructionsForOwner}]`; each phone receives its own module `state` plus the `instructionsForOwner` text keyed to its left neighbor. Server validates each submit, increments strikes, flips status lights, and runs the shared timer as source of truth. Real-time sync is easy here — submits are discrete and turn-free. The genuinely hard part is *authoring*: instructions that are unambiguous when READ ALOUD with zero diagrams ("if the third button lit red, press positions 2 then 4"), and tuning difficulty so that *verbal transfer* is the bottleneck, not puzzle logic. Also: graceful mid-round reconnect without leaking or resetting module state.

## v1 scope
- 3 players, 3 modules of ONE type (4-button keypad + spoken rule table)
- Fixed circular assignment (each reads left, solves own)
- 90s timer, 3 strikes, single round
- Win = all three lights green before time/strikes

## Out of scope
- Multiple module types, escalating rounds, difficulty scaling
- Audio SFX, 5+ players (breaks the clean circle)
- Persistent scoring / progression

## Risks & unknowns
Circular dependency risks a cold-start deadlock (everyone waiting) — mitigate by making any module solvable from the start, so players can dive in anywhere. Read-aloud instructions that are too long kill pace. Boom-on-3-strikes may end the round too abruptly to feel fair.

## Done means
Three phones, each showing a live keypad plus the neighbor's rule page; players talk over each other, each enters its correct code, all three lights turn green before the timer → WIN. A wrong entry visibly adds a strike on the TV, and a third strike triggers BOOM.
