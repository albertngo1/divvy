## Overview
Sight Unseen is a 3–5 player party auction game in the spirit of storage-locker reality shows. The host TV is the auction row of padlocked units; each phone is a bidder's paddle plus a private tip-off. It's for groups who want the thrill of sealed bidding without the slow ritual of writing bids on slips and having an auctioneer read them aloud.

## Problem
Sealed-bid auctions are delicious but tedious in person: everyone scribbles a secret number, someone collects and reads them, and tracking each player's dwindling cash across multiple lots is a chore. Worse, the best version — where bidders have *asymmetric private information* about what's inside — is nearly impossible to run on paper without leaks. Phones make hidden budgets and private clues trivial.

## How it works
The TV shows **5 padlocked lockers**, each blurred/obscured with only a teasing silhouette. Each phone **privately** holds: (1) a fixed cash budget; (2) exactly **one secret clue** about one random locker ("Locker 3 contains something worth 40+", or "Locker 1 is nearly empty") — every player's clue points at a different locker, so information is scattered and partial; (3) your won lockers.

Lockers go up **one at a time**. For each, all players submit a **sealed bid** simultaneously from their private budget (server enforces you can't overspend across the game). Highest bidder wins, pays their bid, and the locker's true contents are revealed and scored against what they paid — profit or bust. **Losers never see the losing bids.** Because each bidder knows one true fact and bluffs the rest, the meta is reading who bids confidently on which locker. After all 5, net worth is tallied on the TV.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object per room). Data model: `Room { lockers[{id, contentsValue, revealed}], currentLot, phase }`, `Player { id, cash, clue, wonLockers[] }`. Clues are dealt server-side from the true contents table and pushed only to their owner. Per lot: server opens a bid window, buffers each player's sealed bid, validates against remaining cash, then resolves highest-bid-wins and broadcasts only the winner + revealed contents. The hard part is **trustworthy sealed bidding**: bids must never transit to other clients, budget enforcement is server-authoritative, and reveal timing must be atomic so no phone infers others' bids from latency.

## v1 scope
- 3 players, 5 lockers, one auction row
- Flat starting cash (e.g. 100), one clue per player
- Hand-authored contents table with 5 lockers
- TV net-worth tally at the end

## Out of scope
- Multiple rounds / rematches, custom locker sets
- Richer clue types, negotiation or trading
- Animations, sound, spectator mode

## Risks & unknowns
- Clue quality: too vague = ignored, too precise = deterministic. Needs tuning
- With 3 players and 5 lockers, someone may win uncontested cheaply — bidding tension risk
- Winner's-curse math must feel fair and legible on reveal

## Done means
Three phones join, each gets a distinct private clue and budget, five sealed-bid lots resolve with correct budget enforcement and winner selection, losing bids stay hidden, and the TV shows a correct final net-worth ranking matching hand calculation.
