## Overview

A 4-player, one-round riff on *Spot It / Dobble*'s underlying math — any two cards share exactly one symbol — turned into a talking game where the cards are private and the search is loud. Host TV plus four phones. Plays in about three minutes.

## Problem

Dobble is a pure reflex race: both cards are face up, and whoever's eyes are faster wins. There's no information game because there's no hidden information. Give each player a private card and the same math produces something else entirely — a negotiation where every word you say to your partner is also handed to the two people watching.

## How it works

Every phone privately holds one 8-symbol card from a projective-plane deck (order 7: 57 cards, 8 symbols each, any two cards intersect in exactly one symbol). The TV shows four name plates and an empty **Called Board**.

The TV names a pair: "Ana ↔ Dev." Those two have 60 seconds to find their shared symbol. The only channel is speech: you say a symbol on your card out loud. The instant you say it, tap it on your phone — that logs it publicly to the Called Board under your name, permanently. Everyone in the room, including the two bystanders, now knows Ana holds ANCHOR.

When either partner believes they've found it, both must privately tap the same symbol within 2 seconds. The TV shows a hit or a miss without saying which symbol was attempted.

**Phone (private):** your eight symbols, tappable; your own called/uncalled state.
**TV (public):** the pair on the clock, the Called Board of leaked symbols by player, hits/misses, timer.

Scoring inverts the race. The pair scores `10 − (symbols they leaked)`. The two bystanders score 1 per symbol leaked that also appears on their own card — because now they know a future opponent's card, and they know it silently. So the pair wants to converge in as few calls as possible, and a bystander wearing a poker face while their symbol gets shouted is the best moment in the game.

## Technical approach

Socket.IO server behind Tailscale Serve, or a PartyKit Durable Object. `Room { deck, cards: {playerId: number[8]}, pair: [id,id], called: [{playerId, symbolId, t}], taps: {playerId: {symbolId, t}} }`.

Cards are dealt server-side and projected per connection: a socket only ever receives its own eight symbol IDs. The Called Board is the only public projection and is append-only.

The genuinely hard part is the **2-second mutual-tap window** under phone-network jitter. Taps carry client timestamps but the server is authoritative: it buffers each player's latest tap with a server receive time, and a match fires when both taps name the same symbol and their server times fall within 2000ms. Late-arriving duplicate taps must not double-fire. Second hard part: generating a valid order-7 incidence structure and dealing cards so no two players get the same card.

## v1 scope

- Exactly 4 players, exactly 1 pairing, 1 round
- Precomputed 57-card deck shipped as a static JSON array
- Text symbol names, not icons
- Score computed and shown on the TV; nothing persisted

## Out of scope

Round-robin over all six pairs, icon art, ASR verification that a called symbol was actually spoken, rejoin, sound effects.

## Risks & unknowns

Players may call symbols without tapping (leaking for free) — v1 relies on social enforcement; ASR is the eventual fix. Text symbols may be slower to scan than icons. The bystander scoring may be too quiet to register in one round.

## Done means

Four phones each show a distinct 8-symbol card; the TV names a pair; called symbols appear on the Called Board under the right name within 300ms; a mutual tap on the true shared symbol inside 2s registers a hit and a mistimed one does not; final scores reflect leak count and bystander overlap.
