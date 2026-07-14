## Overview
Canary is a hidden-role blind-navigation game for 4–5 people: one **Foreman** and 3–4 **Crew**, one of whom is secretly the **Saboteur**. The Foreman holds the board; the Crew are blind pieces crossing a minefield; the Saboteur alone can see the mines.

## Problem
Social deduction is usually static talking, and blind-maze co-op is usually trust-pure. Neither lets a lie be *checked against physical truth*. Canary fuses them: the mole lies about spatial facts, and those lies eventually contradict how bodies actually move — so accusations have evidence, not just vibes.

## How it works
Four different truths sit on four screens.
- **Foreman's phone (the map/board):** the 5×5 grid with every Crew token and the exit — but **no mines drawn.**
- **Crew phones (the pieces):** only a keyhole around your own token — blank cells plus a proximity buzz reading "1–3 mines adjacent (somewhere)" with no direction. You move one cell per turn by swiping. You can't see the board, the exit, or each other.
- **Saboteur (a Crew member):** identical keyhole, except their phone secretly renders the **full mine map.** Goal: get a *teammate* (never themselves) to detonate, without getting voted out.
- **Host TV (shared):** a fogged grid that fills in only as cells are safely stepped, plus the turn counter and lives.

Each turn the Foreman calls moves from positions and shouted adjacency reports ("I've got two near me"). Honest Crew report vaguely-but-truthfully; the Saboteur reports false counts to route a teammate onto a mine. A detonation costs a life and triggers an immediate accusation vote; reach the exit with everyone alive within 8 turns and the Crew win.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Model: `grid5x5`, `mines[]`, `exit`, `tokens{player:{x,y}}`, `role{saboteur}`. Turn loop: collect swipes, resolve moves, compute each token's adjacency count, push **per-role filtered state** — Crew get own keyhole + count, the Saboteur additionally gets `mines[]`, the Foreman gets positions + exit only. Because it's turn-based, real-time sync is trivial; the hard part is *design balance* — giving the Saboteur a real lever (verbal lies) while keeping the mole deducible, and enforcing that no client ever receives a hidden layer it shouldn't. Reports stay verbal, so the app models nothing but movement, buzz, reveal, detonation, and vote.

## v1 scope
- 1 Foreman + 3 Crew (1 secret Saboteur), 5×5 grid, 4 mines, one exit.
- Swipe to move one cell; adjacency-count buzz per turn.
- 8 turns, 2 lives; first detonation → one accusation vote.
- Correct vote = Crew win; wrong = Saboteur win.

## Out of scope
- In-app chat/reporting (use your mouths), multiple saboteurs, multi-round scoring, TV cinematics, larger grids.

## Risks & unknowns
- The Saboteur's lever may be too weak if the Foreman ignores reports — playtest whether adjacency reports are load-bearing.
- Mine density vs. 8 turns balance; deduction could be trivial or impossible depending on grid size.
- Grief guard: self-detonation must count as a Saboteur loss.

## Done means
Four phones, a secret Saboteur assigned invisibly; Crew move blind by swipe and feel adjacency buzzes; the Saboteur alone sees mines; a teammate detonation triggers a vote where a correct pick wins for the Crew and a wrong pick wins for the Saboteur; the server never leaks mines to honest Crew or the Foreman.
