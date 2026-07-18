## Overview
Elbow is a 3-4 player concurrent-room drafting game that fixes the two tedious failures of physical booster drafts: the slow pass-the-pile ritual, and the ugly chaos when two people grab the same card. Here everyone drafts from a shared market SIMULTANEOUSLY, and collisions resolve through a secret priority economy each phone manages privately. The host TV is the market; each phone is your hidden hand and your hidden stash of "elbow."

## Problem
Draft-and-pass is elegant on paper but glacial in person — one player agonizes while five wait. And the rare simultaneous reach for the same card has no clean, silent resolution; you either socially defer or squabble. The interesting decision (how hard do I fight for THIS card versus save my leverage for the next one?) never gets to exist.

## How it works
The host TV shows a shared market of 6 face-up cards, each with a suit/value used for set-collection scoring at the end.

Each draft tick, ALL phones act at once and in private. Your phone shows: the six cards, your growing **tableau** (private), and your remaining **elbow** budget (a pool of, say, 10, spent across the whole draft). You secretly tap the ONE card you want and set an elbow bid (0-to-remaining) with a slider. Nobody sees your pick or your bid.

On reveal: uncontested picks are awarded free (bid refunded). For any card two+ players targeted, the highest secret elbow bid wins and pays it; losers are refunded their elbow but get nothing and must re-pick from the leftovers on the next tick. The host animates the resolution — arrows converging on contested cards, a shove, a winner. The market refills and the draft continues until the deck is drained.

The load-bearing tension: elbow is scarce and shared across the entire draft. Bidding big wins the card but leaves you defenseless later; bidding 0 means you only ever get cards nobody else wanted. Because picks and bids are simultaneous and secret, you're constantly guessing who else covets what — impossible to run with one passed phone.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{deck[], market[6], tick, phase}`, `Player{id, tableau[], elbow, pendingPick, pendingBid}`. Sync is round-based, not real-time-continuous: server opens a tick, collects `{cardId, bid}` from every phone (with a 15s timer + default-to-highest-value-untargeted fallback for stragglers), then resolves atomically and broadcasts the outcome. The hard part is **fair, legible collision resolution**: highest bid wins, ties broken by lowest remaining elbow (rewards the underdog) then coin-flip, and the TV must animate WHY each contest went the way it did so losing a card never feels arbitrary. All picks/bids are hidden until the simultaneous reveal.

## v1 scope
- 3 players, one shared 18-card deck, market of 6
- Elbow budget of 10 each, spent across ~4 ticks until deck drains
- Simple set scoring (most-of-a-suit + matched pairs)
- Host shows market, collision animation, final tableaux + scores

## Out of scope
- Multiple rounds / packs, or wheeling cards back around
- Card abilities beyond raw set-collection value
- Elbow regeneration or trading between players
- Reconnect/spectator handling

## Risks & unknowns
- Whether 3 players collide often enough for the elbow economy to bite
- Slider bidding UX under a 15s timer on a phone
- Making contested-card resolution feel fair, not random, on the TV

## Done means
Three phones join by code; each tick every phone secretly picks a card and sets an elbow bid; the server resolves contests correctly (highest bid pays and wins, refunds losers), the TV animates each collision legibly, and after the deck drains it shows correct set-collection scores from the private tableaus.
