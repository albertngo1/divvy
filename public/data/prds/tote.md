## Overview
Tote is a concurrent-room party game for 3–6 friends who like to yell predictions at a screen. It takes the most passive thing a group does together — watching a clip — and turns it into a live parimutuel gambling floor, one betting window per phone.

## Problem
Watching a video together is a solved, dead activity: someone narrates, everyone half-watches their own phone. There's already latent betting energy in a room ('no way he does it' / 'ten bucks says she cries'), but it evaporates because there's no book, no stakes, and no way to make everyone's guess simultaneous and honest. Tote is the missing bookmaker.

## How it works
The host TV plays a curated ~2-minute clip authored with 3 hidden **markets** — binary questions with a fixed resolution timestamp ('Does the contestant swap doors?' YES/NO). As a market opens, the clip pauses. The host screen shows the clip frame, a live odds ticker, and everyone's bankrolls — but never who bet what.

Each phone PRIVATELY shows: your chip bankroll (start 100), the two outcomes with current implied odds, a stake slider, and a LOCK button. You bet against a 15-second closing clock. It's parimutuel: all money on YES and NO forms one pool; winners split the losing side proportional to stake. The published odds are just the current pool split, so every hidden bet you place *moves the line* — the whole game is reading the room's drift and deciding to pile on or fade before the book closes.

The per-phone secrecy is load-bearing: if one phone were passed around, there'd be no simultaneous hidden book and no line movement — Tote would just be a poll. Private, concurrent wagers ARE the fun.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object) holds one room object: `{ players[], bankrolls{}, clipTime, currentMarket, pool{yes,no}, phase }`. Each bet is `{ playerId, marketId, side, stake, lockedAt }`, applied server-side only. On every accepted bet the server rebroadcasts the *aggregate* pool and derived odds — never per-player stakes. The host tab is a dumb renderer subscribed to the same room; it drives clip playback and emits `openMarket`/`closeBook` events on timestamp. Hard part: closing the book atomically at the pause point so no phone with clock skew sneaks a late bet in, and deterministic parimutuel payout with integer-chip rounding (leftover chips go to the house / earliest locker). Odds broadcasts must be throttled/coalesced so 6 phones betting at once don't thrash the TV ticker.

## v1 scope
- One pre-loaded clip, exactly 3 markets
- 3–6 players, single bankroll, no side bets, no parlays
- Flat parimutuel payout, one round, then final standings
- Host tab + phone PWA, join by room code

## Out of scope
- Uploading your own clips / market authoring UI
- Live streams, sports, real video detection
- Continuous odds bets, prop bets, leverage, multi-round tournaments

## Risks & unknowns
- Content-authoring is heavy: a boring clip kills it — the clip must have genuinely uncertain, resolvable beats.
- Parimutuel can feel swingy with only 6 bettors; may need a small house seed to stabilize early odds.
- Clock-sync at book close is the real engineering risk.

## Done means
Three phones join a room, watch the clip, place hidden bets on all 3 markets, the TV odds visibly move as bets lock, books close cleanly at each pause, and final bankrolls resolve correctly with the parimutuel math checking out to the chip.
