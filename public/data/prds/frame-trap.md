## Overview
Frame Trap is a phone-controller fighting game for 3–6 players around one TV. It steals the two pillars of competitive fighters — dial-a-combo inputs and neutral-game *yomi* (reading your opponent) — and turns them into a simultaneous-commit party brawl where your entire combo string is buffered in secret on your own phone.

## Problem
Fighting games are the richest mind-game genre we have, but they're gated behind execution skill and grim 1v1 focus. Party games almost never capture the delicious "I *knew* you'd do that." And a shared screen physically cannot hold a fighting game — the whole genre exists because your inputs are hidden until they land.

## How it works
Each exchange opens a 10-second PREP window. Privately on your phone you fill three combo slots from a tiny move set. Every move belongs to one class — Strike beats Throw, Throw beats Block, Block beats Strike — and carries a *startup* number (speed) plus a *private target* (which opponent it's aimed at). Faster startup resolves first; a landed hit interrupts the victim's remaining slots.

- **Phone (PRIVATE):** your three slot-pickers, your health, your chosen targets. Nobody else sees any of it.
- **Host TV (SHARED):** the roster with health bars, a countdown, and — after lock — a slow, legible resolution replay showing whose move connected, who got interrupted, and who whiffed into a counter.

Everyone locks at once. The server resolves slot-by-slot in startup order, applies RPS + interrupts, and animates it. One exchange, updated health, repeat. Last fighter standing (or most health after N exchanges) wins.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object). Data model: `Room{players[], phase, exchangeN}`; `Player{hp, buffer:[{class, startup, targetId}]}`. Sync: the server owns the phase clock and broadcasts transitions; phones send a single `lock` payload; **no buffer leaves the server until all players lock or the timer fires.** The hard part isn't latency (everything is turn-gated) — it's a resolution engine that is both DETERMINISTIC and, crucially, LEGIBLE. A six-way tangle of interrupts has to feel *obvious* on the replay, or the mind-game payoff evaporates.

## v1 scope
- 3–4 players, ONE exchange to prove the read is fun (skip full matches).
- Exactly 3 move classes × 2 startup speeds = 6 moves.
- No meter/supers — interrupts + RPS only.
- Host replay = sequential highlight, zero animation polish.

## Out of scope
Supers/meter, spacing/footsies, tournament brackets, cross-house netplay, move unlocks.

## Risks & unknowns
Legibility of multi-way resolution at the table; whether hidden targets breed fun reads or just noise at 6 players; whether a single exchange feels like a "combo" or needs true chains; the RPS core may read thin if the interrupt drama doesn't land visually.

## Done means
Four phones buffer secretly, all lock, and the TV replays a resolution where at least one interrupt visibly cancels someone's combo — and players can point at the screen and explain who out-read whom.
