## Overview
Foreman is a simultaneous worker-placement game for 3–5 players: a shared host "job board" of action spots, and each phone a private crew you deploy in secret. It takes the classic euro-game mechanic — placing meeples on a board and blocking rivals — and strips out its two biggest tedium sources: turn order and analysis paralysis.

## Problem
Worker placement in person is elegant in theory and grinding in practice: you wait through everyone's turn, the spot you wanted gets snatched before you act, and turn order silently decides the game. It rewards sitting closest to "first player" more than cleverness. The itch: keep the delicious blocking and over-crowding tension, but let everyone act at once and let the *bluff* live in each player's private hand.

## How it works
The **host screen** shows the job board: 5 action spots, each paying a resource (Brick, Coin, Favor…) and each with a capacity of 1. Everyone has the same 15-second planning window.

Each **phone privately shows**: your crew (3 workers), a small pool of 3 secret **priority chips**, and your hidden **contract card** — the resource mix you're secretly collecting toward (e.g. "2 Brick + 1 Favor"). You drag your workers onto spots on your own phone and optionally stake priority chips on the ones you expect to be contested. Nobody sees anyone's placement until the timer ends.

Then the **reveal**: the host lights up the board. Uncontested spots pay out cleanly. **Overbooked** spots — where two or more crews landed — resolve by total priority staked; highest wins the spot and its payout, ties bounce *everyone* off (the meeple-bumping groan). The joy is watching three crews all pile onto the Brick spot because everyone read everyone else correctly. Collect toward your contract; whoever fills it (or gets closest) wins.

Private simultaneous allocation is the whole point: one phone passed around can't hold three players' secret deployments at once, and the moment placement is public the bluff evaporates.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Sync is **submit-and-barrier**, not continuous: phones send one `allocation{ spotId: count, priority }` payload; the server withholds all state until every player has submitted or the timer expires, then computes resolution and broadcasts one reveal frame. Data model: `Board{ spots[] }`, `Player{ id, crew, priorityLeft, allocation, contract, resources }`.

The genuinely hard part isn't network throughput — it's **fair collision resolution and a dramatic reveal**: the rule must be transparent, tie-handling must feel just (bump-all is legible), and the host animation has to stagger the over-crowded spots so the table *feels* the pile-up rather than reading a table of numbers. Late/missing submissions must default gracefully (unplaced workers idle, no crash).

## v1 scope
- 3 players, 5 spots, 3 workers + 3 priority chips each.
- One planning round, one reveal, one contract each.
- Host board + staggered collision reveal; phone crew/priority/contract.

## Out of scope
- Multiple rounds / resource economy over time.
- Spot capacities > 1, worker types, escalating boards.
- Any turn order at all.

## Risks & unknowns
- Priority-chip staking may be one knob too many for v1 — test placement-only first.
- Does a single simultaneous round give enough read-your-opponents payoff, or does it need 2–3 to build tells?
- Reveal legibility with 5 pile-ups at once.

## Done means
Three phones deploy in secret, the timer ends, the host lights the board: two crews collided on Brick and priority breaks it, one crew grabbed an uncontested Favor, and each player's hidden contract is scored — with nobody having seen another's placement before reveal.
