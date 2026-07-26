## Overview
Dwell Time is a 4-player concurrent-room draft where the cards' contents are private but the act of *looking* is public. The host screen is a 12-slot grid of face-down lots; each phone can flip any slot face-up for itself alone, by holding a finger on it, spending from a small personal eye-time budget. The TV shows, live and attributed, who is looking where. It's for groups who love Magic drafting and hate waiting for the pack.

## Problem
Rochester draft — all cards face up, pick in snake order — is the most information-rich and most excruciating draft format ever made: full public information, and eleven minutes of watching someone else think. Meanwhile the actual pleasure of drafting (reading signals, hate-picking, bluffing interest) is smothered because in person you cannot separate *what you know* from *what you looked at*. Phones split those apart for free.

## How it works
**Look phase (30s, everyone at once).** Private on each phone: the same 12 numbered slots, face-down. Press-and-hold a slot → its card reveals *only on your screen* (a suit + a hidden 1–5 value) and your eye budget (20s) drains while you hold. Release to re-hide. Public on the TV: the grid, plus per-slot colored pips showing which players are holding that slot **right now**, and each player's remaining budget as a shrinking bar. Content private, attention public.

**Claim phase (10s).** Every phone privately taps one slot. Simultaneous reveal on the TV.
- Uncontested slot → you take the card.
- Contested → it goes to whoever accumulated **less** dwell time on that slot. Ties (both zero) → nobody gets it.

That one rule makes the whole game: staring buys certainty but forfeits priority, so the winning move is often to deduce a card from *other people's* staring, or to burn 4 seconds on a card you don't want purely to scare the table off it. Score = card value + 3 if it matches your private suit goal.

## Technical approach
PartyKit Durable Object per room; host tab and phone PWAs both on WebSocket. Room state: `slots[12] = {suit, value, dwellMs: {playerId: ms}}`, `players = {budgetMs, claim}`. **Card values never leave the server until earned** — `peek_start` returns that single card's payload and the server marks it burned for that player; a phone never holds the deck. Dwell is server-accounted: `peek_start`/`peek_end` with server receipt timestamps, and a heartbeat every 250ms while held so a dropped socket, `touchcancel`, or backgrounded tab closes the peek instead of draining budget forever. The TV gets a 10Hz aggregated `attention` frame (slot → player ids currently holding), never values. The hard part is that dwell milliseconds are *scoring input*, not decoration: latency asymmetry must not decide a tie, so the tiebreak quantizes dwell to 250ms buckets and falls back to "nobody gets it" inside a bucket.

## v1 scope
- 4 players, one pack of 12, one look phase, one claim, reveal, done (~90 seconds)
- One private suit goal per player, dealt at start
- Host screen: grid, live attention pips, budget bars, final reveal
- Room code join, no accounts, no persistence

## Out of scope
- Multiple packs, snake order, deck building, card art or abilities
- Spectators, reconnect-mid-round, more than 4 players

## Risks & unknowns
- Does public attribution of attention actually get read, or is 30 seconds too noisy to parse four players?
- The "less dwell wins" rule may push everyone to near-zero looking; may need a floor (must peek ≥1s to claim).
- Holding a finger while watching a TV across the room is a real ergonomic ask.

## Done means
Four phones join by code; each can peek only within budget; the TV shows correct live attribution; a contested slot is awarded to the lower server-recorded dwell; card values are provably absent from the WebSocket traffic of a player who never peeked that slot.
