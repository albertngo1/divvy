## Overview
A quiet, deduction-flavored party game for 4–6 people about the eternal potluck disaster: two people bringing the same thing. The host screen is a communal table; each phone is your private fridge. You want to be *different* from everyone — and you can't talk your way there. For groups who like the slow squeeze of guessing what others will do.

## Problem
Anti-coordination games usually reduce to "everyone type a unique answer," which is either trivial or luck. Potluck adds constraint: you can only bring what's in *your* fridge, so you must diversify from a hand you didn't choose, inferring the odds that someone else is cornered into your dish.

## How it works
SHARED on host: a table with one empty plate per player and a menu board of ~8 dish categories (Potato Salad, Chili, Pie, Bread, Wings, Slaw, Casserole, Fruit). Also a public "craving" tag each round (e.g. "the group is hungry for something savory") that makes some categories worth more.

PRIVATE on each phone: a hand of 3 dish cards dealt from your fridge — asymmetric, so you might be stuck holding two overlapping options. You secretly commit ONE. You never see anyone else's hand; you only know the menu and the craving, and can reason about how many total copies of each dish are likely in play.

Reveal: all plates flip on the host at once. Any dish brought by 2+ players SPOILS — those players score 0 and the plate visibly rots. Unique dishes score their base value, plus a bonus if they match the craving, plus a small "balanced table" bonus if the group collectively covered many categories. The collision is the punishment; being the only chili at the table is the win.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket room (PartyKit / Socket.IO over Tailscale Serve). Data model: `room{craving, deck, players[]}`, `player{id, hand:[dishId], committed:dishId|null}`. Server deals hands (private, sent only to the owning socket), collects commits, then resolves: group commits by dishId, flag any count≥2 as spoiled, compute scores, broadcast the reveal. Sync is trivial (turn-based commit/reveal, no real-time clock). The genuinely hard part is *hand generation*: deal fridges so collisions are tempting but avoidable — enough overlap that someone is often cornered, without forcing an unwinnable round. Tune via a deck-composition function and playtesting, not code cleverness.

## v1 scope
- One round, 4 players.
- 8 dish categories, 3-card private hands, one craving tag.
- Commit → reveal → spoilage → single scoreboard.

## Out of scope
- Multiple rounds, hand redraws, talking/negotiation phases.
- Lying mechanics, dish-stealing, avatars, sound.

## Risks & unknowns
- Could feel like pure luck if hands over-constrain; deck tuning is the make-or-break.
- With no talking it may feel thin; a future chat/bluff layer might be needed but is out for v1.
- 4 players may collide too rarely with 8 categories — tune category count down if flat.

## Done means
Four phones each receive a distinct private 3-card hand, secretly commit one dish, and on reveal any duplicated dish visibly spoils and zeroes those players while unique dishes score — with the host showing a correct scoreboard and no phone able to see another's hand before reveal.
