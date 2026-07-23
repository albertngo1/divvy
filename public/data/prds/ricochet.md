## Overview
Ricochet is a cooperative grid-tactics party game that steals Into the Breach's signature loop — *enemies telegraph their attacks; you reposition instead of trading blows* — and splits it across a room. Three players jointly pilot three mechs defending two buildings. It's for groups who like tense collaborative puzzles but hate when one person quarterbacks the whole board.

## Problem
Into the Breach's genius is turning combat into a puzzle of *redirection* rather than damage. But it's single-player, and multiplayer tactics games collapse into one loud person solving it aloud while everyone watches. The itch: keep the threat fully legible to everyone (so no one is lost), yet force genuine negotiation — by hiding each player's TOOLS, not the board.

## How it works
Shared TV: a 5x5 grid. Two enemy bugs sit on it, each showing a red telegraph — the tile it will strike next tick (an arrow into a neighboring cell). Two buildings (2 HP total) sit on threatened tiles. Three mech tokens are on the board, visible to all.
Each phone PRIVATELY: shows YOUR mech plus a hand of 2 action cards drawn from a small deck — PUSH (shove an adjacent unit one tile), PULL, SIDESTEP (move yourself one tile), SWAP. Nobody sees anyone else's hand. Under a 30s timer, all three players commit one card + target simultaneously and blind.
Resolve on TV: cards apply in fixed order (all pushes, then all moves), shoving bugs off their telegraphed tiles — ideally so a bug's attack lands on the OTHER bug or empty air instead of a building. Then attacks fire. A building still standing = win.
The talk: everyone sees the threat, but only you know whether you even HAVE a push, and pushes interfere (I shove the bug east; you shove it back). You must announce and sequence intentions without ever seeing each other's cards.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit Durable Object over Tailscale Serve). Model: `{grid, enemies:[{pos,telegraphDir}], buildings, mechs:[{owner,pos}], hands:{playerId:[card]}, commits:{playerId:{card,target}}}`. Host holds authoritative state; each connection receives only the public board plus its own private hand (server filters per-connection so hands never leak). On timer end the server has all commits, runs a deterministic resolver, and broadcasts an animation script the TV plays step by step. Genuinely hard part: the resolver must be fully deterministic AND legible — push chains, unit collisions, and order-of-operations rendered as discrete animated beats so players trust that the outcome followed from their commits.

## v1 scope
- 3 players, one round, exactly one tick.
- 5x5 board, 2 enemies, 2 buildings, 3 mechs.
- 4 card types, 2-card hands.
- Single win/lose screen.

## Out of scope
- Multiple ticks / campaign, enemy variety, mech HP, card upgrades, reconnection polish, spectator view.

## Risks & unknowns
- Is one blind simultaneous commit enough decision space, or too swingy?
- Legibility of push-chain resolution on the TV.
- Whether three privately-known tools create productive talk vs. pure chaos.

## Done means
Three phones each show a distinct private 2-card hand; all commit blind; the TV resolves pushes deterministically and a building survives or falls strictly as a function of the telegraphs and the committed cards — reproducibly identical from the same commits.
