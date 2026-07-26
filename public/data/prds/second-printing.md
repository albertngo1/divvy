## Overview
A 4-player hidden-role game for a TV plus four phones, with one inversion: **the imposter doesn't know they're the imposter.** Every player is sincerely following the rules on their own screen; one screen was printed wrong. For groups who like deduction but hate performing a lie.

## Problem
Almost every social-deduction game asks someone to *act*. Lying is an unevenly distributed skill — the theater kid wins, the quiet person loses, and the round is decided by delivery rather than evidence. Second Printing removes deceit entirely. Nobody bluffs, nobody has a secret to protect, and the only evidence is behavior that doesn't fit a shared document nobody can see all of.

## How it works
The **TV** shows a 4×4 grid of glyphs (each tile has a shape and a color) and a public CHAIN of picks along the bottom. Turn order rotates; the round is 12 picks, three per player.

Each **phone** privately shows: your STANDING ORDERS — three clauses, e.g. *"your pick must share shape OR color with the previous pick"*, *"row 4 is off-limits"*, *"no color twice in a row"* — and a live mirror of the grid with every illegal tile greyed out **per your own orders**. You cannot break your own rules; the app won't let you.

Three phones carry an identical order card. One phone has exactly one clause silently altered (`shape OR color` → `shape AND color`; `row 4` → `row 1`). No one is told anything differs.

So the imposter picks from a subtly wrong legal set, and their picks look flatly illegal to the other three. Simultaneously the imposter watches three people take tiles their own sheet forbids and slowly concludes *the room is cheating*. Talking out loud is encouraged and immediately paranoid.

After pick 12 every phone privately answers: (a) who was reading a different sheet, (b) yes/no — *was it me?* Crew wins on a majority hit; the imposter wins by escaping. The self-bet scores separately, so "I think I'm the broken one" is a real, satisfying play.

## Technical approach
Host browser tab + phone PWAs against a PartyKit Durable Object (one room code, ~8 messages/sec peak).

Data model: `room{phase, grid[16]{shape,color}, chain[], turnIdx, players{id,seat,rulesetId}}`. Clauses are declarative JSON predicates (`{type:'forbidRow',n:4}`, `{type:'mustShare',of:['shape','color'],mode:'any'}`) consumed by a single pure `legalTiles(grid, chain, clauses)` module imported by **both** server and client — so the grey-out a player sees and the server's authoritative ruling can never disagree.

Sync: each pick is a server-ordered event; the server then pushes every player their own 16-bit `legalMask` on their own connection. Masks are never broadcast. Taps carry `chainLen` and are rejected if stale.

The genuinely hard part is not sockets — it's tuning **divergence**. At setup the server runs ~2000 simulated playouts comparing true vs. forged rulesets and only ships a forged clause whose legal set differs on 25–40% of reachable board states. Too rare and the imposter never surfaces; too frequent and turn two convicts them.

## v1 scope
- Exactly 4 players, one 12-pick round, one fixed grid.
- One hand-authored ruleset pair, divergence verified offline.
- Grey-out, public chain, blind vote, self-bet, and a reveal screen showing both sheets side by side.
- No accounts, no persistence, no lobby beyond a room code.

## Out of scope
Multiple rounds, multiple imposters, generated or player-authored rules, spectator view, reconnect recovery, audio.

## Risks & unknowns
- Bad luck: the imposter may draw three non-divergent turns. Mitigate by seeding turn order from the playout search.
- The grid may read as a solo puzzle rather than a party game if nobody talks; may need a forced 20s "defend your pick" beat.
- Grey-out removes agency — legal sets must stay in the 4–7 tile range to feel like choices.

## Done means
Four phones and a TV complete one round end-to-end: one phone demonstrably greys differently, all 12 picks land on the public chain, the blind vote and self-bet resolve, and the side-by-side sheet reveal fires. Playtest bar: in at least half of rooms, players argue about a *specific pick* before voting.
