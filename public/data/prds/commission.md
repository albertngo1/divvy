## Overview
A signal-reading booster draft fused with light social deduction, for 3-5 players. Every phone is your private draft seat: your own pack, your own growing gallery, your own secret client. It turns the deepest, most invisible skill in competitive drafting — reading the table from what comes back to you — into the whole game.

## Problem
Drafting (MTG, 7 Wonders) is a beloved mechanic that is miserable live: you physically pass fanned hands of cards, endure downtime while slow pickers agonize, and the *best* part — reading which cards are being cut upstream to infer what your neighbors want — is completely invisible and unenforceable by hand. Secret objectives on paper are a bookkeeping nightmare. Phones make the hidden information trivially clean.

## How it works
Each player is secretly dealt a **Collector** with a taste rule — "adores red," "only night scenes," "no faces." A deck of ~15 art cards is split into packs. Simultaneous draft: each phone shows a **private pack**; you tap one card into your **private gallery** and the rest is instantly routed to the seat on your left. Packs wheel around the ring, so a pack you already picked from comes back thinner — the gaps tell you what your neighbors took. Crucially, you only ever see packs routed to *your* seat.

The host TV shows only the room code, the pool of possible Collector tastes (your suspect list), and draft progress — never any card. After the draft, a **deduction phase**: each phone privately guesses every other player's Collector from the suspect list, using what it personally watched wheel. Scoring: how well your gallery satisfies your own Collector, plus points per correct guess. The TV then reveals every Collector and gallery.

Privately per phone: your Collector, your current pack, your gallery, your guess form. Shared screen: suspect list + progress + final reveal.

## Technical approach
Host browser tab + phone PWAs + an authoritative WebSocket server (PartyKit / Durable Object). Data model: `room {deck, passDirection, phase, players:[{id,name,collector,gallery[],packQueue[],done}]}`. On a pick, the server pops the card into that player's gallery and pushes the remainder onto the next seat's `packQueue`, dequeuing one pack at a time — the server *enforces* that a phone never receives a pack out of turn. Hard part: the pass ring with wildly different pick speeds. Solve with per-pick timers + auto-pick on timeout, and strict server-side routing so a fast picker simply waits on an empty queue rather than seeing ahead.

## v1 scope
- 3 players, one Collector each drawn from 4 possible tastes
- 3 packs of 4 cards, timer auto-pick
- One deduction round, one score screen
- Fixed art set, no accounts

## Out of scope
- Larger tables, wheeling hint/analytics UI
- Custom art or taste rules, multiple rounds
- Reconnection polish

## Risks & unknowns
With tiny packs the wheeled signal may be too thin to deduce — needs tuning of pack size vs. player count. The simultaneous pass ring is fiddly under uneven speeds. Taste rules must be legible from only a few cards.

## Done means
Three phones draft simultaneously from private packs that wheel correctly around the ring; each builds a private gallery; deduction guesses score correctly; the TV reveals Collectors and galleries — and no phone ever receives a pack not routed to its seat.
