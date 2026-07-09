## Overview
Hair Trigger is a chaotic reflex party game for 3–6 people in one room, riffing on Anomia's matching-symbol duels. Instead of Anomia's face-up cards where everyone sees the collisions coming, every player's category and current symbol live PRIVATELY on their own phone. Collisions happen invisibly, in the server, and detonate as a two-person duel that the rest of the room witnesses only when it's already erupting.

## Problem
Anomia is brilliant but front-loaded: because all cards are public, sharp players pre-load the answer before the symbols even touch. The panic — the whole point — leaks out. And any "pass one phone around" version is impossible, because simultaneous private state is the entire engine.

## How it works
Each player's phone privately shows two things: their permanent CATEGORY (e.g. "a breakfast food", "an NBA team") and a single SYMBOL drawn from a small shared shape/color pool (e.g. red triangle). The host TV shows only a lobby, a duel spotlight, and the scoreboard.
The server continuously checks: do any two live phones currently share a symbol? When two match, BOTH phones vibrate hard and flash "DUEL" plus — crucially — the OTHER player's category, privately. Each duelist must out-loud blurt a valid word for their opponent's category and slap their own phone's big button when they've said it. The TV lights up both faces so the room knows who's fighting. First slap that the loser (or table) accepts wins the point; both draw fresh symbols and play resumes. Nobody could have prepared, because nobody saw the collision brewing or knew whose category they'd be answering.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code, players[], symbolPool, phase}`, `Player{id, category, currentSymbol, score}`. The server owns all symbols; clients never see each other's state. On every symbol draw the DO recomputes the collision set and, if a pair matches, emits a `duel` event to exactly those two sockets with the opponent's category embedded. The genuinely hard part is fair duel resolution under real network jitter: two slaps arriving milliseconds apart must be ordered by server-receive timestamp, and a contested call needs a lightweight table-override ("redo") so latency never silently steals a point.

## v1 scope (humiliatingly small)
- 3 players, one room, no accounts
- 4-symbol pool, hardcoded category deck of ~20
- One collision-duel type; first-slap-wins, honor-system validity
- Play to 3 points, then a TV winner screen

## Out of scope (for now)
- Automatic word validation / speech recognition
- Anomia's cascade/wild-card chains
- More than 6 players, reconnect grace, cosmetics

## Risks & unknowns
- Simultaneous slaps within network jitter feel unfair — needs a visible "contested → redo" affordance.
- Collision frequency tuning: too many symbols = dead air, too few = nonstop pileups.
- Honor-system validity may spark arguments; acceptable for a party game, risky for strangers.

## Done means
Three phones join via a TV code; each privately sees a distinct category and symbol; when two symbols collide the correct two phones (and only those two) buzz with the opponent's category; first accepted slap scores; first to 3 shows a winner on the TV — with no player ever having seen the collision coming.
