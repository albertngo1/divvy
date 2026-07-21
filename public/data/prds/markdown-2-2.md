## Overview
Markdown is a 3–6 player concurrent-room party game built on a Dutch (descending-price) auction. A single price falls on the shared host screen while each phone privately knows only its *own* secret valuation of the current lot. It's for groups who like a hot-seat game of chicken with a numbers brain underneath.

## Problem
A Dutch auction is delicious game theory but miserable in person: someone has to drone "...ninety... eighty-five... eighty..." as an auctioneer while everyone tenses, and the whole point — that each buyer privately values the item differently — is impossible to track around a table without leaking. You either say your number out loud (ruined) or you don't (untrackable). Asymmetric private valuation *needs* a screen per person.

## How it works
The host shows one absurd lot ("a barely-used trombone," "3kg of artisanal gravel") and a big price counting DOWN from $100 toward $0 over ~20 seconds, server-driven. Each phone PRIVATELY shows three things: your secret valuation of THIS specific lot (the server assigned you $73; your neighbor may have gotten $91), a running "profit if you buy now" readout (valuation − current price), and one giant BUY button. The host screen shows ONLY the falling price and the lot — never anyone's valuation.

First phone to tap BUY wins the lot at the exact displayed price; the round ends instantly. Profit = your valuation − price paid. The agony: your valuation is $73 and the price is at $88 and falling — you want to wait until it dips under $73 to turn a profit, but a rival who secretly values it at $95 is thrilled to grab at $80, and then you get nothing. You are pricing *other people's hidden desire*, not the item. If the clock hits $0 with no buyer, the lot is trashed and nobody scores. Then the host flips over every valuation for the collective "OHHH."

## Technical approach
Host browser tab + phone PWA clients + an authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `room { players[], lot{id,name,startPrice}, valuations: Map<playerId,int> (private), clock{startTs,startPrice,slope}, winner }`. The server owns the countdown as a function of server time, `price = f(serverTime)`; clients interpolate locally from a synced start timestamp so all phones show the same number within ~100ms without a broadcast per tick. The genuinely hard part is **latency-fair first-tap adjudication**: the winner must be whoever's BUY the *server* receives first, and the price charged is `f(serverReceiptTime)`, not whatever the tapping client happened to be rendering. The server locks on the first received BUY atomically and rejects all others; losers get an instant "SOLD" so nobody keeps tapping into a decided round.

## v1 scope
- 3–4 players, ONE lot, one descending clock
- Server-assigned private valuations (a spread wide enough to be non-obvious)
- First BUY tap wins at server-side price; ties impossible (single first-receipt)
- Reveal screen showing all valuations + winner's profit

## Out of scope
- Multiple lots, budgets, cross-round strategy
- Item artwork, sound design
- Re-auctioning trashed lots

## Risks & unknowns
- Network latency can make first-tap feel stolen; needs visible server-time price and a snappy SOLD lock
- Price drift between phones if clocks aren't synced tightly
- Valuation-range tuning: too wide = obvious winner, too narrow = coin flip
- A reflex-fast player who always snaps early could dominate

## Done means
Three phones join; the clock descends in sync (±100ms across devices); the first BUY tap locks the win at the server's price-at-receipt; losing phones show SOLD immediately; the reveal shows every player's secret valuation and computes the winner's profit correctly.
