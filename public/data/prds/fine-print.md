## Overview
Fine Print is a 4-player hidden-role deduction game where the whole table cooperatively arranges a shared set of cards according to a rule printed privately on each phone. The imposter's rule overlaps with the crew's most of the time and diverges only occasionally — giving their sabotage the deniability of an honest mistake.

## Problem
Imposter games usually make the imposter *act* out of alignment on purpose, which reads as suspicious behavior. The richer itch is a private view that is *almost* the same as everyone else's — where the imposter genuinely believes they're playing correctly, and the room has to distinguish a swap from a shrug.

## How it works
The host screen shows 7 face-up cards in a scramble and an empty ordered slot-row that fills as players place cards. Each **phone privately** shows a one-line sorting RULE. All crewmates get the same rule (e.g. 'smallest number first'). The imposter gets a neighboring rule that agrees on most cards but diverges on a couple (e.g. 'fewest letters in the number-word first' — 6 before 11, but 8 after 80). Phones also show each player's remaining legal placements.

Play proceeds in turns: on your turn you tap one card and place it into the next open slot on the host screen — visible to all. Because rules overlap, the imposter can often place 'correctly'; but to win they must plant at least one card that violates the crew rule. The imposter wins if, at the end, the final sequence is NOT correct by the crew rule AND they survive a vote. Crew wins by finishing a valid sequence OR voting out the imposter. After the last placement, everyone privately votes their suspect on their phone.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ code, cardSet[7], rulePairId, players[], turnOrder, placements[], phase }`. Server owns a curated pair of rules (crew rule + imposter rule) chosen so their orderings share ≥5 of 7 positions. On join it assigns roles and pushes each phone only its rule text plus current legal moves; the host receives placement events. All state is server-authoritative and turn-based, so sync is easy. The hard part is authoring rule-pairs with the right divergence profile — enough overlap for cover, enough conflict that the imposter must eventually reveal themselves to win.

## v1 scope
- One curated card set of 7 + one crew/imposter rule pair
- Exactly 4 players, 1 imposter
- One placement round (each player places ~2 cards), one vote
- No timer, fixed turn order

## Out of scope
- Score/streaks across rounds
- Player-authored or generated rules
- Multiple simultaneous imposters, mid-round accusations

## Risks & unknowns
- Rule-pair tuning is everything: divergence that's too early is a dead giveaway, too late never triggers.
- Players may not grasp their own rule quickly — needs a dead-simple one-line phrasing and a worked example on the phone.

## Done means
Four phones join, each sees a private sorting rule, players place all seven cards onto the host screen in turn, cast private votes, and the host reveals both the rules and whether the crew caught the imposter.
