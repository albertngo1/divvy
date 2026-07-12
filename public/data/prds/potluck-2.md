## Overview
Potluck is a hidden-information party game for 3-5 players with a shared host "table" screen and a private phone menu each. Everyone simultaneously commits one dish to a communal spread. A varied table feeds everyone; but any dish two players both bring is a duplicate — it "spoils" and BOTH those players lose it. You want to be the only person who thought of your dish, blind to what everyone else is choosing.

## Problem
Unique-bid games ("pick a number nobody else picks") are a fun anti-coordination seed but feel abstract and mathy. There's no cozy, legible version where the *why* of collisions is intuitive and where hidden personal constraints make the overlap genuinely unpredictable instead of pure guesswork.

## How it works
Each phone PRIVATELY shows the same 12-dish menu, but rendered differently per player: 3 dishes greyed out (you're "allergic" — can't pick them) and 1 dish starred (your specialty — worth double if it survives). You never see anyone else's greys or stars, so you can't tell which dishes are even *available* to others, making collision-avoidance real deduction rather than luck. Everyone taps one dish and locks in simultaneously; the host table stays empty until all locks are in. On reveal, the host plates each dish. Duplicates flash and shatter — both bringers score zero for that dish. Unique dishes score 1 (starred specialty scores 2). The private, asymmetric menu is load-bearing: a single passed-around phone can't hold each player's distinct allergy/specialty mask or their simultaneous blind commit.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Player { id, mask: {blocked: dishId[], starred: dishId } }`, `Round { picks: {playerId, dishId}[], locked: Set }`. Server deals masks at round start so each phone only ever receives its own. Sync is turn-commit, not real-time: server buffers picks, reveals nothing until every player has locked (or a 30s timer fires with a random valid pick for stragglers). Collision resolution and scoring are pure server-side set logic. The genuinely hard part is less networking than *mask generation*: masks must guarantee every player has ≥2 legal non-colliding options and that the overlap is tight enough to make collisions likely-but-avoidable — a small constraint-satisfaction pass at deal time.

## v1 scope
- 3 players, 12-dish fixed menu, one round.
- Per-player 3 greyed + 1 starred mask, dealt server-side.
- Simultaneous lock, host reveal, duplicate = both zero.

## Out of scope
- Typing custom dishes, categories beyond food.
- Multi-round tables, dietary-theme decks, scoring history.
- Any real-time animation beyond the reveal.

## Risks & unknowns
- Does the hidden-mask layer add real depth or just noise? Needs playtest.
- Mask generator could deal degenerate boards (forced collision); needs a validity check.
- One round may feel slight — tension might need 3 rounds of the same table.

## Done means
Three phones each receive a distinct valid mask, all lock a dish, and the host correctly plates uniques while shattering any duplicate for both players — with a deliberate collision test producing two zeros and a surviving starred dish scoring 2.
