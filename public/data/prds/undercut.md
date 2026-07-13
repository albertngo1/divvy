## Overview
A fast Bertrand-competition duel for 3–5 players. Each phone is a private lemonade stand; the host TV is the marketplace. You secretly set a price, and the disaster you're trying to avoid is matching your rival exactly.

## Problem
Economy party games tend to be slow and spreadsheet-y. There's room for an instant, gut-level pricing game where the failure mode is *coordination*: landing on the same 'obviously smart' price as someone else wipes you both out.

## How it works
The host TV shows a crowd of thirsty customers with a visible max price they'll pay (e.g. '$5, 40 customers'). Each phone privately sets a price on a slider ($1–$5). Rule: the whole crowd buys from the single CHEAPEST stand — but if two or more stands TIE for cheapest, the crowd argues and walks, voiding every tied stand to $0. So you want to be *uniquely* the lowest: too high and someone undercuts you, too low and you leave money on the table, exactly matching = ruin.

Over a 25-second live window you can nudge your price. The TV leaks ONLY a single '⚠ TIE AT THE BOTTOM' light that flickers on whenever a tie for the current lowest exists — no prices, no identities — so the room can feel a pileup forming and someone should blink first. At lock, the TV reveals all prices, resolves the lowest *unique* stand as winner, and voids the ties. Winner earns price × crowd.

PRIVATE per phone: your own slider and a live 'your potential revenue' readout. SHARED on TV: crowd size, max price, the tie-warning light, the final reveal. A single passed-around phone can't hold five secret simultaneous prices — the private, concurrent state is the whole game.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (Socket.IO over Tailscale Serve, or PartyKit). Data model: `Round {crowd, maxPrice}` and per-player `Bid {playerId, price}`. Sync: phones stream their current price at ~5Hz; the server computes the minimum price and whether ≥2 players share it, then broadcasts ONLY the boolean `tieAtBottom` to the TV (never the prices or who). At lock, the server freezes all bids at a single server tick and resolves lowest-unique. Compute is trivial; the genuinely hard part is the *information design* of the live leak — the tie light must be truthful yet reveal neither value nor identity, and must be debounced so it doesn't strobe chaotically as players drag. Lock fairness (freezing everyone at the same instant) matters so no one sniffs the reveal early.

## v1 scope
- 3 players, one crowd, integer price $1–$5
- 25-second live window with the tie light
- One round, reveal + payout

## Out of scope
- Multiple customer segments, costs, or inventory
- Several rounds, leaderboards
- Non-integer prices

## Risks & unknowns
With integers 1–5 and only 3 players it may be too shallow or luck-driven; the tie light could collapse the game into a chicken match at $1. Likely needs finer price granularity and possibly 4–5 players to sing; consider hiding the light in the final seconds to force commitment.

## Done means
Three phones join via QR, each secretly sets a price, the TV tie-light correctly flickers whenever two players share the current lowest, and at lock the lowest-unique stand wins its payout while any tie is voided — verified in a playtest where two players both land on $2 and both get zeroed while a $3 stand takes the crowd.
