## Overview
Cadence is a cooperative count-off game for 3-4 players. The group must count aloud from 1 to N with no assigned order — but every phone privately holds a constraint on how that player may participate, and two people speaking a number at the same instant resets the whole count. It's for groups who love the theater-warmup 'count to twenty, restart on collision' and want it to have teeth.

## Problem
The group count-off is pure emergent voice coordination, but it's stateless and goes stale fast. The itch: give each player a hidden rule so the negotiation gets richer — and make phones essential, because you literally cannot see everyone else's constraints. Do you reveal your rule and burn time, or infer around it?

## How it works
PRIVATE (each phone): your Constraint Card — e.g. 'You may only say EVEN numbers,' 'You must speak exactly twice,' 'Never say two numbers in a row,' 'You cannot say the final number.' Plus a big SAY button you tap the instant you speak your number.
SHARED (host TV): the running count (highest number reached), the target N, a collision counter, and a giant RESET flash when two taps land within the collision window. It never shows anyone's constraints.
LOOP: someone says 'one' and taps; another says 'two' and taps; the group climbs toward N by voice alone. Two people speaking/tapping simultaneously → collision → reset to zero (constraints persist). Hidden rules force negotiation: 'I can't say odds, somebody else grab seven.' Reach N with every constraint honored = win.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object per room). Data model: Room {count, target, lastSpeakerId, collisions}; Player {constraints:[...], tapsUsed}. On SAY tap: server records (playerId, serverTimestamp). Two accepted taps inside the collision window (normalized by per-phone RTT) → collision → reset count, keep constraints. The server validates each accepted number against the speaker's constraint; a violation flashes on the TV (soft fail) or resets, tunable. The hard part is fair simultaneity detection across phones: measure RTT per client at join, offset tap timestamps, and pick a window (~250-350ms) that catches true collisions without punishing quick clean successions. A second constraint the generator must guarantee: any authored constraint SET is jointly satisfiable for the given player count.

## v1 scope
- 3 players, target N=8, one round.
- Each phone: exactly ONE constraint, drawn from a small hand-authored set proven jointly satisfiable.
- SAY tap + collision reset + running count on the TV.
- Win when 8 is reached with no live constraint violation.

## Out of scope
Mic-based speech-onset detection (the tap stands in for the voice), multiple constraints per phone, scoring/streaks, larger N, reconnection, spectators.

## Risks & unknowns
- Tap-as-proxy-for-voice: someone could tap without speaking; the cooperative frame mitigates it.
- Collision-window fairness under latency is the classic hard problem here.
- Constraint sets must be provably satisfiable or the round is unwinnable — generator/curation risk.

## Done means
Three phones join; each shows one private constraint; the group counts to 8 by voice plus tap; a deliberate double-tap flashes RESET on the TV; reaching 8 with every constraint honored shows WIN.
