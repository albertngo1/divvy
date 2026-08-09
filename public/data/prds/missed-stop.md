## Overview

A 90-second silent co-op for exactly three players in a room with a TV. Each phone is riding its own private commuter line. Somewhere on all three lines sits exactly one station in common. Everyone has to pull the cord at that station — the same one — without a word, and without ever being able to go back a stop.

For groups who like Hanabi-shaped tension but won't sit through a whole deck.

## Problem

Silent-coordination games usually give you a symmetric board and let you agree by staring at it. The interesting version is when your options are *individually* private, irreversible, and arrive in a different order for each person — so agreeing means guessing what the others can still reach. Nothing in the party-game shelf models regret about a choice you already rode past.

## How it works

A 14-station deck (Ferry Slip, Old Kiln, Cathedral, Tannery, …). The server deals each phone a private **line**: 8 stations in a fixed order. The deal guarantees exactly **one** station on all three lines and at least three stations on exactly two lines — the traps.

Privately, your phone shows only three things: the name of the station you're **currently standing on**, your position ("stop 3 of 8"), and one number — **how many of the other two have already ridden past this station.** Two buttons: ADVANCE (irreversible) and PULL CORD (final lock).

That number is the whole game. A **2** means dead, go. A **1** means dead, go. A **0** is agonisingly ambiguous: either this station is still ahead of them, or it was never on their line at all. And it updates live — a 0 can flip to 1 while your thumb hovers.

The shared TV shows: three unlabeled progress bars (position out of 8, reshuffled every 5s so you can't track a person), a LOCKED counter, and the full alphabetical roster of all 14 station names so the room shares a vocabulary without knowing who holds what. It never shows anyone's station.

Win: all three locked on the same name. Reveal animates the three lines side by side.

## Technical approach

One Durable Object / PartyKit room per game. State: `{deck, lines: {pid: stationId[]}, cursor: {pid: int}, locked: {pid: stationId|null}, deadline}`. Phones send only `advance` / `lock`; the server owns cursors and rejects anything non-monotone. Lines never leave the DO — each phone receives only `{stationName, position, passedByCount}`, recomputed server-side as `|{q ≠ p : station ∈ line[q] ∧ cursor[q] > indexOf(station, line[q])}|`.

The hard part isn't latency, it's **the race on the derived counter**. When B advances, A's number can change in the same instant A is committing. Fix: push counter deltas immediately, and impose a 400ms LOCK cooldown after any change, with a visible "the line just moved" shake — nobody should lose to a packet.

Second hard part is the dealer: guarantee one triple-common station, place it at asymmetric depths (positions ~2 / ~5 / ~7) so no player's caution instinct is calibrated the same way.

## v1 scope

- Exactly 3 players, one round, one deck of 14 hand-written station names
- Fixed 8-stop lines, 90s clock, running out auto-locks you on your last stop
- Two phone buttons, one private counter, three anonymous TV bars
- Win/lose reveal screen; "play again" reshuffles

## Out of scope

- 4+ players, scoring across rounds, difficulty tiers, transfers/branching lines
- Any chat, emoji, or ping channel; any sound design beyond a lock chime
- Reconnect handling beyond "refresh restores your cursor"

## Risks & unknowns

- The 0-is-ambiguous signal may read as pure noise; needs playtesting on whether three people can actually triangulate from it in 90s
- Possible degenerate strategy: everyone locks on stop 1 and prays. Mitigate by making stop 1 never the triple-common station
- Silence discipline — people will point at the TV. Rule text has to make hands-on-phone explicit

## Done means

Three strangers, three phones, one laptop, no talking: the room reaches a same-station lock at least once in five attempts, and in the debrief at least one player says some version of "it went to 1 while I was standing there and I panicked."
