## Overview
Assay is a 3–5 player sealed-bid auction party game built on the *winner's curse*. One mystery lot goes up; its true value is the sum of hidden components, and each phone privately sees exactly one of them. Players announce estimates (truthfully or not) to the room, then bid blind. Win it for less than it's worth and you profit; overpay and you eat the curse.

## Problem
Auctions are a rich board-game mechanic but a slog in person: going-once-going-twice drags, and you can't truly hide a sealed bid across a table. Common-value auctions with *private signals*—the interesting kind, where nobody knows the total—are basically impossible on paper without leaks. Phones make each signal genuinely private and make the reveal perfectly simultaneous.

## How it works
**Host screen (shared):** the lot with flavor ("Lot 7: a crate of unlabeled vinyl"), a claims board that fills in each player's *announced* estimate, a countdown, and at reveal: the true value, every bid, and the winner's profit.
**Phone (private):** YOUR signal—one true component of the value ("your appraiser spots a rare pressing worth 40"), which only you see; then a field to type a public CLAIM number to broadcast (bluff or truth); then a single sealed-bid slider.
**Flow:** (1) *Signal* — each phone privately shown its component; true value = sum of all components, so no one knows the total. (2) *Claim* — each phone submits a number that appears on the host board attributed to them. (3) *Bid* — all phones submit one sealed bid; the server reveals them at once. Highest bid wins; winner scores trueValue − bid (can go negative), everyone else 0. Ties on the top bid split or re-bid.

## Technical approach
Host + phone PWAs + authoritative WebSocket server (PartyKit / DO). Data model: `Room{ lotId, components{playerId:int} (server-secret), claims{playerId:int}, bids{playerId:int}, phase }`. Sync: server holds the secret components and sends each only to its owner; claims broadcast only after all are in (a barrier); bids are buffered server-side and revealed simultaneously so nothing leaks partial state. The genuinely hard part is the leak-proof sealed-reveal barrier plus tuning component ranges so the curse bites without being hopeless.

## v1 scope
- 3 players, one lot, one round
- Components are single integers; one claim; one sealed bid
- Host computes true value and shows winner's profit

## Out of scope
- Multiple lots, cross-round budgets/currency, richer signals, reconnection

## Risks & unknowns
- Bluff phase may add little with only 3 players
- Players may not intuit "true value = sum of hidden parts"
- Value-range tuning is fiddly; ties need a clean rule

## Done means
Three phones each see a distinct private component, submit a public claim shown on the host board, submit sealed bids that reveal simultaneously with no leaks, and the host computes true value and displays the winner's profit.
