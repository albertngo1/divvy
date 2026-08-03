## Overview
A 3–5 player betting game played over a short video clip on the TV. Every phone is privately dealt one true-but-partial fact about the clip. The host screen runs a live peer-to-peer order book of prop bets. Crucially there is no house: a wager only exists if another player posts the opposite side. For groups who already watch things together and want the watching to have teeth.

## Problem
Watching something as a group is parallel solitude — five people, one screen, zero interaction. Second-screen "predict the show" apps make it worse: they're player-vs-house, so you tap a guess, a server settles it, and you still never speak to anyone. Nothing you know is worth anything to anyone else, so there's no reason to bluff, argue, or negotiate.

## How it works
The host screen plays a pre-loaded 8-minute clip with a strip of four open props beneath it ("someone says a number out loud before 4:00", "the red car appears again", "nobody leaves the room"). Beside it: the live order book — anonymous bids and offers, price 1–9, each share paying 10 points if the prop resolves true, 0 if false.

Each phone privately shows: your **Sliver** — one true fact drawn from an authored deck ("there are exactly two vehicles in this clip", "the woman in green never speaks", "nobody dies"), your open orders, your filled position, and your running P&L. Slivers are dealt so that some props are covered by two players, some by nobody. You never learn how many.

To profit you must be filled, and to be filled someone must disagree with you at your price. Offering to buy at 9 screams that you know; buying at 4 might catch someone whose Sliver points the other way. Table talk is legal and lying about your Sliver is the entire point — the tension is that using your edge is how you leak it.

When the clip ends the host settles each prop against a hand-authored answer key, animates the P&L swing, then reveals every Sliver so the room can see who actually knew and who was bluffing air.

## Technical approach
Host browser tab plus phone PWAs against one authoritative PartyKit room (Cloudflare Durable Object). Model: `Room{clipId, phase, playheadMs}`, `Player{id, sliverId, cash, positions[]}`, `Prop{id, text, expiryMs, resolution}`, `Order{propId, playerId, side, price, ts}`. All order state is server-side; the DO runs a tiny continuous double-auction matcher, appends fills to a monotonic event log, and broadcasts a redacted book (prices and sizes, never identities) to the host, plus a full private view to each owner.

The hard part is time, not matching: the video plays on the host, but order validity is tied to playhead position. The host emits a playhead heartbeat every 250ms; the DO stamps every order against server-estimated playhead and rejects late orders, so a phone on bad Wi-Fi can't buy a prop that already visibly resolved. Phones show a "book may be stale" tick when heartbeat lag exceeds 400ms.

## v1 scope
- 3 players, exactly one clip, one round, ~10 minutes total
- One hardcoded public-domain 8-minute clip, 4 hand-authored props, 6 hand-authored Slivers, hand-authored answer key
- Prices 1–9, fixed size of 1 share, market orders only against resting quotes
- Host screen: video, prop strip, order book, final P&L bars, Sliver reveal

## Out of scope
- Any clip but the one, user-uploaded video, automatic prop generation
- Order sizes, cancels-with-priority, shorting beyond one share, streaks, multi-round
- Accounts, rejoin-after-refresh, spectators

## Risks & unknowns
- Authoring cost: props must be non-obvious yet objectively settleable, and Slivers must be genuinely partial. This is a content problem, not a code problem.
- The double-coincidence-of-wants may simply not clear with 3 players — mitigation is a slow-drip dumb market maker that quotes a wide 3/7 spread.
- People may just watch the movie and forget to trade.

## Done means
Three phones in one room complete a clip; at least four fills occur between distinct players; every fill is attributable in the server event log; each phone's Sliver was never visible to any other client at any point (verified by capturing socket traffic); final P&L sums to zero across players; and at least one player, in playtest, deliberately posted a losing price to disguise their Sliver.
