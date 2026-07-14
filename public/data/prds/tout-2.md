## Overview
Tout is a 3–6 player party betting game built around a shared slow reveal on the TV and a private tipster hand on every phone. The room passively watches a photo un-blur, a mystery item zoom out, or an outcome creep toward resolution — but instead of shouting guesses, each player is a shady tipster sitting on partial inside information, quietly moving chips into a shared pool.

## Problem
Watching "guess the X" content — price reveals, mystery-object zooms, will-it-collapse clips — is pure passive consumption. One loud person calls it and everyone else nods. There's no stake, no bluff, no reason to keep your read to yourself. The itch: make private knowledge a tradeable edge and force the room into a real market.

## How it works
The host plays a ~60s reveal resolving to a bucketed answer (a price band, a category, a yes/no). Each phone PRIVATELY receives one true-but-partial clue drawn from the real answer — "it has four legs," "under $500," "the chef used gelatin." Every player's clue differs, so nobody has the full picture.

A parimutuel pool sits on the host screen: outcome buckets with live odds that shift as chips land. Each phone privately shows: your clue, your chip stack, and current odds. You place chips on buckets at any time during the reveal. Betting early locks worse-known odds at higher payout; betting late is safer but cheaper. You can bet in multiple tranches. The host shows only the reveal, the odds board, and total pool — never any clue and never who bet what. When the reveal resolves, the winning bucket pays out parimutuel-style. The core tension: your clue gives you an edge, but a big early bet visibly shifts the odds and leaks your read to opponents.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Round{revealId, answerBucket, clueDeck, pool: Map<bucket, chips>, bets: [{playerId, bucket, chips, tOffset}]}`; each `Player{clue, stack}`. The server is the only holder of the true answer and of each private clue — clients receive strictly their own clue. Sync: bets are server-validated, then the recomputed pool/odds are broadcast to all (host + phones) at ~5Hz. The genuinely hard part is odds legibility and anti-leak: odds must update fast enough to feel like a market, yet the broadcast must never expose per-player positions, and floating parimutuel math must stay stable as tiny bets land.

## v1 scope
- 3 players, one reveal, one number-line bucket set (Price-Is-Right style)
- Fixed hand-authored clue deck for that one reveal
- Flat chip stacks, single parimutuel payout, no persistence

## Out of scope
- Multiple rounds, running leaderboards, custom media upload, real money

## Risks & unknowns
- Authoring clues that are partial-yet-fair is labor-intensive
- Parimutuel odds may be confusing on a small screen
- Sourcing good reveal media

## Done means
Three phones each receive a distinct private clue, place chips live during one reveal, the host odds board shifts as bets land without leaking positions, and payout resolves correctly against the true bucket.
