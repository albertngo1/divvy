## Overview

A 4–6 player hidden-role word game for a TV plus phones, riffing directly on **The Chameleon**. Everyone sees a public 4×4 grid of words. Everyone but one player secretly knows which cell is the target. Each player gives a one-word clue. Then everyone votes. The twist: every phone is privately issued a **character budget** — a maximum clue length between 3 and 10 — and nobody can see anyone else's budget.

For groups who already love Chameleon and have burned out on it, because the tell ("vague clue = guilty") has become mechanical.

## Problem

Chameleon dies once the table learns one heuristic: short, safe, low-information clues mean you're the Chameleon. Good players start over-committing to prove innocence, and the read becomes arithmetic instead of psychology. The game needs its own tell poisoned.

## How it works

1. Host screen shows the 4×4 grid, visible all round.
2. **Private per phone:** informed players see the grid with the target cell highlighted plus a big **"YOUR LIMIT: 4"**. The Chameleon sees the same grid with nothing highlighted, plus their own budget. Budgets are drawn from a shuffled bag so the distribution is unknowable from your own draw.
3. All phones type a single-token clue simultaneously; the server rejects anything over budget (you may go shorter, never longer). Host shows a lock pip per player, no text.
4. When the last lock lands, host reveals every clue at once in monospace, so **length is unmistakable and provenance is not**. FERN and BOWED sit next to each other and neither is annotated.
5. Private simultaneous vote on each phone. Host reveals the tally. If the Chameleon is caught, they get one private guess at the grid cell to steal the round.

The fun: an informed player holding a 3 gets voted out for cowardice they never chose, and the Chameleon holding a 9 must either commit to a long confident-looking lie or fake being squeezed. "I swear I only had four letters" is untestable cheap talk, and that's the point.

## Technical approach

PartyKit Durable Object per room; host tab and phone PWAs both join over WebSocket with a `role`. Room state: `{grid[16], targetIdx, chameleonId, budgets: Map<pid,int>, clues: Map<pid,{text,len}>, votes: Map<pid,pid>, phase}`.

Authoritative server, aggressive redaction: a phone **never** receives full state — only its own slice (`{grid, myTarget?, myBudget}`). The classic failure here is shipping the room object and hiding fields in the UI; anyone with devtools wins. Reconnect replays only the private slice keyed by a `localStorage` playerId.

Simultaneity matters more than latency: clue text is broadcast only after the final lock, so nobody anchors. Budget enforcement is server-side; client `maxlength` is UX only. Count **graphemes**, not UTF-16 code units, or emoji clues break the cap.

## v1 scope

- One round. One hardcoded 4×4 grid.
- 4–5 players, room code, no accounts.
- Budgets drawn from a fixed bag {3,3,4,5,7,9}.
- Clue lock → simultaneous reveal → vote → Chameleon steal guess → win/lose card.

## Out of scope

Scoring across rounds, grid packs, spectators, animation, sound, rejoin polish, any "prove your budget" mechanic.

## Risks & unknowns

A budget of 2 is unplayable — floor at 3. Players will shout their budgets out loud; unverifiable, probably good, needs playtesting. Real risk: budgets add noise rather than a new read, and voting becomes coin-flippy.

## Done means

Five phones, one round, every clue length silently constrained by a budget only its owner saw, votes tallied on the TV — and at least one playtest where an innocent is voted out purely for being squeezed.
