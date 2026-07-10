## Overview
Safe Hands is a 3-4 player cooperative safe-cracking party game for a TV + phones. The host screen is the face of a bank vault with one big numbered dial per player; each phone is a single hand on a single wheel. The catch: the clue you privately hold is never about *your* wheel — it constrains someone else's — so the only path to the combination is talking.

## Problem
Most co-op puzzle games let one clever person solve everything silently. We want a puzzle that is structurally impossible to solve alone and forces continuous real-time cross-talk, in the Keep-Talking / Devils-in-the-Details lineage, without a bulky rulebook.

## How it works
There are N wheels (0-9), one per player, and a hidden target combination the game generated to satisfy a set of interlocking constraints. Each PHONE privately shows: (1) your own wheel — a big dial you spin with your thumb, showing only YOUR current value; (2) one-to-two private CLUES about *other* wheels, e.g. "Wheel 3 is even," "Wheel 1 is exactly 4 higher than Wheel 2," "Wheels 2 and 4 sum to 11." You cannot see any other wheel's value.

The HOST SCREEN shows all four dials spinning live (values visible to the room as a spectacle, but players are heads-down on their phones and mostly can't read it) plus a countdown and a row of four LOCK lights. Players read their clues aloud, negotiate — "mine has to be even and 4 above yours, so tell me what you land on" — and spin their own wheel to a value they believe satisfies everyone's stated constraints. When a player is confident, they hold a LOCK button. Only when all four hold LOCK within the same ~800ms window does the vault check: all constraints satisfied → open; else a buzzer, one light flashes the count of violated clues, wheels stay put, timer keeps running.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `room{ target[N], constraints[], wheels[N], locks[N]:timestamp }`; each `constraint` has `refWheels[]`, a predicate type, and an `ownerPlayer` (who sees it). Server owns wheel values — phones send `setWheel(value)` deltas; server broadcasts only your own wheel back to you plus aggregate lock state, never other wheels. Sync: 20Hz wheel state to host for the visual, but clients get privacy-filtered snapshots. Simultaneous-lock detection normalizes each lock timestamp against server-measured RTT per client (same trick as any collision game) so a laggy phone isn't unfairly early/late. Genuinely hard part: generating constraint sets that are (a) fully solvable, (b) have a UNIQUE solution, (c) are unsolvable if any single player's clue is withheld — i.e., every clue is load-bearing. A small constraint-solver at room-start validates this.

## v1 scope
- 3 players, 3 wheels, 0-9.
- 4-5 constraints, generator guarantees unique + everyone-needed.
- One vault, 120s timer, single win/lose.
- Text clues only; tap-hold lock.

## Out of scope
- 4th player, multi-vault campaigns, difficulty tiers.
- Speech recognition (voice is human-to-human, not parsed).
- Reconnect grace, spectators.

## Risks & unknowns
- Constraint generator producing genuinely all-load-bearing sets is the crux; may need hand-authored templates for v1.
- Simultaneous-lock window feels arbitrary — may relax to "all locked, no timing" if it frustrates.

## Done means
Three phones join, each sees only its own wheel + private clues, and a room that never sees the target can talk itself to a unique solution and open the vault; withholding any one player's clue provably makes it unsolvable.
