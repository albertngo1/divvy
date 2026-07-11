## Overview
Head Table is a social constraint-puzzle party game for 3-5 players. One player is the host, whose phone holds the only map: the secret correct seating chart for the table. Everyone else is a blind guest, each holding one private grudge, being shuffled into a lineup they can't see the target of. The host alone sees the whole board and must herd blind, mildly hostile guests into the right order.

## Problem
Seating-chart puzzles (and games like The Mind) are fun because of hidden information, but they usually hand everyone the same constraints. The itch: what if the *board* lived on one phone, the *goal* was secret, and every piece on it had its own private reason to resist? Then arranging the table becomes a negotiation between one informed director and several blind, stubborn tokens.

## How it works
The **host's phone (PRIVATE map/board)** shows the target left-to-right seating order (colored chairs), the live current order, and a "distance to solved" meter. The host sees the whole truth and can't move anyone directly.

Each **guest's phone (PRIVATE)** shows only: buttons to swap seats with your left/right neighbor, and your one secret rule — e.g. "you must sit at an end," or "you refuse the seat immediately right of Blue." You never see the target order or anyone else's rule.

The **shared host TV** shows the current lineup as public colored chairs, a move counter, and a comfort meter: whenever a guest's hidden rule is violated, their chair visibly *fidgets* — giving the host indirect signal without revealing the rule. On solve, the TV flips to reveal target vs. achieved.

Each turn the host may send exactly one guest a private nudge ("move left" / "stay"), a limited budget. Guests, meanwhile, tug toward satisfying their own grudge, which may fight the host's target. Win when the lineup matches the host's chart within the nudge budget.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room { seats: [guestId...], target: [guestId...], rules: {guestId: ruleObj}, nudgesLeft }`. Server validates each swap, recomputes comfort flags, checks the solved condition, and broadcasts the public lineup to all while pushing each guest only its own rule and the host only the target. Hard part isn't sync (state is tiny) — it's *generation*: producing a target order plus a set of private rules that is provably reachable within the nudge budget and where the rules meaningfully conflict without deadlocking.

## v1 scope
- 1 host + 3 guests, a 3-seat lineup
- One hand-authored rule per guest from a small pool
- Fixed nudge budget
- Win = current order equals target; one round

## Out of scope
- 5+ seats, procedural rule generation, difficulty tiers
- Scoring, multiple rounds, keepsake export
- Physical/real-chair variant

## Risks & unknowns
- Rule sets that deadlock or trivially solve
- Whether the fidget meter is legible enough as indirect signal
- 3 seats may be too small to feel like a puzzle

## Done means
On four phones in one room, a host who can see the secret chart uses limited private nudges to arrange three blind guests — each resisting via a hidden rule — into the exact target order, with the TV correctly showing fidgets on violated rules and a solve state at the end.
