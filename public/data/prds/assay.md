## Overview
Assay is a common-value sealed-bid auction party game for 3-5 players who like the bluff-and-flinch of poker. Everyone bids on the *same* mystery lot, but each phone privately sees only a sliver of what it's actually worth — so somebody always overpays. It's the winner's curse, turned into a party trick.

## Problem
Running a real auction in person is tedious: collecting sealed bids, secretly handing out value-clue slips, tallying, and doing the winner's-curse arithmetic by hand. And you can't keep partial-information signals secret with cards on the table — the instant a clue is visible, the whole tension collapses.

## How it works
The host shows a mystery lot — "Crate #1" — whose TRUE value is the sum of 6 hidden tokens. Each phone PRIVATELY receives 2 of those 6 tokens: you glimpse part of the truth, nobody sees the whole. You privately enter one sealed bid. On reveal the highest bidder wins the crate, PAYS their bid, and scores `trueValue − bid`; bid over the true value and that's negative — the curse. Everyone else scores 0. Over 3 crates, most profit wins. The delicious hook: your two tokens might be the two biggest, tempting a fat overbid, while the player holding scraps bids scared and steals value.

**Private (phone):** YOUR 2 secret tokens and your sealed bid entry. **Shared (TV):** the lot, the simultaneous bid reveal, running profits, and a post-round breakdown showing everyone's tokens so the table sees exactly who got cursed.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: `Lot{id, tokens[6], trueValue}`, `Signal{playerId, lotId, shownTokens[2]}`, `Bid{playerId, lotId, amount}`. The server generates the tokens, deals DISJOINT random 2-token subsets (3 players × 2 = the full 6, clean), holds sealed bids until all are in, then reveals atomically and resolves winner + payoff. The hard part isn't latency — it's information control: the server must never send a client any token outside its own signal until reveal, must handle ties (split or re-bid), and must generate token spreads interesting enough to avoid degenerate all-equal crates. Beyond 3 players signals overlap, so the deal must keep total info genuinely partial.

## v1 scope
- Exactly 3 players (6 tokens, 2 each, disjoint)
- 3 sequential crates, sealed bid via number entry
- `trueValue − bid` scoring, simultaneous reveal, single winner

## Out of scope
- Variable player counts / overlapping-signal dealing, bid-shading tutorials, animations, more rounds, collusion mechanics, reconnection grace

## Risks & unknowns
- The winner's curse can feel punishing or mathy for casual players — the reveal spectacle has to carry it.
- With 3 disjoint signals the room collectively knows the full value, so bids leak info; token ranges must be tuned so meta-deduction doesn't trivialize it.
- Math-averse players may bounce off explicit `true − bid` scoring.

## Done means
3 phones each receive exactly their own 2 tokens (verified to never leak others'), each submits one sealed bid, the server resolves the high bidder and pays `true − bid` correctly across 3 crates, and the host displays a winner plus a full per-crate token reveal.
