## Overview
A sealed-bid, winner's-curse auction party game for 3–5 players. You're rival wildcatters bidding on the same oil tract, and every phone privately holds a *different noisy survey* of what's underground. It weaponizes the classic winner's curse into a table of groans.

## Problem
Sealed-bid auctions are elegant math but miserable in person: everyone scribbles a secret number on a scrap, someone collects and reads them aloud, and there's no clean way to hand each player a *different private clue* about the lot's true value without a hidden stack of cards per round. The one genuinely fun part — the reveal that the winner overpaid — arrives buried in admin.

## How it works
One tract per lot, with a true value (e.g. 500 barrels) hidden from everyone. Each phone **privately** shows ONE noisy survey reading of that tract — different per player (you see "core sample ~430"; someone else sees "seismic ~610") — scattered around the true value. The host TV shows the tract and a bid timer. Every phone simultaneously enters a sealed bid and locks it. When all are locked, the host reveals in sequence: all bids, the winner (highest), the price they pay (their own bid — first-price), then the TRUE value. Winner's profit = trueValue − bid; everyone else scores 0. The curse: to win you usually held the *most optimistic* survey, so you tend to overpay — and the reveal is the comedy. The private, *differing* signal per phone is load-bearing: the entire fun is that you only see your own noisy clue and must shade your bid down to survive. Phone shows: your survey number + bid entry. Host shows: the tract, who's locked in, and the big reveal — never your survey.

## Technical approach
Host + phone PWAs + authoritative WS (PartyKit / Durable Object). Model: `Room{code, players[], lot{trueValue, signals[perPlayer]}, phase}`, `Player{id, name, signal, bid, locked}`. Server generates `trueValue` and per-player `signal = trueValue + gaussian noise`, pushing each signal only to its owner. Bids are collected server-side and stay hidden until all are locked, then broadcast in the reveal. The hard part is NOT real-time (sealed bids are async) — it's signal generation that reliably produces the curse at small n: tune noise σ so the max-signal holder is genuinely enticed to overbid, and handle the degenerate "everyone lowballs" round. Sync itself is trivial: lock/unlock state plus one reveal broadcast.

## v1 scope
- 3 players, one tract, one round
- Fixed trueValue + 3 hand-picked signals guaranteeing a spread
- First-price rule (you pay your own bid)
- Scripted host reveal sequence

## Out of scope
- Multiple tracts, running bankroll, Vickrey/second-price variants
- Consortiums / partial shares, drilling costs
- A deck of tract types

## Risks & unknowns
- Does the curse land emotionally with 3 players and one round, or does it need several rounds to "teach"?
- Balancing noise so the answer isn't trivially "bid your signal × 0.7"
- Risk of feeling like a lecture instead of a laugh

## Done means
3 phones join, each shows a *different* private survey number for the same hidden tract, all submit sealed bids that stay hidden until locked, and the host reveals bids + true value + winner's profit — demonstrating at least one round where the highest bidder overpaid (the curse), with no survey number ever leaking to another player.
