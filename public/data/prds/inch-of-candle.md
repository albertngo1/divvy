## Overview
Inch of Candle is a 3-5 player auction for a single lot, run the way ships' cargo was actually sold in the 1600s: bidding continues until a candle gutters, at a moment nobody can predict. The host TV is the auction house floor; every phone is a private bidder's booth holding money, a valuation, and a secret about the flame.

## Problem
Auctions are the best mechanic in tabletop games and the worst experience at a physical table. Turn-order bidding is slow, the agonizer stalls everyone, and "wait, what's the current bid?" is asked six times per lot. Timed auctions fix the stalling but require a visible timer, and a visible deadline turns the whole game into sniping in the last two seconds. Worse, at a table your money is in front of you in coins — the information asymmetry that makes auctions delicious is physically impossible to maintain.

## How it works
One lot: "a crate of unlabelled records." Each phone privately shows four things nobody else sees: a budget (100), a **private valuation** of the lot (different per player, 40-95 — you're bidding on the same crate but it's worth different amounts to each of you), your current bid, and a **candle hint** — one true but partial constraint on the hidden gutter time, drawn from a set: "it will not gutter before 0:18", "it will gutter before 0:41", "it will gutter on an even second", "it will gutter after the third distinct bidder." Pooled, the hints nearly pin the moment down. Alone, each is loose. Talking is allowed and lying is the whole point.

Bidding is a **hold**: press and hold BID and your number climbs ~4/second; release to lock it in. Bids only ratchet up. The TV shows the current top bid as an anonymous number, how many people have ever bid, and a decorative candle that burns at a fixed, deliberately meaningless rate — the joke lands when it guts at 0:22 with two-thirds of wax left. When the candle guts, all input freezes; the standing top bid wins and pays. Score = your private valuation minus what you paid. The reveal screen exposes everyone's valuation and hint, so the room can audit who lied about the flame.

Private per phone: valuation, hint, budget, own bid, haptic pulse when overtaken. Public on TV: top bid amount only, bidder count, the lying candle.

## Technical approach
PartyKit / Cloudflare Durable Object room, 4-letter code; host tab joins as `display`, phones as PWA clients over WSS. Room state: `{lotId, gutterAtMs (server-only, never serialized to clients), players: {id, budget, valuation, hint, bid, holding}, top: {amount, playerId}}`. Phones emit `hold_start` / `hold_end`; the server ignores client timestamps entirely and integrates bid growth on its own 10Hz tick, broadcasting only derived public state (top amount, bidder count) to everyone and a per-connection private frame to each phone.

The genuinely hard part is fairness at the gutter instant: a `hold_start` in flight when the candle dies. The design defuses it rather than solving it — because the deadline is *hidden*, nobody can aim for it, so a 200ms RTT costs at most ~0.8 bid units of climb, well inside the noise. The server hard-rejects any input received after `gutterAtMs` and settles from its own tick history, so all five screens print the same final number.

## v1 scope
- 3-4 players, one lot, one round, 20-50 seconds of play
- Hardcoded lot; valuations drawn from a small fixed table
- Four hint templates, dealt distinct
- Hold-to-bid, ratchet-only, no minimum increment, no proxy bids
- Reveal screen: winner, price, everyone's valuation and hint side by side
- 4-letter room code, no accounts, no persistence

## Out of scope
Multiple lots, a budget carried across lots, all-pay variants, auto-bid/proxy, sound and voice, spectators, reconnect, animation polish.

## Risks & unknowns
- Dominant strategy risk: "hold until you hit your valuation, release." Mitigated because winning requires being *on top when it dies*, not having the highest ceiling — with an unknown deadline you must re-ratchet at unpredictable moments.
- Watching a number climb may feel flat versus shouting; mitigate with an overtaken-haptic and a rising audio hum.
- Honest players could just pool hints truthfully. That's fine — the liar wins, and the reveal makes it a story.

## Done means
Four phones join by code and each shows a *different* valuation and a *different* hint. Players hold to bid; at a hidden time drawn from [20s, 50s] every device freezes input within 100ms, and the TV plus all four phones display an identical winner and price. The reveal screen lists all four private valuations and hints.
