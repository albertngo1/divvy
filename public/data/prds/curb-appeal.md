## Overview

A 6-minute betting game for 3–5 people built on the most universal passive group activity there is: scrolling a real-estate listing and yelling guesses at the price. Host screen (TV) shows one real listing — address, beds/baths, square footage, and eight photo slots, all blurred, price hidden. Each phone is a private terminal holding a chip stack, a set of photos only that player has paid to see, and one sealed price guess.

## Problem

Group Zillow-scrolling is already a game, but a degenerate one: everyone sees identical information, shouts a number, and the reveal is a shrug. There's no asymmetry, no cost, no read on anyone else. The itch: make information *scarce and purchased*, so the interesting object stops being the house and becomes the other players' spending.

## How it works

1. **Deal.** Host shows the listing shell. Every player gets 20 chips. The TV shows the eight photo slots labeled by room type only (KITCHEN, BATH 2, EXTERIOR REAR, …), all blurred.
2. **Info market (75s).** On your phone, each slot has a price that rises each time *anyone* buys it (3 → 5 → 8 chips). Buying un-blurs that photo **on your phone only, full-screen**. The TV never shows the photo — it shows a live grid of *how many players own each slot*, with no names. So the room sees "three people bought BASEMENT and nobody touched KITCHEN" and has to decide what that means.
3. **Sealed guess.** Everyone privately enters a dollar guess. Locks simultaneously.
4. **Settle.** TV un-blurs everything, reveals the true sold price, then scores: closest guess wins the pot, **minus every chip they spent on photos**. Second-closest breaks even. Everyone else loses their spend. A player who bought nothing and guessed well beats a player who bought everything and guessed well.

That subtraction is the whole game: information is real but overpriced, and buying it publicly (in count, not identity) leaks your read to people who bought nothing.

## Technical approach

Host browser tab + phone PWAs + one authoritative PartyKit/Durable Object room. State: `{roomCode, listing: {id, meta, photoUrls[8], truePrice}, players: {id, name, chips, owned:Set<slot>, guess|null}, slotBuyCount[8], phase}`. Server never ships `truePrice` or a `photoUrl` until the owning player has paid — purchases are server-validated, and photo bytes are fetched through a signed per-player URL, so a curious guest can't devtools their way to the un-blurred image. Broadcasts are `slotBuyCount` deltas only (~200 bytes), so the shared screen updates instantly without leaking identity.

The genuinely hard part isn't sync — it's the anonymity boundary under low latency. With 3 players, a buy-count tick that lands 300ms after someone's thumb visibly moves de-anonymizes it. Fix: batch count updates into fixed 2-second ticks, so buys are always disclosed in blocks.

## v1 scope

- 3 players, one hand-curated listing, one round.
- Four photo slots, not eight. Fixed prices (no escalation ladder).
- Photos + true price stored as static local assets. No Zillow API.
- One guess field, one winner, integer scoring.
- No accounts, no rematch, no sound.

## Out of scope

Live listing ingestion, multi-round tournaments, regional difficulty tuning, non-US properties, chat, spectators, mobile host.

## Risks & unknowns

- Does the buy-count board actually read as a tell with only 3 players, or is it noise? Core playtest question.
- Listing sourcing at scale is a legal/ToS problem; v1 dodges it with hand-curated assets.
- Price-guessing skill may be too flat — everyone within 10%. Mitigate by curating listings with one deceptive photo.

## Done means

Three phones join a room code, each buys a different subset of four photos, the TV shows only anonymized counts, all three sealed guesses lock, and the host reveals a scoreboard where spend is correctly subtracted — with at least one playtest where a player says out loud "why did two of you buy the basement?"
