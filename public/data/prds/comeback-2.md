## Overview
Comeback is a booster-style drafting party game for 3–6 players (host TV + private phones) whose twist is the "wheel": each pick, you secretly bet on which card you're passing away will loop the whole table and come back to you unclaimed. Cards are themed as road-trip snacks and gadgets so nobody needs to know a real card game.

## Problem
Card drafting is an elegant mechanic strangled by physical logistics: passing stacks of cards, waiting on the slowest picker, and — worst — the best part, the silent "will this wheel back to me?" mind-game, is completely invisible and unenforceable at a real table. You can't prove your read, so nobody plays it.

## How it works
Everyone starts with a private pack of ~4 cards on their phone. Simultaneously each player does two things: (1) KEEP one card, and (2) secretly TAG one other card in the pack as your wheel-bet — the one you predict will still be unpicked when the pack loops back to you. Then all packs pass one seat at once, instantly. Repeat until packs are empty. The host TV shows only anonymized pack flow, pick counts, and each player's face-down "kept" pile size — never contents. Each phone PRIVATELY shows: your current pack, your kept cards, your standing wheel-bets, and your secret collection goal (e.g. "most salty snacks"). Scoring: your kept collection scores set-collection points against your private goal, PLUS a bonus every time a card you tagged actually returns to your hand still unpicked.

Why phones are load-bearing: simultaneous private packs, hidden bets, and private goals all at once. A single passed-around phone would break simultaneity and expose every pack — the entire game dissolves.

## Technical approach
Host + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: Room{seatOrder, round, packsInFlight}; Pack{id, cards[]}; Player{id, currentPackId, kept[], bets:{cardId→originPackId}, goalCard}. Sync: a per-pick barrier — the server waits for every player's KEEP+TAG, then rotates pack references one seat, and checks each returning pack for a tagged card the receiver still owns to award the wheel bonus. Hard part: the barrier (a slow player stalls everyone) — solved with a per-pick timer that auto-keeps the highest-value card; plus faithfully tracking each pack's identity through the loop so bets resolve correctly.

## v1 scope
- 3 players, packs of 4 cards, ONE draft (each pack loops once)
- One private goal each, one wheel-tag per pick
- Single end-of-round scoring on the TV

## Out of scope
- Multiple booster rounds, trading, hate-draft signaling UI, card art

## Risks & unknowns
With only 3 players a pack wheels quickly, so pack size must be tuned to make bets meaningful. Teaching "the wheel" to non-gamers is the main onboarding risk. Barrier stalls need the auto-pick timer to feel fair.

## Done means
Three phones each see a distinct private pack; players KEEP+TAG simultaneously; packs rotate one seat; a tagged card that correctly returns unpicked pays a visible bonus; and final set-collection + wheel scores render for all three players in one room.
