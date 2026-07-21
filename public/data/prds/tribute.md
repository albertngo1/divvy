## Overview
Tribute is a 3–6 player concurrent-room party game built on the cruelest, most elegant auction in game theory: the all-pay auction (a war of attrition / lobbying contest). Everyone bids secretly and simultaneously; the top bid wins the prize; *everybody* forfeits whatever they bid. It's for groups who enjoy watching each other agonize.

## Problem
The all-pay auction is a gorgeous object and nearly unrunnable in person. To do it honestly you'd need every player to slap money on the table at the exact same instant, face-up, with nobody flinching or reacting to a neighbor's hand hovering. Any sequential reveal leaks information; any "count of three" is gameable by the slow hand. True simultaneous secret commitment is precisely what a table full of private phones provides and a passed-around single device cannot.

## How it works
The host shows one prize worth a known N points and each player's starting budget. Each phone PRIVATELY shows a bid dial (0 → your budget) and a CONFIRM button; once you lock, you can't change it. Crucially, the host screen and every other phone show only a neutral "3 of 4 locked" counter — never your number, never even whether a *specific* person has bid high. A server-synchronized timer forces everyone to lock. Then the host reveals all bids at once as an animated bar chart: highest bar wins the prize points; every player, winner and losers alike, loses their bid from their budget. Net for the winner = N − their bid; net for each loser = −their bid, pure bleed. Bid big to win and you might bleed for nothing; bid small and someone edges you by a single point. The entire game is reading how badly the room wants it. v1 is one prize, one round.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object). Data model: `room { players[], prize{points}, budgets:Map, bids:Map (server-only until reveal), locks:Set, phase }`. Bids are written server-side and NEVER broadcast until `phase === 'reveal'`; the wire only ever carries the locked-count. The genuinely hard part is the **commit-then-reveal barrier**: every bid must be immutable before *any* value is exposed, the server must reject post-lock edits, and it must not leak a partial bid through timing or through the "locked" signal (the counter reveals *that* you locked, never *what*). Simultaneity fairness means no player can stall to observe others — the global reveal fires only after all locks (or the deadline), atomically.

## v1 scope
- 3–4 players, one prize, fixed equal budgets
- One simultaneous all-pay round with a lock deadline
- Server-hidden bids; host shows only locked-count until reveal
- Reveal bar chart + net-score screen; defined tie rule (split prize)

## Out of scope
- Multiple prizes, unequal or hidden budgets
- Tournament / cross-round budget carryover
- Chat, taunts, item art

## Risks & unknowns
- All-pay can feel punishing to newcomers; needs playful framing and dramatic reveal to land as fun, not mean
- Players may not grasp "everyone pays" — the UI must scream it before the first bid
- Ties on the top bid need a crisp, pre-announced rule
- Degenerate all-bid-zero rounds if the prize feels not worth it — tune N vs budget

## Done means
Three phones lock secret bids that never appear on the host until the global reveal; the server rejects any post-lock edit; the reveal shows every bar, declares the highest as winner, deducts every player's bid from their budget, displays correct net scores, and resolves a top-bid tie by the defined rule.
