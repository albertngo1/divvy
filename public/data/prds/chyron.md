## Overview
Chyron turns the act of watching a short clip into a live, private pari-mutuel market. 3–6 friends watch a single ~30-second clip that ends on a binary reveal (does the soufflé rise? does the domino chain finish? does he stick the landing?). While it plays, each player privately drives a YES/NO conviction slider on their phone. The host TV shows the clip with a crawling odds ticker — a chyron — that moves as money shifts, but never reveals who is on which side.

## Problem
Watching a clip together is passive; the only interaction is shouting predictions no one tracks. Chyron makes the watching itself a competition: your read on the moment is money, your timing matters, and the crowd's swinging odds tempt you to follow or fade — all under the tension of a clip that only plays once.

## How it works
The host TV shows the clip plus a live odds bar (e.g. YES 63% / NO 37%) and a chyron crawl of recent swings ("YES lengthening…"). It never shows individual bets.

Each phone PRIVATELY shows: a large YES/NO conviction slider (allocate your 100 chips continuously), your live implied payout, and a lock button. You can drag your allocation at any instant while watching — pile into YES as the tell appears, bail if you spot a fake-out. At clip end, positions auto-lock. The server settles pari-mutuel: everyone on the winning side splits the whole pool proportional to their locked stake. The catch: the visible odds are the SUM of hidden private positions, so a swinging ticker is the only signal you get about what others saw — and it might be bait.

Reveal shows every player's position timeline overlaid on the clip's timeline: who called it early, who chased the crowd, who got faded.

## Technical approach
Host browser tab is the authoritative CLIP CLOCK, emitting playback-position heartbeats. Phone PWAs send `(phoneId, yesFraction, clientTime)` on every slider change; an authoritative WS server (PartyKit / Durable Object over Tailscale Serve) stamps them against the latest host heartbeat to get clip-relative time. Server recomputes the aggregate pool at ~4Hz and broadcasts odds to the host only.

Data model: `Room{clipId, state}`, `Bet{phoneId, timeline:[(t, yesFraction)]}`, `Pool` derived. Settlement at lock: pool = sum of all chips; winners' payout = ownStake/winningSideStake × pool.

Genuinely hard part: fair timing. Clip playback and bet timestamps must share one clock or a late bet on an already-visible outcome pays unfairly. Solution: host owns the clip clock; server rejects allocation changes stamped after host reports clip-ended; small commit delay (~300ms) blunts last-frame sniping.

## v1 scope
- 3 players, ONE hardcoded clip with a known binary outcome
- YES/NO slider, live aggregate ticker on host, private P&L on phone
- Final-lock pari-mutuel settlement + timeline reveal

## Out of scope
- Multiple rounds / clip library / uploads
- Multi-outcome or over/under markets
- Persistent bankroll across games, leaderboards

## Risks & unknowns
- Clip-clock skew making payouts feel unfair (mitigate with commit delay)
- One clip may resolve too obviously; need a genuinely suspenseful tell
- Slider-vs-tap ergonomics on small phones under time pressure

## Done means
3 phones join, one clip plays synced on the TV, all three privately swing their sliders during playback, the ticker moves live, positions lock at clip end, and the server pays out the correct pool split with a per-player timeline reveal.
