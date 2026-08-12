## Overview
A 90-second silent standoff for three players. Eight options sit on the shared screen. Everyone must end up on the same one — but each phone privately values them differently, and the room is scored on the *sum* of those private values. The option that wins is almost never anyone's first choice.

## Problem
Every convergence game in this genre is pure coordination: all players want the same thing and only lack information. Real silent agreement is worse than that — people want *different* things and still have to land together. Nobody's Favorite adds conflicting private preferences, so converging is a concession, not a puzzle, and the drama is watching someone finally give up their peak with a thumb.

## How it works
**Shared (TV):** eight tiles (simple named things — a lighthouse, a hot dog, a Roomba). Below them, one number: how many DISTINCT options the room is currently sitting on — 3, 2, or 1. A 90-second clock. Nothing else. No names, no counts per tile.

**Private (each phone):** the same eight tiles, each with a private payoff bar, 0–10, dealt so that (a) no two players share a peak and (b) exactly one option has a strong three-way total while being nobody's top pick. You always occupy exactly one option; tapping another moves you instantly. Your phone shows only your own bars — never anyone else's, never the running total.

**The one channel:** each phone holds **two FLASH tokens**. Spending one makes that tile pulse on the TV for everyone, anonymously. That's the entire vocabulary of the game: six pulses, no attribution. Flash your own peak to dig in, or flash a compromise to signal surrender. Whoever flashes first has spent half their voice.

**Locking:** when the distinct count hits 1, a 3-second countdown starts on the TV. Anyone can break it by moving — which is itself a loud, deniable act. If it survives, the round ends and the TV reveals all three private payoff sets side by side. Score = sum on the locked tile. Par is 18 of 30; below that, the room agreed on garbage.

The fun is the middle minute at distinct-count 2: two people already matched, one holding out, and no way to know whether they're stubborn or just haven't noticed.

## Technical approach
Host tab + phone PWAs, authoritative WebSocket server (PartyKit / Durable Object per room). State: `{options: [8], players: [{id, choice, payoffs: int[8], flashesLeft}], distinctCount, lockTimer}`. Payoff vectors are generated server-side at round start with a rejection sampler enforcing the distinct-peaks and one-good-compromise conditions, then pushed to exactly one connection each.

Sync is easy here — the shared state is one small integer — so the genuinely hard part is **leak discipline plus lock-race fairness**. The distinct count must never be derivable into "who is where": debounce moves to a 250 ms server-side quantum, so two simultaneous moves resolve to one visible transition and you cannot time-correlate a count change with your own tap. Lock countdown runs on the server clock, broadcast as a deadline timestamp, so a break at 2.9 s is adjudicated once, not per client.

## v1 scope
- Exactly 3 players, one 90-second round, one payoff deal
- 8 hardcoded options, text only
- Two flash tokens each, no cooldown
- TV shows distinct count, clock, lock countdown, final reveal table
- Pass/fail against par 18; no leaderboard

## Out of scope
4+ players, multiple rounds, themed option packs, chat or emoji, tuning payoff difficulty, reconnects.

## Risks & unknowns
The dominant failure is a fast trivial solve: someone flashes their peak in second three and the others just cave, ending it in 15 seconds with a bad score. Par scoring is the counterweight — caving early is *punished* — but the tuning of the payoff generator is unproven. Also risky: three stubborn players producing 90 seconds of a static screen showing "3". Consider a late-round nudge that reveals the current best-possible total.

## Done means
Three phones on a LAN can lock a tile; at least one playtest ends with a lock broken during the 3-second countdown; across five rounds, the modal winning tile is not the top pick of any player.
