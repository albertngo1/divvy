## Overview
Lion's Share is a 3-5 player party game built on the oldest fair-division mechanic there is — "I cut, you choose" — generalized to a whole table. It's the literal soul of the app's name. The shared TV is the treasure vault; each phone privately holds either the cutter's carving tray or a chooser's sealed claim. For groups who enjoy passive-aggressive fairness and watching a greedy split blow up.

## Problem
Dividing loot fairly around a real table is agony: haggling, "you take the sword then," someone quietly getting shorted, and the divider gaming it in the open. Cut-and-choose fixes the incentive elegantly — but doing it live is slow and everyone sees everyone's hand. It begs for private, simultaneous phones.

## How it works
Eight treasure items (with point values) sit in the vault, shown on the **host screen** as face-up art but with **values hidden to everyone except the cutter**. One player is the **Cutter**. Their phone privately shows every item's true value and lets them drag items into N bundles (N = number of choosers), trying to make bundles feel equal — because they'll get whatever's left over.

Once locked, the host reveals the bundles as face-up groups (still no numbers shown). Every **Chooser** phone privately and simultaneously taps the bundle they claim — nobody sees others' picks until the reveal. **Collision rule:** if two players claim the same bundle, neither gets it (it's burned), and they score zero from it; uncontested bundles go to their claimer; the Cutter keeps all unclaimed/leftover bundles. So the Cutter wins by making splits so even that choosers scatter — and loses if they hide a fat bundle everyone dogpiles.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Item{id,value}`, `Bundle{id,itemIds[]}`, `Claim{playerId,bundleId}`. The server holds true values and NEVER ships them to chooser phones — only the cutter's socket receives valuations; choosers get anonymized bundle contents only. Sync is turn-gated, so it's simple: a `bundlesLocked` broadcast opens a claim window, claims are collected server-side, and only after all-in (or a short timer) does the server compute collisions and broadcast the resolved allocation. **The genuinely hard part is trust/leak-proofing**, not latency: values must be scoped per-socket so a chooser can't sniff them via devtools, and simultaneity must be enforced server-side so no one can watch-then-claim.

## v1 scope
- 3 players: 1 Cutter, 2 Choosers, **one round**.
- 6 items, cutter splits into exactly 2 bundles.
- Simultaneous secret claim, collision = burn.
- Host shows final allocation and scores.

## Out of scope
- Rotating the cutter role across rounds, running totals.
- Negotiation/chat, re-cuts, partial claims, tie-break auctions.
- Persistence, accounts, spectators.

## Risks & unknowns
- Collision-burn may feel too punishing with only 2 choosers — may need a soft split instead of full burn.
- Whether hiding values from choosers is fun-tense or just confusing.
- Cutter's optimal play might collapse to "perfectly even, boring" — item values must be lumpy enough to make even splits genuinely hard.

## Done means
On three real phones, a Cutter privately carves 6 valued items into 2 bundles (choosers never see numbers), both Choosers claim simultaneously in secret, and the server correctly resolves uncontested claims, burns collisions, awards leftovers to the Cutter, and displays a final score — with no chooser able to read item values off the wire.
