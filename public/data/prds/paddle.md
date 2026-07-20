## Overview
Parddle is a 3-6 player concurrent-room party game that turns the live ascending ('English') auction — the going-once-going-twice format that's tedious and tell-heavy in person — into a silent, thumb-on-glass staring contest. One shared lot appears on the host TV; each phone privately knows what that lot is worth to *you* and how much cash you're sitting on. The fun is nerve under a rising clock nobody can read off your face.

## Problem
Live ascending auctions are great tension and terrible logistics: someone has to call numbers, everyone tracks who's still in, and your face and hesitation leak everything. And the interesting part — that the same lot is worth different amounts to different people — is invisible around a table. Private phones fix both: no bookkeeping, no tells, and genuinely asymmetric hidden valuations.

## How it works
The host TV shows the LOT (e.g. 'a haunted grandfather clock') and one number: the CURRENT PRICE, ticking upward ~+1 every 400ms. It also shows a row of colored paddles — one per player — that are RAISED while a player is still in.

Each phone privately shows three things nobody else sees: (1) your secret VALUE for this lot (say $58), (2) your remaining BUDGET (say $70), and (3) a big HOLD button. You hold to stay in the auction. Release — even for a moment — and you're out permanently, your paddle drops on the TV, and everyone sees the *timing* of your fold but never your value or budget. When only one paddle remains, the clock stops; the last holder pays the current price and scores VALUE − PRICE. Overpay past your value out of spite and you can go negative.

The tension: your phone quietly warns as price approaches your value and again as it approaches your budget. You want to release the instant before your last rival does — but you can't see their thresholds, only that a paddle just dropped.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{lotId, price, tickMs, phase}; Player{id, color, secretValue, budget, holding:bool, foldedAtPrice}. The SERVER owns the clock and increments price on a fixed interval; clients never compute price. Each phone streams a heartbeat `holding=true` every ~200ms; a missed heartbeat window OR an explicit release marks the player folded (server timestamps it, ordering ties by receive time). The genuinely hard part is fold-race fairness: two players releasing within one tick must resolve deterministically — the server freezes price the instant the second-to-last fold lands and awards to whoever was still holding at that server tick, ignoring client-clock skew. Secret values/budgets are dealt only to their owner over the private socket and never broadcast until the reveal frame.

## v1 scope
- 3 players, ONE lot, ONE round.
- Fixed hand-authored values/budgets per seat (no generation).
- Hold-to-stay with heartbeat; server-owned rising clock.
- TV reveal: winner, price paid, everyone's hidden value.

## Out of scope
- Multiple lots / a full auction house.
- Earning money between rounds; running score.
- Proxy/auto-bid, sniping protection, reconnection grace.

## Risks & unknowns
- Heartbeat jitter on flaky phone wifi could false-fold someone; needs a ~1-tick grace window without letting it become an exploit.
- Is silent holding tense or boring? May need audio sting + haptic as price crosses your private value.
- Degenerate play if everyone's value is public-ish after one reveal; mitigate by re-dealing.

## Done means
Three phones join, the TV price climbs, two players visibly fold at different prices, the last holder is charged the exact stopping price, and the reveal shows each player's previously-hidden value with the correct VALUE−PRICE payout — with no player ever having seen another's value or budget mid-round.
