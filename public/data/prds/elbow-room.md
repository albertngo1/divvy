## Overview
Elbow Room is a 3–5 player land-grab where players simultaneously and privately claim squares on one shared grid. Overlap is death: any square claimed by two or more players goes 'contested' and scores zero for everyone who touched it. You win by staking the most UNCONTESTED territory — i.e. by correctly betting on where nobody else will reach. A fast, tactile, laugh-on-the-reveal filler for any group.

## Problem
Schelling/convergence games are everywhere (match the group!). The opposite instinct — deliberately avoiding the crowd's obvious grabs — is underused and delightfully paranoid. The fun is the reveal: three people all lunged for the shiny center and mutually annihilated it.

## How it works
The host TV shows one shared 8×8 board (over a fun backdrop image). During the 30-second claim phase it shows ONLY a neutral board and a countdown — no live claims, no hints about others.

Each phone PRIVATELY shows the same board and lets the player tap/drag to claim up to 10 squares (a claim budget). Crucially, each phone also privately reveals ONE gold square worth 3× — dealt differently to each player and known only to them. Nobody knows if the tempting center square is someone else's gold or a trap. Players lock in blind.

At reveal the TV animates all claims dropping onto the board at once: solo squares fill in your color and score 1 (gold 3); any square claimed by 2+ players flashes red 'contested' and scores 0 for all claimants. Final score = your surviving squares. Highest total wins. The whole board lights up as a map of collisions and near-misses.

Per-phone architecture is load-bearing: the private claim map plus the secret asymmetric gold tile ARE the game. Pass one phone around and there's no simultaneity, no blindness, no bluff about the center.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO / PartyKit over Tailscale Serve). Data model: `Room{ boardSize, players{ id, color, claims:Set<cell>, goldCell } }`. Sync: server deals distinct `goldCell`s at start; phones send incremental `CLAIM/UNCLAIM` events (server enforces the 10-cap); on `LOCK` or timer expiry server freezes claims. Resolution is trivial server-side: bucket cells by claimant count, mark ≥2 contested, tally scores, broadcast `REVEAL`. Hard part is honestly light — the interesting engineering is the synchronized reveal animation and guaranteeing no phone can read others' claims before lock (server withholds all claim data until reveal).

## v1 scope
- 3 players, one round.
- Fixed 8×8 board, 10-square budget, one secret gold tile each.
- Phone: tap-to-claim with a live 'X/10 used' counter. TV: countdown then animated reveal + scores.

## Out of scope
- Multiple rounds, running totals, accounts, matchmaking.
- Backdrop image themes / variable board sizes.
- Reconnect mid-round.

## Risks & unknowns
- With few players collisions may be rare and the game slack — budget vs board-size ratio needs tuning so scarcity bites.
- Pure blindness might feel like a coin flip; the gold tile adds a private read but may need a second lever (e.g. a public 'hot zone' hint) to feel skillful.
- Reveal must be genuinely satisfying or the whole payoff falls flat.

## Done means
Three phones each claim up to 10 squares on private copies of the board with a distinct secret gold tile; on timer expiry the TV reveals all claims at once; any doubly-claimed square shows contested and scores zero for both; a winner with the most surviving territory is declared.
