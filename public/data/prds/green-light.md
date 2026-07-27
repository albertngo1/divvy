## Overview

Green Light turns the "so what are we watching" stall into a rigged prediction market with a binding real-world payout: the room watches whatever wins. Four people, five candidate titles, one three-minute market. Everyone argues out loud like normal. Everyone is also secretly holding a position.

## Problem

Deciding what to watch is the most-consumed unscripted content in any living room and it's pure friction — the loudest person wins, the quiet person resents it, and nobody's preferences are legible. Meanwhile the *structure* of the argument is already a market: people talk titles up, bandwagons form, someone capitulates. Nobody has priced it.

## How it works

Lobby: the host tab loads five candidate titles (v1 ships a preset list). The server privately deals each phone **one LONG** title and **one SHORT** title. Deals overlap — two players can be long on the same thing and never know they're allies.

**Private, on each phone:** your two positions, a five-slider allocation of 100 conviction points across the titles, and later your binding vote. Sliders are continuously re-draggable for the whole market phase.

**Shared, on the TV:** five price bars, updating on a fixed 500ms tick, derived from everyone's live allocations. No attribution, ever. The room literally watches its own indecision move while it talks.

The manipulation loop is the point. Pushing a title's price up makes it *look* like consensus, which invites the bandwagon, which drives the vote. So you shill your LONG and starve your SHORT — but everyone in the room knows shills exist, so a bar that lurches suspiciously invites counter-pushing, and arguing too hard for a movie you'd never pick out loud gets you read. With one shared phone this collapses instantly: secret positions, simultaneous continuous input, and anonymity are all load-bearing.

At the halfway bell, each phone privately locks a one-tap **prediction** of the eventual winner. At close, each phone privately casts a binding vote. TV reveals: winner, all positions, all closing allocations. Payout: **+3** if your LONG wins, **+2** if your SHORT loses, **+1** for a correct halfway prediction. Then you actually watch the thing.

## Technical approach

Host tab + phone PWAs + a Cloudflare Durable Object (PartyKit) as sole authority. Model: `Room{code, phase, titles[5], tClose}`, `Player{id, long, short, alloc[5], prediction, vote}`, `Tape[{t, prices[5]}]`.

Phones send allocation updates throttled to 10Hz; the server holds the allocation matrix, never broadcasts it, and publishes prices as an EMA on a fixed 500ms tick.

The genuinely hard part is **de-anonymizing the tape**. With four players and a live chart, a single frantic dragger has a recognizable jitter signature — one bar twitching in sympathy with someone visibly thumbing their phone blows the anonymity that the whole bluff depends on. Mitigations: fixed publish cadence decoupled from input, EMA smoothing with a ~1.5s half-life, price quantization to 1%, and never publishing deltas or update counts. Tuning smoothing high enough to hide identity but low enough that the chart still feels alive is the real design work.

## v1 scope

- 4 players, 5 preset titles, one 3-minute market
- One LONG + one SHORT dealt per phone
- Live price bars, halfway prediction lock, binding final vote
- Single reveal screen with full position disclosure
- No accounts, no reconnect, no persistence

## Out of scope

Custom title entry, streaming-service metadata or artwork, multi-round bankrolls, chips or variable stake sizing, more than one short position, any post-watch settlement.

## Risks & unknowns

Sliders may prove too fiddly under argument — a five-way allocation while talking is real cognitive load. The bandwagon may not actually form in a group of four who all know the trick. Anonymity may fail socially rather than technically (people narrate their own dragging). And the binding vote must feel binding — if the room overrides it, the payout is theater.

## Done means

Four people in a room pick a movie in under five minutes; at reveal, at least one player is caught having loudly championed their secret LONG; no player can point at the price chart mid-market and correctly say who moved a bar; and the room presses play on the winner without renegotiating.
