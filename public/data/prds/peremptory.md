## Overview

Peremptory is a silent jury-selection game for three players and one shared screen. Nine candidate jurors sit on the TV. Each player must privately strike exactly six of them — no explanation, no discussion, that's what a peremptory challenge *is*. The room wins if exactly one juror is left unstruck by all three players. Zero survivors or two-plus survivors is a mistrial.

## Problem

Convergence games usually ask you to *pick the same thing*. This one asks you to pick the same thing while spending most of your agency on **removal**, which is a completely different feel: you have three keeps and six kills, so you can't just all reach for the obvious favorite — you have to reason about which candidates the others will find unremarkable enough to spare. And you're doing it while looking at different evidence than they are.

## How it works

**Host screen (public):** nine numbered juror portraits with only a name. Below them, a single tally that updates every five seconds: **SEATED: 0 / 1 / MANY**. It never says which juror, never says who struck whom.

**Phone (private):** the same nine jurors — but each player is dealt a different *lens*. Player A's cards show occupations. Player B's show a hobby. Player C's show a one-line quote the juror gave in voir dire. Nobody knows the others' lens exists in the form it does. You tap to strike; struck faces gray out; a counter enforces exactly six. You may re-toggle freely.

So the game is: which juror is *bland from every angle*? The retired accountant who paints birdhouses and said "I just want to be fair" survives three different lenses. The interesting one gets struck by everyone. Convergence means agreeing on mediocrity, silently, through a 3-state oracle that ticks once every five seconds.

The five-second tally cadence is load-bearing: with a live counter, players would binary-search the intersection by toggling one juror at a time. Coarse buckets plus a slow tick make probing expensive enough that intuition beats brute force. Round ends at 120s or when all three hit READY.

## Technical approach

Host tab + phone PWAs + authoritative PartyKit / Durable Object room over WebSocket.

- **Model:** `Room { jurors: [9 × {id, name, lensData: {occupation, hobby, quote}}], players: [{id, lens, struck: Set<jurorId>, ready}], phase, tickSeq }`.
- **Sync:** phones send `{jurorId, struck}` toggles; the server owns each strike set. On join, a phone receives *only its own lens field* per juror — the other two lens strings are never serialized to that client, so devtools snooping reveals nothing.
- **Oracle:** on a 5s server timer, compute `|complement(A) ∩ complement(B) ∩ complement(C)|`, bucket to 0/1/MANY, broadcast to host and phones. Sets with fewer than six strikes count as incomplete and the tally shows `—`.
- **Hard part:** it isn't frame-rate sync, it's *channel design*. Every extra bit the tally leaks collapses the game into mechanical search; every bit removed makes it a coin flip. Expect to tune bucket granularity, tick period, and whether re-toggling should be rate-limited. The reveal also has to be simultaneous and dramatic: all three strike sets overlaid on the host at once, per-lens dossiers finally shown.

## v1 scope

- Exactly 3 players, one round, one hand-authored deck of 9 jurors × 3 lenses.
- Strike exactly 6, 120-second timer, 5-second tally tick.
- Win/mistrial screen with full overlay reveal.
- Room code join, no accounts, no persistence.

## Out of scope

More players, multiple rounds, generated juror content, scoring, a fourth lens, reconnect handling.

## Risks & unknowns

The three lenses must be genuinely non-redundant or the game is trivial, and genuinely non-contradictory or it's random — this is authored-content risk, not engineering risk. MANY may be too coarse to steer by. 9 jurors / 6 strikes may be the wrong ratio; test 9/5 and 12/8.

## Done means

Three phones join, each sees a demonstrably different lens on the same nine faces, the exactly-six constraint is server-enforced, the bucketed tally ticks on schedule and leaks nothing else, and a fresh trio wins roughly one round in three without speaking.
