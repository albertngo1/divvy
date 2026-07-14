## Overview
A fast bluffing party game for 3-6, a phone-native riff on Cockroach Poker. Players foist face-down 'pest' cards on each other with a spoken-and-onscreen claim about what the card is. The whole game turns on one asymmetry: the card's true identity is a per-phone secret held only by whoever has touched it, while the accusation is public theater on the TV.

## Problem
Cockroach Poker is a brilliant read-the-table bluffer, but it needs everyone to physically pass a card and hide it, and the fun collapses the instant someone glimpses the wrong card. A shared passed phone can't reproduce it at all — the whole point is that different people know different things about the same card.

## How it works
A deck of pests (v1: two types, Rat and Roach). Each player holds a private hand on their phone. On your turn you pick a card, choose a target, and declare a type (truth or lie) aloud; the host TV shows a face-down card with the caption 'Alice → Bob: “this is a Rat.”' Bob's phone privately offers three buttons: TRUE, FALSE, or PEEK. Call true/false and be right → sender keeps the card face-up in front of them; be wrong → you keep it. PEEK privately reveals the real type to Bob only, and now Bob must re-foist it on a third player with his own fresh claim, dragging the chain along. You lose the instant you collect three face-up cards of the same type. Privately, each phone shows: your hand, and the true face of any card currently offered to or previously peeked by you. The TV shows only public state: the claim, the arrows, and each player's growing face-up collection.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `deck[]` with `{id, trueType}`; `hands: {playerId: cardId[]}`; `offer: {cardId, from, to, claim, seenBy: Set}`; `collections: {playerId: {type: count}}`. Server is the only authority on `trueType` and gates it — a card's true face is pushed *only* to sockets in `seenBy`. The hard part is the trust boundary: never broadcast `trueType`; send it as a targeted message on offer/peek, and validate every call/peek/re-foist server-side so a hacked client can't reveal cards it hasn't earned. Turn/offer state is a tiny FSM; latency is a non-issue since only one offer is live at a time.

## v1 scope
- 3 players, one 8-card deck, exactly two pest types
- Lose at three-of-a-kind; first loser ends the game
- Text claims only (players speak the bluff aloud themselves)
- No re-shuffle, no scoring across games

## Out of scope
- 4+ pest types and full 64-card deck
- Emote/taunt reactions, avatars, sound
- Series play, ELO, spectators

## Risks & unknowns
- Bluffing needs table talk; a silent room falls flat — lean on the aloud declaration
- Preventing `trueType` leakage is security-critical, not cosmetic
- 3 players may be thin; tune deck size so games last ~4 minutes

## Done means
Three phones join from a host code; a card can be foisted, peeked, and re-foisted with the true type visible only on the phones that touched it and never on the TV; a wrong call correctly assigns the card; and collecting three of one type ends the game with the loser named on the host screen.
