## Overview

A 3-player boss fight that steals the deckbuilder loop — buy cards, dilute your deck, draw badly at the worst moment — and rotates one axis: you cannot buy for yourself. You buy for your left neighbor. For groups who want table talk with a real information asymmetry underneath it.

## Problem

Deckbuilders are solitaire in a circle: everyone optimizes a private engine and looks up 40 minutes later. The interesting part — deck dilution, the dead draw, the card you regret — is invisible to everyone else, so nobody talks. Meanwhile party games have plenty of talk and no engine.

## How it works

A boss with 40 HP and three rounds. Everyone starts with an identical 6-card deck: four Pokes (1 damage) and two Fumbles (0). Each round has three phases.

BUY (20s): the TV shows a 6-card market (Firebomb 5 dmg, Draw Two, Heal, Cheap Shot, Anvil — heavy, high damage, permanently bloats the deck). Each phone secretly picks one and locks. Purchases are simultaneous and hidden; the bought card goes into the LEFT neighbor's deck. Duplicates are fine.

DRAW: the server shuffles your deck and deals 3 cards privately to your phone. You see only what you drew — never a deck list, never a count of what's left in it.

PLAY (20s): you play any of the 3; damage sums onto the boss on the TV.

The result is a knowledge ring: A knows B's deck contents exactly, B knows C's, C knows A's. "Am I holding the Anvil?" has exactly one person in the room who can answer, and that person is competing with you for MVP. The boss must die for anyone to score at all, so gifting is genuinely constructive — but a well-timed Anvil makes someone strong now and clogged later.

PHONE (private): coin, market selection pre-lock, hand of 3, and a persistent "what I gave them" panel naming your neighbor. TV (public): boss HP, round timer, each player's deck SIZE (not contents), cards resolving as they're played, MVP damage tally.

## Technical approach

Host tab + phone PWAs + a Cloudflare Durable Object per game. State: `{seed, boss, round, players: {id, coins, deck: [cardId], hand, damage}, market}`. Phones send `lockBuy`, `playCard`. The server never broadcasts any player's `deck` to that player or to the TV — only `deck.length`.

Sync is easy (phase-locked, 20s timers, no sub-second contention). The hard part is auditable secrecy: shuffles use a stored seeded PRNG so the end-of-game reveal can replay every deck and prove the deal was honest, and the buy phase needs commit-then-reveal so a fast locker can't be inferred from the TV before the phase ends.

## v1 scope

- Exactly 3 players, 3 rounds, one boss, ~6 minutes
- 5 card types, flat numbers, zero synergies or combos
- Fixed seating ring, gifts always go left
- End screen: every deck revealed with per-card gifter attribution

## Out of scope

Trashing/thinning cards, variable player counts, card art, multiple bosses, reconnection, any economy tuning beyond one pass.

## Risks & unknowns

Three rounds may be too few for dilution to bite — if nobody ever draws a dead hand, the whole mechanic is theoretical. Second risk: honest gifting might dominate so hard that the MVP tension never fires, making it plain co-op. Watch whether anyone ever lies about a neighbor's deck.

## Done means

Three phones and a laptop; a full game where at least one player asks aloud what's in their deck, gets an answer, plays on it, and the end-screen reveal shows whether the answer was true — with no player's deck contents ever having appeared on their own screen beforehand.
