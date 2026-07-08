## Overview
Bleed is a silent, simultaneous all-pay auction for 3–6 players. Every phone hides your dwindling bankroll and your private valuation of each lot; you bid, and win or lose, EVERYONE pays what they bid. It's for groups who love the psychology of an auction without the paper scraps and mental arithmetic.

## Problem
Sealed-bid and all-pay auctions are a fantastic party mechanic but miserable to run by hand. Everyone scribbles bids on scraps, folds them, reveals one at a time, and someone does subtraction while four people watch. The slow drain of everyone's money — the bleed — is exactly the fun, and it's exactly what's tedious to track with pen and paper.

## How it works
The host TV shows shared state: the current lot ("Lot 1 of 3") with its base point value, a rising "pot bled" meter, and after each reveal a solvency board where money is shown only as relative bars, never exact numbers.

Each phone shows private state: your secret bankroll (say 100 coins), a bid dial, and — crucially — your PRIVATE multiplier on THIS lot ("worth 3× to you" / "worthless to you"), which no one else can see. You set a bid and confirm. At the deadline all bids reveal at once on the TV. The highest bidder wins the lot's points times THEIR private multiplier — but every player's bid is deducted from their bankroll (all-pay). Three lots, then most points wins. Money is ammunition, not score.

Load-bearing: a hidden bankroll makes bluffing possible, and hidden per-lot multipliers mean a hard bid could be a whale who values the lot triple, or a stone-cold bluff. Pass one phone around and every secret collapses — the game is nothing.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve, or PartyKit DO). Data model: Room { lots[], deadline, phase }; Player { bankroll, multipliers{lotId}, currentBid, locked }. The server holds all secret state; clients only ever receive their own bankroll and multiplier. On lot open the server broadcasts a shared countdown; clients submit currentBid; at the deadline the server clamps bids to bankroll, applies the all-pay deduction, awards the lot, and broadcasts a redacted result (bids shown, bankrolls not). The hard part is the atomic sealed reveal: no client may learn another's bid before the deadline and no edits after peeking, so the server enforces a single lock instant and ignores late edits — a laggy phone can't snipe.

## v1 scope
- 3 players, 3 lots, fixed 100-coin bankroll
- One private multiplier per player per lot (1× or 3×)
- 15s bid timer per lot, all-pay deduction on the server
- TV reveal + final points winner
- 4-letter room code, no accounts

## Out of scope
- Variable bankrolls, borrowing/credit, more lots, trading/negotiation, tie-handling beyond a coin flip, persistence.

## Risks & unknowns
- All-pay can feel punishing — are 3 lots enough to recover from one bad bleed?
- When to reveal others' multipliers: end-of-game "aha" or keep hidden?
- Bankroll-as-ammo vs. money-as-score confusion; needs crisp TV copy.
- Runaway leader if someone hoards early.

## Done means
Three phones join, each sees only its own bankroll and multiplier, three lots run with simultaneous sealed bids, all-pay deductions resolve correctly server-side, the TV reveals bids without leaking bankrolls, and a points winner is crowned — full loop under three minutes.
