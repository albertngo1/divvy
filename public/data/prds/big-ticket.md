## Overview
Big Ticket is a blind parimutuel betting game for 3-6 friends. The "board" is a restaurant menu on the shared TV — the thing a group normally reads in bored silence while everyone privately judges the prices. Big Ticket turns that silent judging into a secret wagering market.

## Problem
Reading a long menu is pure passive consumption: six dishes, everyone forms a private hunch about what's overpriced, nobody says it out loud, and the moment evaporates. There's a real game buried in that shared page — sommelier bravado, contrarian instincts, the smug "I *knew* the risotto was $30" — but no structure to cash it in.

## How it works
The host screen shows one menu page: six dishes with names and florid descriptions, prices masked as `$??`. Each phone gets 12 chips and a private allocation UI — sliders across the six dishes — betting on which single dish is **most expensive**. Crucially, each phone is also dealt ONE private insider tip: the true price of one random dish, visible only to that player. So everyone is trading on asymmetric private information.

Bets are hidden and simultaneous. The host shows only a `3/5 locked` counter — never amounts, never who bet where. On lock, the host reveals all prices in a dramatic ladder animation; the priciest dish is the winner. Payout is parimutuel: the whole chip pool divided among chips sitting on the winning dish — so a lonely-but-correct bettor cleans up, and following the crowd onto the obvious dish barely pays. Highest chip stack after the round wins.

Per-phone is load-bearing: portfolios must be secret (visible bets = anchoring, no market), the insider tips are genuinely asymmetric per player, and the lock is simultaneous. One passed phone destroys all three.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{menu:[{id,name,desc,price}], phase}`, `Player{id, chips, bets:{dishId:chips}, tip:{dishId,price}}`. Prices live server-side and are never sent to clients until lock; each player's `tip` is sent only to that player. Phones emit bet deltas; server echoes only an aggregate lock-count to the host. On lock the server computes parimutuel payouts and broadcasts the reveal. Nothing is twitchy — the hard part is a menu corpus with surprising, defensible price spreads and airtight tip isolation (a leaked price or tip collapses the market).

## v1 scope
- 3 players, one hardcoded menu page of 6 dishes
- 12 chips each, private allocation across dishes
- one private insider tip per player
- single betting round, parimutuel payout, reveal animation

## Out of scope
- multi-round tab economy, over/under lines, real menu scraping, custom menus, chat

## Risks & unknowns
Is it more than "guess the price"? The parimutuel contrarian payout plus asymmetric tips must carry it. Tips that name the actual winner trivialize the round — bias tip generation toward mid-priced dishes. Menu needs genuinely counterintuitive prices.

## Done means
Three phones each privately allocate 12 chips and see a private tip nobody else sees; host reveals prices; payouts compute correctly; a contrarian-correct player ends with the biggest stack.
