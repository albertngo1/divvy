## Overview

By Omission is a silent, single-round party game for four people in one room with a TV and their own phones. Each player is dealt a private hand of seven picture-cards. Over six simultaneous ticks everyone discards exactly one card, until each player holds a single card. You score only if at least one other player is holding the identical card. Nobody talks, gestures, or points. The only shared language is the growing pile of what the room has thrown away.

## Problem

Every match-without-talking game hands you a channel: a clue word, a doodle, a charade. The channel becomes the whole game, and matching collapses into trivia about how well you know your friends. Almost nobody has built the inverse — a game where the only signal is negative, where you announce *I am going toward the tools* by conspicuously jettisoning every animal you own. That inversion is impossible if everyone sees the same cards; it only exists when hands are private and unequal.

## How it works

A fixed 12-card deck (bold icon plus one word: ANVIL, MOTH, KETTLE...). The server deals four private 7-card hands with a tuned overlap: one card called STONE appears in all four hands, two cards appear in three hands, several in two, a couple in exactly one. Nobody knows the distribution.

Six ticks, 12 seconds each. Each tick every phone must lock one card to discard, simultaneously.

**Phone (private):** your seven cards, tap-to-select, a LOCK button, the countdown, and a running list of what you personally have thrown.

**Host TV (public):** the tick number, four anonymous lock lights, and the discard field — every card that has left the game, grouped with counts (ANVIL x2, MOTH x1), never attributed to anyone. Counts are the meat: ANVIL x2 means at most one player still holds one, so it is a dead target. What has *not* appeared is the real message.

**Scoring:** let k be the number of players ending on the same card. k=1 scores 0. k=2 or 3 scores k squared. k=4 scores 0 — you need company, not unanimity. STONE, sitting in all four hands, is the obvious safe convergence point and therefore a trap worth zero.

## Technical approach

PartyKit / Cloudflare Durable Object per room. State: `{code, tick, deadline, deck, players:[{id, glyph, hand[], pick, locked}], discards[]}`. A hand is only ever serialized to that player's own socket. Broadcast payload is `{tick, deadline, lockedCount, discardCounts}` and nothing else. The server owns the tick clock; a client/server time handshake drives the countdown so phones cannot disagree about the deadline. On all-locked-or-timeout the server resolves, shuffles the tick's discards before appending, and emits the new public state; timeouts auto-discard a random card.

The genuinely hard part is anonymity as an engineering constraint, not a UI choice. Lock acknowledgements must be fixed-size and timing-padded so message length or arrival order cannot leak a pick. Reconnects must restore a private hand from the DO without re-dealing. The second hard part is deck design: tuning the overlap distribution so a real Goldilocks answer exists is a math problem, not a content problem.

## v1 scope

- Exactly 4 players, one round, one hard-coded 12-card deck
- 6 ticks x 12s, room-code join, no lobby, no accounts
- Auto-discard on timeout
- One reveal screen: final cards, groups, scores

## Out of scope

Variable player counts, multiple rounds, custom or generated decks, audio, spectators, rematch flow, animation polish, i18n.

## Risks & unknowns

Four players may be too thin for interesting overlap math. The negative channel may be too weak to converge at all, producing pure noise — discard counts are the mitigation. The k=4 scores 0 rule may read as cruel or confusing on a first play and needs a one-line TV explainer.

## Done means

Four phones join by code, a full six-tick round resolves to a correct scored reveal, the WebSocket log proves no phone ever received another phone's hand, and in at least three of five playtests two players land on the same non-STONE card and can each name, afterwards, the specific discard that told them.
