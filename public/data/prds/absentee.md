## Overview
Absentee is a sealed-then-simulated auction party game for 3-4 players. The host TV is the auction house; each phone is an absentee bidder who leaves standing proxy maxes and never shouts. It turns the loudest, most tell-laden tabletop mechanic — the live auction — into a quiet commit followed by a delicious automated bid-war replay.

## Problem
In-person auctions (Modern Art, Ra, any Monopoly house rule) are slow, dominated by the loudest table-hog, and leak everything through faces and hesitation. Everyone waits while two people chant numbers, and tracking who can still afford what is bookkeeping nobody enjoys.

## How it works
The host shows three silly lots in a row ("A Slightly Haunted Toaster", "Someone's Baby Photos"). Each phone privately holds three things nobody else sees: a fixed budget, a secret per-lot valuation card (each player values the same lot differently), and the max-bid sliders it is filling in. Simultaneously and blind, every player sets a proxy max on each lot — your total commitments can exceed budget on paper, but you can only actually PAY up to budget, so overcommitting one lot can starve another. Everyone locks in.

The server then runs each lot as an ascending English auction driven purely by the secret maxes: the highest max wins, paying the second-highest max plus one increment (Vickrey-style). The TV animates the climb anonymously — "Paddle 3 → Paddle 1 → Paddle 3… going once…" — as if bidders were in the room. Phone shows your maxes, live remaining budget, and your private valuations; TV shows lots, the climbing bid, winners, and prices paid. Score = sum of your private value of lots won − prices paid. Then valuations are revealed.

Load-bearing: three simultaneous secret max vectors plus asymmetric private valuations cannot exist on one passed phone — sequential reveal destroys the whole point.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, players[], lots[], phase}; Player{id, budget, valuations{lotId:val}, proxyMax{lotId:val}, submitted}; Lot{id, name}. Sync: phones POST their proxyMax vector; when all submitted, the server deterministically simulates each lot (sort maxes, second-price) and streams timed "bid tick" events so the TV can play the war dramatically. The genuinely hard part is the cross-lot budget constraint: a player can win multiple lots whose combined second-prices exceed budget. v1 uses a deterministic, player-visible rule — resolve lots left-to-right, and if a provisional winner can't afford a new win on top of prior wins, they're dropped to the next-affordable bidder. This rule must be legible before commit or players feel cheated.

## v1 scope
- 3 players, exactly 3 fixed lots, one game
- Random private valuations, fixed equal budget
- Second-price resolution + left-to-right budget rule
- Anonymized ascending bid-war animation on TV
- Final score + valuation reveal

## Out of scope
- Multiple rounds, reserve prices, custom lots, chat, accounts, polished mobile animation.

## Risks & unknowns
- Second-price + cross-lot budget rule may feel opaque to casual players; needs a one-line explainer and honest reveal.
- Pre-commit means little live interaction; all tension must land in the TV playback.
- Random valuations could feel arbitrary — may need light hand-tuning.

## Done means
Three phones join by code, each secretly sets maxes on three lots, the server resolves winners/second-prices with the budget cap enforced deterministically, the TV plays anonymized ascending bid wars, final scores display, and no phone ever sees another player's max before reveal.
