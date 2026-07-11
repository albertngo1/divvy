## Overview
Bandwagon is a second-screen party game for 3-6 friends watching a competition or reality show (cooking show, talent contest, drag race). While the episode plays on the TV, each player runs a private stock portfolio on the contestants. It's for the group that already yells at the screen — now the yelling has money behind it.

## Problem
Watching a show together is passive: everyone roots for the obvious fan-favorite, there's no stake, and the loudest opinion wins by default. The itch is to make the room's opinions collide with real consequences — and to reward the one contrarian who secretly bet against the crowd's darling and turned out right.

## How it works
The host TV shows a live ticker: each contestant is a "stock" with a moving price. Each phone PRIVATELY shows your cash, your holdings (long or short on each contestant), and buy/short buttons. As the episode plays, tagged events fire (a judge's praise, a flopped dish, a meltdown) and the host bumps prices; players scramble to trade in real time on their own phones — buy who's rising, short who you think will crash. Positions are strictly private: the TV shows only prices and a vague "market heat" pulse when lots of hidden trading happens, never who holds what. So you can loudly root for the underdog while secretly shorting them. At episode's end, positions settle at final prices and the TV reveals every portfolio — the delicious payoff being who was quietly betting against the room. Highest net worth wins.

Private per phone: cash, positions, pending trades. Shared TV: prices, ticker, market-heat pulse, and the final reveal.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object) over Tailscale Serve. One room = one Durable Object holding contestants[] {id,name,price}, players[] {id,cash,positions:{contestantId:qty}}, an event timeline [{t,contestantId,delta}], and a clock. In v1 the clip is pre-tagged with event timestamps; host playback drives a synced clock the DO broadcasts. Trades are commands the DO validates (sufficient cash, atomic price at receipt time) and acknowledges ONLY to the sender — never broadcast. The genuinely hard part is real-time fairness: many simultaneous trades against a moving price. The DO serializes orders, stamps each at the current server price to prevent lookahead, and keeps round-trip latency under ~300ms so a fast tap on a rising stock feels fair.

## v1 scope
- 3 players, one round
- One 2-minute pre-tagged clip, 4 contestants
- Buy or short 1 share at a time, fixed size, starting cash $100
- Prices move on scripted events only
- Final reveal + winner

## Out of scope
- Live host-tagged events or arbitrary live shows
- Partial shares, leverage, options
- Crowd-driven price discovery (real market microstructure)
- Accounts, history, multiple rounds

## Risks & unknowns
- Does a 2-minute clip pack enough events to feel market-like? May need denser tagging.
- Trading on the phone while watching the TV splits attention — the UI must be glanceable.
- Manually tagging clips is real labor; the content pipeline is unproven.

## Done means
3 phones on one Wi-Fi, a 2-minute clip plays, all three trade privately during it, prices move on tagged events, and at the end the TV reveals three portfolios with a correctly computed winner — and at least one player laughs at a revealed secret short.
