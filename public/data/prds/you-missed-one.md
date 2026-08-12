## Overview

A four-player scoring-and-catching game built on the single most tedious ritual in card games: counting your own hand aloud while everyone else half-watches. In cribbage the rule is *muggins* — if you undercount, an opponent who spots it takes the difference. You Missed One keeps muggins and takes away the thing that makes it toothless in person: full visibility of the hand. For anyone who has ever said "fifteen-two, fifteen-four, and a pair is six" and been wrong.

## Problem

Counting a hand in person is slow, error-prone, and socially awkward — nobody wants to be the person who calls muggins on their friend, and when they do, everyone can verify it instantly, so it's just arithmetic policing. The interesting version — accusing someone when you can only *partly* see their hand — is physically impossible at a table. You cannot deal three of my five cards to one opponent and a different three to another.

## How it works

One player is the Declarer. Their phone privately shows all five of their cards and a tally scratchpad (tap cards to group them; the app deliberately does **not** compute the total). Scoring is teachable in twenty seconds: any subset summing to fifteen = 2, each pair = 2, each run of three or more = its length.

The Declarer types a claimed total and locks it. The host TV shows only that number, huge, next to their name — never the cards.

Every other phone privately shows a **different random three** of the Declarer's five cards, plus one input: a signed number, "they're off by ___", or PASS. All three challengers commit silently and simultaneously; the TV shows only lock-in checkmarks.

Reveal: the server computes the true total. Any challenger whose number exactly equals (true − claimed) takes that many points from the Declarer. Wrong numbers cost the challenger a flat 3. Because you see three cards, you can only ever compute a *lower bound* on what was missed — the two cards you can't see may complete a run or a fifteen that makes your exact figure wrong. So the Declarer's best bluff is to undercount by precisely the amount that only shows up when all five cards are visible.

## Technical approach

PartyKit Durable Object per room; host tab and four phone PWAs on WebSockets. Data model: `{deal: Card[5], declarerId, claimed:int|null, views: {playerId: number[3]}, claims: {playerId: int|"pass"}}`. The server is the sole holder of the full hand and never broadcasts it — each socket receives only its own three-card view, so a player with devtools open gains nothing. Sync is trivial (turn-based, one lock per player). The genuinely hard part is content: a scoring engine that enumerates all 31 subsets for fifteens plus pairs and runs, and a *hand generator* that produces deals where the hidden points are sometimes discoverable from a three-card view and sometimes not. Tune that badly and the game is either arithmetic or a coin flip.

## v1 scope

- Exactly 4 players, one Declarer, one hand, one round
- 12 hand-authored deals, no procedural generation
- 45-second claim window, hard timeout
- Fixed four-letter room code, no lobby, no accounts
- Scores shown once, then discarded

## Out of scope

Pegging, the crib, multiple rounds, rotating dealer, spectators, sound, reconnect grace, real cribbage rules beyond the three scoring types.

## Risks & unknowns

Arithmetic under time pressure may feel like homework rather than play — mitigate with a scratchpad that groups cards visually. The exact-delta requirement may be too punishing; a fallback is "name a lower bound, collect that much." Three-card views may make confident claims impossible, collapsing the game to all-PASS.

## Done means

Four phones and a TV; a Declarer undercounts by 4; at least one challenger nails it and the points visibly move; and in the same playtest at least one challenger is burned by a run completed by the two cards they never saw. Full round under 90 seconds.
