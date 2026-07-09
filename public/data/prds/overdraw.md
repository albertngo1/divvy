## Overview
Overdraw is a 3–4 player couch co-op deckbuilder in the Slay the Spire lineage, reshaped for Jackbox hardware. The shared TV is a single boss and one team resource; each player's phone is a *private hand of cards*. It's for groups who love the tense combo-chaining of a roguelike deckbuilder but find single-player card games antisocial and pass-the-tablet co-op a bog of "okay show me your hand."

## Problem
Deckbuilders are exquisite solitaire. Every attempt to make them social either turns into one person quarterbacking everyone's turn, or collapses because hidden information can't survive a shared screen. The itch: keep the delicious blind commitment and resource-scarcity math, but make it a *room* activity where nobody can see what you're holding.

## How it works
The host TV shows the boss (HP bar, its telegraphed next attack), a shared **Energy pool** (e.g. 6 pips), and a running play log. Each phone privately shows that player's hand of 5 cards — Attacks, Blocks, Draws, and multi-card Combos — with energy costs.

Each turn (~20s), all players simultaneously queue cards from their private hands. Queuing a card *live-reserves* energy from the shared pool: the TV shows the pool draining but **never which cards or whose**. If the team collectively queues more energy than the pool holds, the overflow cards — resolved in commit-timestamp order — simply **fizzle**, wasted. Then everything resolves: damage to boss, boss counterattack split across anyone who didn't queue enough Block. Between turns, each phone privately draws a **card reward** (pick 1 of 3), so decks personalize and diverge over the fight.

The per-phone architecture is the whole game: hidden hands + a shared resource spent blind means you must *silently ration*, and a single passed-around phone would evaporate the tension instantly.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Room{ boss, sharedEnergy, turnPhase }`, `Player{ hand[], deck[], discard[], hp, queued[] }`. Sync: strict **commit → resolve** phases. During commit, phones send `queue(cardId, ts)`; the DO validates energy availability optimistically and echoes only aggregate pool level to the TV. On resolve, the server orders by server-received timestamp, applies fizzle-on-overflow deterministically, and broadcasts a replay script the TV animates. Hard part: race-free energy reservation across simultaneous phones (last-pip contention) and clean reconnect that restores a private hand without leaking it.

## v1 scope
- 3 players, one boss, exactly 3 turns.
- 12-card shared card pool, fixed starting hands.
- One card-reward step between turns.
- Win = boss dead by turn 3; lose = any player at 0 HP.

## Out of scope
- Persistent runs, relics, multiple bosses, animations beyond a text/emoji log.

## Risks & unknowns
- Is blind rationing *fun* or just frustrating? Needs the pool tuned tight-but-forgiving.
- 20s commit windows may feel rushed for slow readers.

## Done means
Three phones join, each sees a distinct private hand, all queue simultaneously, an overflow visibly fizzles someone's card, the boss dies on turn 3, and no phone ever rendered another player's cards.
