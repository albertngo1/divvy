## Overview

A silent 3-player card game for a TV and three phones, played in about eight minutes. Each phone holds a private hand of six picture cards. No two players share a single card. The room wins by playing three cards that all belong to the same hidden semantic family — a family that is never printed anywhere and can only be felt.

## Problem

Most "match me" party games ask players to pick the same option from an identical menu, which collapses into a Schelling-point contest over screen position or the most obvious choice. That isn't convergence, it's guessing the popular answer. The richer version: you and I hold entirely different material and must still land on the same *category*.

## How it works

The deck is authored so every card belongs to exactly one of three families — e.g. THINGS THAT ARE COLD, THINGS THAT ARE LOUD, THINGS THAT COME IN PAIRS. Cards are chosen to be plausibly readable as two of the three (a cymbal is loud and comes in pairs; an icicle is cold and comes in pairs). The families are never displayed.

The server deals three **disjoint** six-card hands, each containing exactly two cards per family, so a unanimous family is always reachable. Each phone privately shows its own six cards, tap-to-select, then a LOCK button. The TV shows only three face-down slots and who has locked.

When all three lock, cards flip on the TV simultaneously — everyone sees the three images, but the verdict is coarse: **MATCHED**, **SPLIT 2–1**, or **SPLIT 1–1–1**. The TV never says which family, never says who was the odd one out on a 2–1. Players stare at three pictures and try to reverse-engineer the axis the room was reaching for.

Played cards burn. Hands shrink 6 → 4 → 2, and because the burn is uneven across families, the space of reachable families narrows in a way each player can only see from inside their own shrinking hand. Three attempts, then it's over. On a win or a loss, the TV finally reveals the three family labels and every card's tag.

## Technical approach

Host browser tab + phone PWAs + authoritative WebSocket room (PartyKit / Durable Object, or Socket.IO over Tailscale Serve).

Data model: `Card { id, art, family }`; `Room { code, deck, round, hands: {playerId: cardId[]}, table: {playerId: cardId|null}, verdicts[] }`. Family tags live only on the server; a card object sent to a phone carries `{id, art}` and nothing else.

Sync: `select` is local-only (never leaves the phone). `lock` sends the card id; the server buffers until all three arrive, then computes the verdict, emits a single `reveal` to every client at once, and moves the cards to a burn pile. Because the flip is a single server-driven event, there is no lock-order leak — the TV's "locked" pips are deliberately unordered.

The genuinely hard part isn't networking, it's **content**: authoring ~24 cards where each sits in exactly one family but reads as two, and where the deal constraint (disjoint hands, 2-per-family each) holds. That's a small constraint solver over a hand-tagged deck, plus real playtesting to confirm the ambiguity is fun rather than arbitrary.

## v1 scope

- 3 players, one deal, three attempts, one family triple
- 18 cards, hand-authored and hand-tagged, emoji or simple line art
- Phone: six cards, select, lock. TV: three slots, lock pips, coarse verdict, final reveal

## Out of scope

- 4+ players, multiple family triples, difficulty tiers
- Scoring, streaks, accounts, card art commissioning
- Any hint system beyond the three-word verdict

## Risks & unknowns

- If the families are too obvious, round one always matches and the game is over; too obscure and 1–1–1 feels random. The tuning window may be narrow
- Coarse feedback may read as unfair rather than tantalizing
- Silence enforcement is social only

## Done means

Three phones join, receive provably disjoint 2-per-family hands (verified server-side), and lock privately. All three cards flip in one synchronized reveal with only a coarse verdict, burned cards do not reappear, and a full three-attempt round ends in the family-label reveal. A test room reaches MATCHED without anyone speaking.
