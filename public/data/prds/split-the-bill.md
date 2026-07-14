## Overview
Split the Bill is a concurrent-room party game for 3-6 people who are actually trying to decide where to order dinner from. The host screen (TV/laptop) shows a real menu; every player's phone is a private betting slip. It turns the most passive, indecisive ritual in group life — reading a menu together — into a rigged little stock market run on the table's own appetite.

## Problem
"What do you guys want?" is a black hole. Everyone half-reads the menu, nobody commits, the loudest person wins by attrition. The menu is pure passive consumption. The itch: make the indecision itself the game, and reward the person who both reads the room and quietly bends it.

## How it works
The host displays a curated menu of 8-12 dishes. One round, three phases:
1. **Bet (private, simultaneous):** each phone secretly locks ONE dish it predicts will become the table favorite, plus a hidden chip stake (say 1-5 of a 10-chip bankroll). Nothing is broadcast.
2. **Floor (public, 90s):** open argument. Talk up dishes, talk down others — but your bet is already locked, so you're incentivized to steer the room toward your secret pick while hiding which one it is.
3. **Order & settle:** everyone casts a real order-vote on their phone; most votes = the table favorite. Payout is **parimutuel** — the pot splits among players who bet the winning dish, weighted inversely by how many bet it. Betting the obvious chalk pick pays little; nailing a contrarian favorite you personally engineered pays big.

Private phone shows: your locked pick, stake, chip balance. Host shows: menu, phase timer, then the public vote tally, then the dramatic bet reveal (who bet what) and payouts.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Objects, or Socket.IO over Tailscale Serve). Data model: `room {menu[], phase, pot}`; `player {id, chips, secretPick, stake, voteDish}`. Sync is a lock-step phase machine (bet → floor → vote → reveal); the server broadcasts only phase + public vote tallies, and holds `secretPick`/`stake` server-side until the reveal event. Real-time load is trivial — the genuinely hard part is the payout math: fair parimutuel distribution, tie handling when two dishes tie for favorite, and rounding chips so the pot conserves. Anti-cheat is unneeded (bets are server-held).

## v1 scope
- 3 players, one hardcoded 8-dish menu, one round.
- Integer chips, single winning dish, majority vote.
- Text-only reveal of bets + payouts on host.

## Out of scope
- Real ordering/delivery integration.
- Menu scraping from delivery apps.
- Multi-round bankroll persistence, live odds display, tournaments.

## Risks & unknowns
- Everyone may pile onto the obvious favorite — parimutuel contrarian payoff is the mitigation; needs playtest tuning.
- Persuasion may not actually move locked votes at a 3-person table (thin market).
- Tie resolution can feel arbitrary.

## Done means
Three phones each lock a hidden dish + stake, argue for 90s, then vote; the host computes the table favorite and parimutuel payouts, reveals every bet, and a correct contrarian bettor visibly out-earns someone who bet the chalk favorite.
