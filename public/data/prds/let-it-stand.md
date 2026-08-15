## Overview

A one-round proofreading game for 5 phones and a TV. The room is checking a printed notice line by line. Every player's copy has exactly one corrupted line; the imposter's has three. The catch that makes it a game and not arithmetic: you don't know which of your own lines is the corrupt one, so every disagreement might be yours.

## Problem

Imposter-with-a-wrong-view games usually hand innocents the *true* view, so the moment anyone speaks the odd one out is cornered and the round collapses into a 4-on-1 pile. If everyone is unreliable and nobody knows how, the room has to reason about *rates* — who is off more often than chance allows — which is a slower, funnier, much more argumentative shape.

## How it works

The host screen shows a notice with 8 numbered lines, each with one value blanked out: "Line 4 — the gate closes at ▮▮▮▮." Each phone privately shows the *same* eight lines, filled in. Every player's copy has one line where the value has been swapped for a plausible neighbour (9:40 → 10:40). The imposter's copy has three.

Six beats. Each beat the TV calls a line number. All phones simultaneously tap their value from a 4-chip strip — simultaneous and binding, so nobody reads the room first. The TV reveals all five answers attributed, side by side. The plurality value is printed onto the public notice as canon. Anyone off-plurality earns a visible **query mark** beside their name.

Before submitting, a player may spend a **Pull**: name another player and privately see their value for this line only. Innocents get one Pull; the imposter gets three. The TV shows a running **total pulls** counter — not who pulled, not who was pulled. So the counter is the imposter's clock: cleaning up three bad lines means driving the total past what five innocents could plausibly spend, while eating the marks instead means wearing them in public.

After six beats: one vote. Innocents win on a majority for the imposter.

## Technical approach

Cloudflare Durable Object per room. State: `{notice: Line[8], corruption: {playerId → lineIdx[]}, beat, pullsRemaining: {playerId → n}, pullTotal, submissions: {beat → {playerId → value}}, marks}`. Phones get only their own corrupted rendering, generated server-side at room start; the true notice never leaves the DO until reveal.

Sync: each beat is a barrier. Server opens the beat, accepts one submission per player, and holds all of them until the last arrives or a 20s timer expires; only then does it broadcast the reveal and update marks. A Pull is a request/response inside the open beat that mutates `pullTotal` immediately (so the counter can move before the reveal and stay unattributable) but returns the peeked value only to the puller.

The hard part is the pull-timing side channel: if the public counter increments the instant a pull resolves, an attentive room can correlate the bump with who was visibly tapping. v1 batches counter updates to the beat reveal, so pulls are aggregated and untimed.

## v1 scope

- 5 players, 1 round, 1 hardcoded 8-line notice
- 6 called lines, 4-chip tap answers, no free text
- 1 pull for innocents / 3 for the imposter, batched public counter
- Host screen: notice, submissions grid, per-player query marks, pull total
- One vote, one reveal screen showing everyone's real corruptions

## Out of scope

Multiple rounds, generated notices, player-authored lies (submissions are what your copy says or a deliberate misclick), variable player counts, scoring history, chat.

## Risks & unknowns

With 5 players a single innocent error can create a 2-2 plurality tie — needs a tiebreak rule or an odd-player guarantee. Six beats over eight lines may never call an innocent's bad line, which is fine, or may never call two of the imposter's, which is not — bias line selection toward lines that at least three players disagree on. Tapping chips may feel thin next to reading; the notice copy has to be funny enough to carry it.

## Done means

Five phones each render a differently-corrupted notice, six barrier-synced beats complete with no early reveals, pulls resolve privately while the public counter stays unattributable, and a live playtest ends with the room arguing about the pull counter rather than instantly naming the imposter.
