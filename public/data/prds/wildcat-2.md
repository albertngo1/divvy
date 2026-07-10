## Overview
Wildcat is a 3-6 player concurrent-room party game about the *winner's curse*: a sealed-bid auction for an item whose true value is the SAME for everyone, but each player only sees a noisy private estimate of it. It's for people who love bluffing games and the sick thrill of realizing they overpaid. Host screen = the auction house; each phone = one wildcat oil prospector holding a private geological survey.

## Problem
Common-value auctions are the most interesting auction type and the most tedious to run in person: someone has to secretly hand each player a *different* slip of paper with a *different* private estimate, collect sealed bids without peeking, then reveal a hidden true value and do the math. It collapses without a trusted dealer and a stack of index cards. Private per-phone signals fix exactly this.

## How it works
One lot per round: "Lease #7." The lot has a hidden TRUE VALUE V (e.g. $100), fixed by the server. Each **phone privately** shows a different noisy estimate — V plus a random error, e.g. one player sees "$118," another "$84," another "$97." Nobody sees V or anyone else's estimate. The **host screen** shows only the lot name, a drilling animation, and a countdown.
Each phone privately enters one sealed bid and locks it. When all lock, the host reveals: every bid in sequence, then the true V. Highest bidder WINS the lease and pays their bid; their score = V − bid. Everyone else scores 0. The joke writes itself: the winner is usually the player whose estimate was most wildly optimistic — they won the auction and lost money. Disciplined players learn to "shade" their bid below their estimate.
Optional private hint on each phone: "Your surveys have been off by up to ±20 before." That's the whole skill — bidding your estimate is a trap.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code, phase, lot:{trueValue, error[]}, players:[{id,name,estimate,bid,locked}]}`. Server generates trueValue and per-player estimates at round start and pushes each estimate ONLY to its owner over that player's socket. Sync is trivial — no real-time tick, just phase transitions (LOBBY → SURVEY → BID → REVEAL). The genuinely hard part is anti-cheat/trust: estimates must never leak to the host tab (which is on the shared TV), so all private values stay server-side and per-socket; the host only ever receives the lot name and, post-lock, the final bids and V.

## v1 scope
- 3 players, one lot, one round.
- Fixed error distribution (uniform ±20).
- Single sealed bid, no rounds of raising.
- Host shows lot, countdown, then the reveal reel.
- Scoreboard = one number each.

## Out of scope
- Multiple lots / a full auction house.
- English/ascending or Dutch auctions.
- Chat, taunts, re-bids.
- Persistent accounts or economy across rounds.

## Risks & unknowns
- Is one round enough for the "aha" of the curse to land, or does it need 3 to feel the pattern?
- Error spread tuning: too wide = pure luck, too tight = everyone bids the same.
- Players may not grasp "same value, different guess" without a 10-second host explainer.

## Done means
3 phones join via room code, each sees a distinct private estimate, each locks one bid, the host reveals all bids + true value, and the correct winner (highest bid) is charged and scored V−bid — with at least one playtest where the winner visibly overpaid.
