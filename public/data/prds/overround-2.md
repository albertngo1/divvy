## Overview
A 3–5 player betting party game built around a short suspense clip (a Jenga tower mid-wobble, a coin-flip in the air, a soufflé in the oven). One player is secretly the BOOKIE and privately sets the live payout odds; everyone else is a bettor staking chips against the house. It's for groups who've watched enough sports betting to enjoy *being* the shady book for once.

## Problem
Groups passively watch tense moments and shout guesses that evaporate. Betting apps make you bet against a faceless algorithm. Nobody gets to feel the delicious tension of running the book — quietly nudging the line to bait the room while sweating whether you've priced it right.

## How it works
Host TV plays a ~15s clip that pauses at a cliffhanger with an unresolved binary (tower stands / falls). A hidden-role assignment makes exactly one phone the BOOKIE for the round.
- **Bettor phones (private):** show the current odds (e.g. STANDS pays 1.4×, FALLS pays 2.6×), a chip stack, and two stake buttons. They pick a side and lock a wager *at the currently displayed price*, blind to what others staked.
- **Bookie phone (private):** a live slider for each side's odds plus an *aggregate* money-flow meter (total staked on STANDS vs FALLS) — never who bet or how much individually. The bookie shades the line to balance the book, hunting a profitable overround.
- **Host TV (shared):** the paused clip, a countdown to "betting closed," and the current odds — but not the bookie's identity.
When betting closes the clip resolves. Winning bettors get stake × locked odds from the house; the bookie's P&L is the net. After payout, bettors get one guess at *who the bookie was* for a bonus.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object) over Tailscale Serve. Data model: `Room{clipId, phase, bookieId}`, `Player{id, chips, role}`, `Odds{stands, falls, version}`, `Bet{playerId, side, stake, lockedOddsVersion}`. Sync: server is the single source of truth for odds; bookie slider changes debounce-broadcast a new `Odds.version`; a bettor's lock captures the `version` the server last acked, so the price they get is unambiguous. The genuinely hard part is **fair price-locking under latency** — a bet must settle at the odds the bettor actually saw, not a value the bookie changed 200ms earlier. Solve with optimistic version-stamping plus a server-side ~150ms "the line just moved" reject window that bounces stale locks back for reconfirmation. Resolution is a pre-tagged boolean per clip; no ML.

## v1 scope
- 3 players, one round, one hardcoded clip with a known outcome.
- One binary market, integer odds slider, fixed 10-chip stacks.
- Hidden bookie role, blind simultaneous bets, aggregate-only flow meter.
- Payout + single "who was the bookie" guess.

## Out of scope
- Multiple rounds / rotating bookie, chip persistence, leaderboards.
- Continuous cash-out, parlays, in-play line moves after betting closes.
- Auto-detecting clip outcomes; live/user-uploaded clips.

## Risks & unknowns
- Bookie may have too little to do in 15s — the slider needs to *feel* consequential.
- Aggregate meter could leak the bookie's identity if flow is lopsided.
- Balancing house edge so the bookie can lose (else no tension).

## Done means
Three phones join, one is secretly bookie, bettors lock wagers at displayed odds, the clip resolves, chips move correctly per locked odds (verified against a hand calc), and the bookie-guess bonus resolves — all in one round under 90 seconds.
