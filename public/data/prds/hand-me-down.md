## Overview
A proxy draft for 4 players. Packs rotate as usual, but every card you pick goes into your **left neighbor's** collection, not your own. You see only one clause of their three-clause secret objective, so you will confidently feed them the wrong thing. Your own fate is in the hands of the player to your right, and the only lever you have is your mouth. Roughly 4 minutes.

## Problem
Drafting is the best hidden-information mechanic in tabletop and one of the most physically tedious: fanned packs, everyone waiting on the slowest reader, no memory of what wheeled, and no way to keep intent secret while cards are face-down on a table. Meanwhile the fun part — the table-talk of signaling what you need — is usually taboo. Proxy drafting is flatly unplayable in person: you'd have to hide four different partial objective sheets from four different people.

## How it works
Each player is dealt a private 4-card pack. All four players pick simultaneously; the picked card lands publicly in their left neighbor's tableau; packs rotate left; repeat 4 times. 16 cards, 16 picks, one game.

**Private, on your phone:** the pack currently in front of you (different for everyone); your own full 3-clause objective (e.g. *2+ Copper · zero Birds · odd total*); exactly ONE randomly chosen clause of your left neighbor's objective; and your one-use KEEP token.

**Public, on the TV:** all four tableaus, filling live; a gift ledger ("Marco → Priya: Kestrel"); how many cards remain in each rotating pack; the pick timer; and a loud announcement whenever someone burns their KEEP.

KEEP is the drama: once per game you may take the card for yourself instead of gifting it. The TV announces it by name. Everyone now knows you defected, and your left neighbor knows they got skipped.

Because the person feeding you knows only a third of your needs, you talk — constantly, over each other, to the one person who can help you, while the person you're feeding is doing the same to you and you are barely listening. Lies are cheap; the two players not adjacent to you have every reason to muddy your pleas. Objectives reveal and score on the TV at the end.

## Technical approach
Host tab + phone PWAs + a PartyKit room (or Durable Object) as authority. Model: `Pack{id, cards[], holderSeat}`, `Player{seat, objective:[3 clauses], revealedClauseOfLeft, keepUsed, tableau[]}`. All private views are computed per-socket; the host socket receives a strictly redacted frame that never contains any pack or objective.

The hard part is the **rotation barrier under human latency**: rotation must wait for all four picks, but one slow phone stalls the room. A 15-second per-pick timer auto-picks the leftmost card; picks are idempotent and carry a `roundVersion`, so a pick submitted at the instant of rotation is either applied to the correct pack or rejected outright — never applied to the next player's pack. Reconnect must restore your private pack without ever serving it to a phone that has since passed it on.

## v1 scope
- 4 players exactly, 4 packs of 4, one game
- One card taxonomy (color + creature type + number)
- Three fixed objective clause templates
- One KEEP token each
- Final reveal and score on the TV

## Out of scope
Variable player counts, direction reversal, multiple rounds, card art, rules text on cards, spectator mode.

## Risks & unknowns
Agency is the risk — if being fed feels purely passive, the game deflates. Mitigation is the KEEP token and the fact that talking genuinely moves cards. Unknown: whether one revealed clause is the right amount of knowledge, or whether zero clauses (pure begging) is funnier.

## Done means
Four phones complete 16 picks with correct rotation, no phone ever sees another's pack or full objective, at least one KEEP is announced publicly, and the final TV reveal shows at least one player who was sincerely and disastrously mis-fed.
