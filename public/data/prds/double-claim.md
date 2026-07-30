## Overview

A six-minute draft party game for 3–5 players. One shared pool of absurd items on the TV, everyone claiming simultaneously, collisions settled by a private sealed bid. Each phone secretly holds a scoring rubric nobody else can see. For anyone who has ever sat through a fantasy-league rotisserie draft and realized they spent ninety minutes watching other people think.

## Problem

Rotisserie drafting — one shared pool, strict turn order, one pick at a time — is the highest ratio of waiting to playing in all of tabletop. The turn order exists solely to resolve the question "what if we both want it?", and it answers that question by making everyone take turns being bored. Phones can answer it a better way: let everyone reach at once, and price the collisions.

## How it works

Twenty-four item cards sit face-up on the host screen ("a working ambulance", "nine hundred birthday candles", "a man who claims to be a locksmith"). Four draft rounds; each player takes four items.

Each round is a **6-second claim window**. All phones show the full pool; you tap one item. Order of arrival is irrelevant — the server buffers the whole window, so there is no latency advantage and no thumb race.

When the window closes, uncontested claims are awarded instantly and appear in public tableaus on the TV. Any item claimed by two or more players triggers a **contest**: the host screen freezes on that item, names the claimants, and gives *only them* five seconds to secretly spend from a private priority budget (starts at 10). High bid takes the item and pays it. Losers are refunded their bid **plus one** and must instantly re-claim from what's left.

PRIVATE on each phone: your scoring rubric — a secret objective like "score 3 for anything that runs on gasoline" or "score 2 per item that could plausibly be a weapon" — your priority balance, and your bid entry. PUBLIC on the TV: the pool, everyone's drafted tableau, who contested what, and the winning bid amount only.

The loop that makes it: your picks are public, so the table reverse-engineers your rubric and starts colliding with you on purpose. Losing a collision is *profitable* (+1 priority), so deliberate collisions are a real strategy — but every contest you start advertises what you want.

## Technical approach

Host tab + phone PWAs on a PartyKit room. State: `{pool: {itemId, takenBy}, players: {id, rubricId, priority, tableau[]}, phase, claims, contest}`.

Sync strategy: the server drives a strict phase clock (`claim → resolve → contest* → award`) and phones are dumb renderers of server phase; no client-side timers are trusted. Claims are accepted only while `phase === 'claim'` and are stamped with the server's window, not the client's clock.

The genuinely hard part is the **contest sub-auction without stalling the room**: two players are bidding while three sit idle, and idle players must be given something to watch (the TV shows a tension meter and the claimants' faces) without seeing bids. Nested inside that, the *cascade* — a contest loser re-claims into a pool that a concurrent contest may still be mutating. v1 serializes contests one at a time and re-opens a 4-second mini-claim window for losers only, which is dumb but provably correct. Rubrics are dealt server-side and never appear in any host-bound frame; the same `project(state, viewerId)` discipline applies.

## v1 scope

- 4 players, 24 items, 4 rounds. One deck. One rubric deck of 8.
- 6-second claim window, 5-second contest bid, serialized contests.
- Priority starts at 10, no top-ups.
- Host screen: pool grid, four tableaus, contest overlay, final scoring reveal where each rubric is finally shown.
- Scoring computed server-side and revealed once at the end.

## Out of scope

Multiple rubrics per player, item synergies, trading, spectators, custom decks, more than one game per room, rejoin after disconnect mid-contest, sound design.

## Risks & unknowns

Collisions may be rare with 24 items and 4 players, which kills the whole premise — the pool may need to be tight (12 items) or rubrics deliberately overlapped so two players want the same things. The +1 refund could make farming collisions dominant; may need a cap of one contest loss per round. Six-second windows may feel frantic rather than fun.

## Done means

Four phones draft four items each in under six minutes, at least two contests fire and resolve without desync, the final reveal shows all four secret rubrics, and in playtest at least one player says they collided on purpose.
