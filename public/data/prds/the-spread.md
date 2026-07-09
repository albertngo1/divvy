## Overview
The Spread turns a group video-watch into a hidden, live prediction market. Whatever you'd normally watch slack-jawed — a cooking clip, a trailer, a nature doc — becomes a 40-second window where 3–6 players privately wager chips on what happens next, against odds that move in real time as the (invisible) crowd piles in. It's for people who already yell 'ten bucks he drops it' at the screen, made into an actual pool.

## Problem
Watching something together is passive: you consume, you react, you forget. The instinct to bet on it is universal but has no substrate — no book, no stakes, no payout. And the moment you make betting a party game, everyone shouting their bets ruins it; the fun of a book is that your position is *secret* and the odds reflect a hidden crowd.

## How it works
The host screen plays the clip plus a slim **odds ticker** and a countdown on the currently-open market (e.g. 'Soufflé survives?' YES 1.8× / NO 2.1×). It never shows who bet what.

Each **phone privately** shows: your chip balance, the open market, two big stake buttons, and *your own* position — how many chips you've committed to YES/NO and your would-be payout at current odds. As the pari-mutuel pool fills, odds shift; you feel the line move but can't see others' bets, only infer them from drift. The betting window closes a beat before the on-screen resolution; the clip reveals the outcome; the pool pays winners proportionally. Simultaneity is the whole point — everyone jams chips into a 10-second window at once, reading each other's *faces* since they can't read each other's phones.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) owns the clock, the pool, and clip playback state. Data model: `Room { clipId, marketState, tick }`, `Market { id, openAt, closeAt, resolveAt, poolYes, poolNo, outcome }`, `Bet { playerId, side, chips, tick }`. Host is the playback authority and broadcasts `tick` every 250ms; phones render odds from `poolYes/poolNo` echoed on each tick. The genuinely hard part is *fair window closing under latency*: a bet's server-receipt tick, not client time, decides validity, and the ticker shows a 'settling' freeze so nobody sees a payout they can't get. Clip and markets are pre-authored JSON keyed to timestamps; no video analysis in v1.

## v1 scope
- One 40-second clip, hard-coded.
- Exactly one market with one resolution.
- 3 players, everyone starts at 100 chips, flat proportional payout.
- Host ticker + countdown; phones show balance, two buttons, own position.

## Out of scope
- Multiple sequential markets, parlays, live user-authored props.
- Streaming arbitrary user video; content library.
- Persistent bankroll across rounds; leaderboards.

## Risks & unknowns
- Pari-mutuel with 3 players may feel thin — odds barely move; might need seeded house chips.
- Latency fairness on the close is the make-or-break; a laggy phone that 'wins' then gets voided feels awful.
- Clip resolution must be unambiguous or the room argues the settle.

## Done means
Three phones join, watch the clip, place hidden bets during the window, see odds move live on the host ticker, and the pool pays winners correctly at resolution — with a late bet after `closeAt` server-rejected.
