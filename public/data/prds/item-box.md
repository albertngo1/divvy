## Overview

**Item Box** steals the survival-horror inventory grid (Resident Evil 4's attaché case, Deus Ex's backpack, Tarkov's rig) and makes it a 4-player cooperative panic. A shared crate of oddly-shaped loot sits on the TV. Four phones are four *different* private cases. The room has 90 seconds to empty the crate into their bags — and the only way to do it is to describe, out loud, a hole nobody else can see.

For groups of 4 who like Overcooked-flavored yelling but want a tactile puzzle rather than a dexterity test.

## Problem

Inventory tetris is a beloved-and-hated solo ritual: private, fiddly, deeply satisfying. It has never been social, because the whole game lives inside one player's bag. The itch: make the packing *negotiable*. Everyone knows the feeling of "I can't take that, it won't fit" — nobody has ever had to convince a room of it.

## How it works

**Host screen (public):** the crate — a 6×4 grid holding 10 polyomino items, each drawn and labeled (SHOTGUN 2×3, HERB 1×1, GRENADE 1×2, BATTERY 2×2). Greyed-out when someone has reserved it. A 90s clock. Four name plates with a green tick each — nothing else. Case contents stay hidden until the reveal.

**Each phone (private):** your own case grid — deliberately *different* per player (4×4, 5×3 with two dead cells, a 3×5 L-shape) — plus a private requirement card: "leave with 1 heal + 1 explosive," "no two red items touching."

Tap an item in the crate to reserve it for 3s (renewing while you drag), then drag and double-tap to rotate it into your case. Release it back if it won't fit. Reservations are exclusive: two people cannot fight over the shotgun.

Win condition: crate empty AND all four requirements satisfied when the buzzer hits. Since no one can see another case, the game is played entirely in speech — "who has a vertical 1×3?", "I can take the battery if someone eats the herb," "stop reserving the grenade, I *need* an explosive." Reveal flips all four cases face-up.

## Technical approach

Host browser tab + phone PWAs + one Cloudflare Durable Object per room (PartyKit). Model: `Crate{items:[{id,cells,tag,class,holder,reserveExpiry}]}`, `Case{playerId,w,h,deadCells,placed:[{itemId,r,c,rot}]}`, `Requirement{playerId,predicateId}`. A shared predicate/geometry module is imported by both client and server so instant local snap-feedback can never disagree with the authoritative ruling.

Sync: reservations are compare-and-set in the DO — the single contended resource. Placement is optimistic locally, confirmed server-side. Views are filtered per socket: a phone receives its own case and requirement only; the host receives crate + tick states.

The hard part is reservation churn under a 90-second clock. A lapsed reservation mid-drag must snap the item home with a haptic instead of silently succeeding, and the TV must grey a reserved item within ~100ms or two players will repeatedly lunge at the same shotgun.

## v1 scope

- Exactly 4 players, one 90s round, one hand-authored crate of 10 items
- Four hardcoded case shapes; two requirement types
- Drag + double-tap rotate; no stacking, no item stats, no combining
- Pass/fail only — no score, no second round
- No reconnect: a dropped phone kills the run

## Out of scope

Procedural crates, more than 4 players, item durability/weight, an inventory "combine" verb, spectators, mobile-landscape layout.

## Risks & unknowns

Spatial dragging on a small screen can feel imprecise — mitigated by ≤4-cell items and generous cell snap. The bigger unknown: does the room actually *talk*, or does everyone go quiet and stare at their own bag? If silent, tighten by making 3 of 10 items unpackable in any single case.

## Done means

Four phones and a TV on one Wi-Fi. Across 5 attempts, a first-time group clears at least one run inside 90s, and in every run at least one player verbally describes their free space to get an item taken off their hands.
