## Overview
Mulligan steals the deckbuilder (private hands, energy, draw/discard, telegraphed enemy intents) and turns it into a co-op party game. A single boss lives on the TV; 3–4 players each hold a private hand on their phone and must combine cards across hands to survive. For groups who love Slay the Spire / Hearthstone but want it loud and communal.

## Problem
Deckbuilders are the most naturally 'private hand' genre — yet they're solitary. The delicious moment (realizing the exact card sequence that answers the boss's intent) never gets to be a shared, arguing-at-the-table moment because one player holds all the cards.

## How it works
The boss's intent is public on the TV: a telegraphed attack shown as an ordered slot pattern, e.g. `RED → RED → BLUE → GREEN → RED`. To fully block it, the party must PLAY cards whose colors match that sequence, in that order, this turn.

PRIVATE on each phone: your hand of 5 cards (each a color + small effect), your energy (3), your draw/discard counts. You cannot see anyone else's hand. You see the shared boss intent and a live 'sequence-so-far' rail.

The turn is a 60-second negotiation: "I've got the two reds but no green — who has green?" Players commit cards to sequence slots (tap slot → play card). A card locks the slot only if its color matches and the prior slot is filled, so order matters and misplays burn energy. Fill all five slots before the timer → block the attack → win the round. Leftover unblocked slots deal damage; three damage = party wipes.

Per-phone is load-bearing: private hands are the entire puzzle. One shared phone would trivially reveal the full 15–20 cards and destroy the negotiation. Simultaneous private hands + hidden holdings ARE the game.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `{room, boss:{intent:[colors], hp}, timer, sequence:[{slot,color,playerId,cardId}], players:[{id,hand:[card],energy}]}`. Server holds all hands; each client gets ONLY its own hand plus public boss/sequence state. Playing a card is a server-validated action (matches slot color? prior slot filled? energy available?) — clients never trust each other. The genuinely hard part is race conditions: two players tapping the same open slot within the same 100ms must resolve to exactly one accepted play with a clean rejection ('slot taken, card returned') to the loser, so the server serializes slot-claims per slot with optimistic-lock rejection.

## v1 scope
- 3 players, one boss, one attack of 5 slots, one round.
- Pre-built fixed hands (no shop/deck construction yet).
- 4 colors, energy cost 1 per card, 60s timer.
- Win (blocked) / lose (wiped) screen.

## Out of scope
- The deck-building loop (shop, adding cards between fights).
- Card special effects beyond color, multiple boss turns, relics.
- Reconnect, spectators, difficulty scaling.

## Risks & unknowns
- Risk of one loud player quarterbacking; may need per-player 'held colors' fog to keep everyone essential.
- Pure color-matching may be too simple — effects may be needed sooner than v2.
- 60s may be too long/short; tune with playtests.

## Done means
Three phones join a room; each sees only its own hand; the TV shows a 5-slot boss intent; players fill slots in order via server-validated plays with clean same-slot-collision rejection; filling all five before the timer shows a party win, otherwise a wipe — all state authoritative on the server.
