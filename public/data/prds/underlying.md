## Overview

A 6-minute betting layer for a group already sitting in front of a clip. The host screen plays a short video with a live price line ticking beside it. That price is a hidden index computed from the video itself — and no one is told the formula. Each phone privately holds one fragment of the definition. You take a long or short position, you watch the show harder than you have ever watched anything, and you get paid for being right about a thing you had to reverse-engineer.

For 3–5 people who like poker more than trivia.

## Problem

Watch-along games are quiz shows with a video attached: the question is asked out loud, everyone answers, the person who knows wins. There's no market, no private edge, no reason to hide anything. Meanwhile the actual pleasure of betting — holding information other people don't have and deciding how loudly to act on it — never makes it into the living room.

## How it works

The host screen shows: the clip, a price line updating twice a second, and one aggregate bar — the room's net exposure (net long / net short, no names, no sizes). That bar is the only public information about anyone's read.

Each phone shows privately: one clue shard, unique to that player ("the index counts something visible," "it falls whenever the camera goes outdoors," "it never exceeds 90," "one person on screen is worth double"), plus a LONG/FLAT/SHORT toggle with three size steps. You may flip position any time; there is no matching engine, only exposure marked to the tick, so latency can't be gamed.

The squeeze: the net-exposure bar leaks. If you swing hard long the instant the kitchen scene starts, the room learns your shard. Trading your edge broadcasts your edge.

At the end: positions mark to the final price, then every phone privately picks the true index from five candidate definitions for a bonus. Reveal on the TV.

## Technical approach

PartyKit Durable Object per room, authoritative. Clip time is server-owned; the host tab reports `timeupdate` drift and the server corrects. Data model: `Room {clipId, tick, priceCurve[], phase}`, `Player {id, shardId, position: {side, size}, positionLog[]}`. The price curve is a precomputed array of one value per clip-second, hand-annotated, interpolated at 2 Hz.

Hard part: phones must render the same tick the TV renders, or an obvious on-screen event appears to move the price *before* it happens on someone's handset. Fix: server broadcasts `(serverTick, clipMs)`; phones interpolate locally against a measured clock offset and never trust their own video. P&L is computed server-side from the position log, so a laggy flip is priced at its server-received timestamp.

## v1 scope

- One 90-second clip, one hand-written index curve
- Four clue shards, 3–5 players, one round
- LONG/FLAT/SHORT × 3 sizes; no chips carried between rounds
- Net-exposure bar on TV; nothing else public
- Five-option index guess at settlement

## Out of scope

Auto-generated indices from video ML. Live TV. Order books, limit orders, or player-to-player trades. Multi-round bankroll. Spectator mode.

## Risks & unknowns

The index may be unguessable, which turns the round into coin-flipping — needs playtesting to find the difficulty band where two of five players crack it. Shards may be unequal in value. Cerebral games die when one player checks out.

## Done means

Four phones and a TV: all five surfaces show prices within 300 ms of each other for a full 90-second clip, every position flip lands in the server log at the right clip-second, and at reveal the hand-computed P&L for one player matches the screen exactly.
