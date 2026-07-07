## Overview
Engine is a 3–4 player deckbuilder squeezed into Jackbox shape. Everyone builds a private deck on their phone simultaneously, drafting from one shared market shown on the TV. It's for people who love Dominion/Slay-the-Spire engine-building but hate the crushing downtime of passing turns around a table.

## Problem
Tabletop deckbuilders are ~70% waiting: you watch three other people shuffle, count coins, and agonize while you do nothing. The engine-building fantasy is great; the turn structure is a downtime machine. Per-phone play kills the wait — everyone takes their whole turn at the same time, in secret.

## How it works
The game runs in synchronized turns (v1: 4 turns). Each turn has two simultaneous phases behind a server barrier:

1. **Play phase (private):** Your phone draws you a 5-card hand from your own deck (starter cards + whatever you've bought). You tap cards to play them for coins and points; combos chain (a 'draw' card refills, a 'double next card' card multiplies). The TV shows only your coin/point *totals* ticking up — never your hand.
2. **Buy phase (secret, then reveal):** The TV shows a shared market row of 5 cards, each with a limited supply. On your phone you secretly commit one buy (or pass). All commits reveal at once. If two players bought the same last-copy card, the higher coin-spender wins it and the loser's coins refund; exact ties mean *neither* gets it. Won cards shuffle into that player's private deck.

Highest points after 4 turns wins. Your deck, hand, and planned buy are *always* private; the market and the scoreboard are the only shared surface.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object; Socket.IO over Tailscale Serve as fallback). Data model: `Room{turn, phase, market:[{cardId,supply}]}`, per-player `Deck/Hand/Discard/coins/points/committedBuy` (server-authoritative — phones never hold real card state, only a rendered view, so no client can fake a buy). Sync strategy: a phase barrier — the server advances only when all live players have submitted, or a per-phase timer fires. The genuinely hard part is atomic buy resolution: collect all secret commits, resolve collisions and refunds deterministically, mutate every affected deck, then broadcast new private hands — all as one transaction so no phone briefly sees another's cards.

## v1 scope
- 3–4 players, exactly 4 turns.
- One 8-card market pool, ~5 card types (coin, point, draw-2, multiplier, thin/trash).
- Fixed 8-card starter deck for everyone.
- One collision rule (high-spender wins, tie = void).
- TV shows market + score bars + turn timer only.

## Out of scope
- Boss/PvE mode, attacks, card interaction between players' decks.
- Card art beyond text chips; deck-thinning UI polish.
- Reconnect mid-turn, spectators, more than one market row.

## Risks & unknowns
- 4 turns may be too short to *feel* like an engine came together — needs playtest tuning.
- Simultaneous secret buys risk feeling random rather than strategic; the collision rule must reward reading the room.
- Barrier stalls if one player idles — the per-phase timer must be aggressive.

## Done means
Four phones join, play four synchronized turns with fully private hands, the shared market depletes with correct collision refunds, and the TV declares a points winner — with zero moment where any phone can see another player's deck.
