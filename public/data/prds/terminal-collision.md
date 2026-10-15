## Overview
A 60-second real-time card game for 3–6 players that steals Dominion's *terminal collision*: the misery of drawing two cards that each need the one Action you have. The room plays one shared turn, and each phone is a private hand.

## Problem
In Dominion, action economy is a solitary puzzle you solve in silence. Its interesting core is that +Actions cards are a public good and terminals are a private payday. That tension only becomes social when several hands feed the same counter.

## How it works
- **Host TV:** one big number, **ACTIONS** (starts at 3). There's also a falling chain of played cards with each card's owner hidden until the end, and a 60s timer.
- **Phone (private):** a 5-card hand dealt from 3 types, and every card costs 1 Action to play:
  - **Village**: +2 Actions, 0 coins now, but +1 coin for every card played after it
  - **Smithy**: draw 2 cards, 2 coins
  - **Market**: +1 Action, 1 coin
  - **Gold** (terminal): 4 coins
- Play by flicking a card up. There are no turns: anyone can play anytime.
- **Collision:** if a card arrives while ACTIONS = 0, it **fizzles**. The chain ends, the fizzler loses all coins, and everyone else banks theirs.
- The chain also ends at the timer or when every hand is empty or passed.
- Nobody sees anyone else's hand. Talking is allowed ('I've got two Villages, wait!'), and so is lying.

The tension: Golds pay best, but every Gold drains the shared pool. Villages pay late, so their owners want to play early and keep the chain alive. With 1 Action left, three people race to drop their Gold at once.

## Technical approach
Socket.IO or a PartyKit room with server-authoritative ordering. The data model is `actions:int`, `chain[] {cardType, ownerId, serverTs}`, `hands[playerId] Card[]`, `coins[playerId]`, `villageStakes[] {ownerId, chainIndexPlayed}`. Clients send `play(cardId)`. The server serializes plays by arrival in a single-threaded Durable Object, so there's no consensus problem, and resolves each one atomically. **The hard part is perceived fairness at the race edge:** two plays 30ms apart with 1 Action left. Pending plays show as a 300ms 'in flight' ghost on the TV. Fairness is by server arrival, and each player's measured RTT is shown at the end so losers can see it was the network rather than a bug. Clients optimistically gray out the card but don't decrement ACTIONS locally.

## v1 scope
- 3–5 players, one 60-second chain
- 4 card types, fixed deal of 5 per player
- Host: ACTIONS number, chain strip, timer, final coin reveal with owners unmasked
- No deckbuilding or buying

## Out of scope (for now)
- Multiple rounds where coins buy cards into your deck (the real deckbuilder layer)
- Attacks, reactions, Throne Room
- Latency compensation beyond arrival order

## Risks & unknowns
- The dominant strategy might be 'everyone plays Villages, then one Gold each.' Village scaling needs tuning.
- Cross-phone latency differences could decide races unfairly on bad Wi-Fi.
- Could degrade into nobody playing until the timer. Fix: unplayed cards score −1.

## Done means
Five phones on Wi-Fi play one chain. The server rejects a play at ACTIONS = 0 as a fizzle that ends the round for everyone. The final screen reveals every card's owner and correct per-player coins, including Village stakes, and in a 5-session playtest at least 2 rounds end in a fizzle.
