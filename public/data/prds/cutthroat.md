## Overview
Cutthroat is a 3–4 player collision draft: a row of items on the shared TV, everyone secretly claims one at the same instant, and if two people claim the same item it shatters and nobody scores it. The tension is reading who else wants what — blind.

## Problem
Drafting (pick-and-pass) is a wonderful mechanic drowned in table tedium: shrinking physical packs, waiting on the slow picker, and information leaking from how long someone agonizes. True simultaneous "everyone point at once" drafting is impossible to run honestly in person — you'd need a 3-2-1 reveal ritual on every single pick, and people cheat by twitching toward what they want.

## How it works
Each round the TV shows a shared row of ~6 items, each with a PUBLIC value number. Every phone PRIVATELY shows the same row plus your SECRET multiplier card (e.g. "RED items ×2 to you; tools worth 0"). Simultaneously and blind, every phone taps the ONE item it claims and locks. Reveal: an item claimed by exactly one player goes to them; an item claimed by two or more shatters and is discarded. The trap is that the publicly-best item is where everyone piles on and burns it, while a plain-looking item that's secretly gold to *you* is a safe solo grab — if nobody reads your intent. Play 3 quick pick-rounds (the row refills between them), then private multiplier cards flip and the TV scores each player's haul. Most points wins.

Load-bearing privacy: your tap and your secret valuations must be simultaneous and hidden. A passed phone can't hold four players' blind claims at once, and a face-up point leaks everything the moment you make it.

## Technical approach
Host tab + phone PWAs + authoritative WS (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{round, row:[{id, publicVal}], players{id, card:multipliers, claim, haul[]}}. Phone emits a claim; the server holds it secret and broadcasts only "N/N players locked" to the TV. On all-locked, the server tallies claims per item, resolves solo→award and collision→shatter, refills the row, and advances the round. Hard part: atomic simultaneous resolution and never leaking a claim mid-round — all collision logic is server-side, clients receive only the resolved row.

## v1 scope
- 3–4 players, 6-item row, 3 pick-rounds, one final score.
- Hand-authored multiplier-card deck, random deal.
- Tap-to-claim + lock; TV shows locked count, then a resolution animation (awards vs shatters).

## Out of scope
- Item combos/interactions, hate-draft info, extra rounds.
- Reclaiming shattered items; tie-break subtleties beyond "all colliders lose."
- Art, accounts, spectator views.

## Risks & unknowns
- Do 3 rounds give a haul big enough to score meaningfully, or do we need 4?
- Collisions could feel purely punishing — need enough solo-grab joy to balance.
- Multiplier cards must create genuine value disagreement or everyone converges on the same picks.

## Done means
Three phones join, each gets a secret multiplier card, a 6-item row appears, all tap blind, the TV resolves solo-awards and shatters simultaneously with no claim leaked, three rounds run, private cards flip and score, and a winner is declared — a full draft under 3 minutes.
