## Overview
A three-player silent co-op elimination round, about three minutes. The room must narrow seven cards down to exactly one survivor. The catch: everyone cuts at the same instant, and two players cutting the same card wastes a cut. So the group has to converge on a destination while systematically diverging on every step taken to reach it.

## Problem
Convergence party games almost always reward the focal point — the most obvious answer wins, so the skill ceiling is "be average faster." Here the obvious answer is a trap: the card everyone agrees is worst is exactly the card two people will simultaneously reach for, and that collision is what loses the game. It flips the usual instinct without adding a traitor, a timer, or a buzzer.

## How it works
Seven cards sit in a fixed arc, positions 1-7.

**Public, on the TV:** all seven positions rendered as abstract sigils with numbers only — no words, ever. The TV is a shared coordinate system, not a shared information source.

**Private, on each phone:** the same seven positions, but only four of them have their actual word revealed to you ("HARPOON", "LANDLORD", "WET CEMENT"...). The other three are blank slots you know exist but can't read. Deals are constrained so every card is legible to at least one player and exactly one card is legible to all three. Before round 1, each player privately taps one legible card as their KEEP. Nobody ever sees anyone else's keep.

Two rounds. In each, all three players simultaneously tap a surviving card to cut and lock. On reveal:
- Three distinct cuts: three cards burn away.
- Two players hit the same card: it burns once, and the TV plays a loud waste stinger with two blades visibly clanging into the same slot.

Seven minus six equals one. Any collision at all leaves two or more cards standing, and the room loses. Zero collisions is a win. Gold win: the lone survivor is the KEEP of at least two players.

The only vocabulary is what you *didn't* cut in round one. Someone sparing an unreadable card is either protecting it or can't read it — and you have exactly one round to figure out which.

## Technical approach
Host tab plus phone PWAs on a PartyKit Durable Object (or Socket.IO behind Tailscale Serve for the homelab build). Room code shown on the TV.

State: `{ deck: Card[7] (server-only labels), visibility: playerId -> Set<cardIndex>, keeps: Map, alive: Set<cardIndex>, roundCuts: Map }`. Phones receive only their legible labels; hidden cards arrive as `{index, label: null}` so nothing is recoverable client-side.

Sync is a strict barrier: server buffers cuts, ignores late changes after lock, and only when all three locks land does it compute the collision set and broadcast one atomic resolution frame. The hard part isn't the socket work, it's the deal generator plus the reveal choreography — a collision has to read instantly and viscerally as *waste*, not as a rendering hiccup, or the core lesson of the game never lands. Deals also need a solvability check: at least one card must be reachable as a survivor given the visibility constraints.

## v1 scope
- Exactly 3 players, 7 cards, 2 cut rounds, one hand-authored word list of ~40 nouns
- Private 4-of-7 visibility, one private KEEP per player
- Collision stinger animation on the TV; win/lose/gold-win end card
- No accounts, no scores across rounds, no reconnect handling

## Out of scope
- Variable player counts (card count is hard-tied to 3 players x 2 rounds)
- Images instead of words, custom decks, category packs
- Chat, emotes, or any sanctioned signaling channel

## Risks & unknowns
- Collisions may be so likely that a first-time room never wins once and gives up
- The KEEP may be pure decoration — playtest whether the gold win is ever consciously pursued
- Four-of-seven visibility might be too generous; three may be the real number

## Done means
Three phones join, each provably sees a different four-word subset, two simultaneous lock-and-reveal rounds resolve atomically with collisions correctly wasting cuts, and a silent room reaches a single survivor at least once across five playtests — with the collision stinger reading as "we blew it" to a first-time player who was never told the rule.
