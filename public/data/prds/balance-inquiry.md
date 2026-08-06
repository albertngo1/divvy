## Overview

A three-player sealed-bid auction for a living room with a TV and three phones, where the bookkeeping is inverted: your phone tracks the other players' wallets in perfect detail and refuses to tell you your own. You bid into a fog about yourself while everyone else bids with full knowledge of you. Six minutes, one round of three lots, for people who like poker but hate arithmetic.

## Problem

Auction games die on ledgers. Everyone hunches over a private pile of cash, the table stalls while people recount, and the only genuinely interesting information — how much money the person across from you can still bring — is exactly the thing the format hides. The tedium is in tracking; the fun is in reading. Phones can hold the ledger, so the design question becomes: whose ledger should each phone hold? Answer: not yours.

## How it works

Three players. The server privately deals each player a secret starting balance in the 40–90 range (all three different, so symmetry gives nothing away). Three lots go up one at a time; each lot has a public point value shown on the TV.

**Your phone shows privately:** the other two players' exact current balances, a running log of every bid they have ever made, and your own balance rendered as `———`. It also shows your own bid history, so you know what you have spent — you just don't know what you started with.

**The TV shows:** the current lot, the three players' names, past winners and hammer prices. No balances at all.

Each lot: all three players type a bid simultaneously and lock. If your bid exceeds your hidden balance you BUST — bid voided, you sit the lot out, and the TV announces "Albert bid over." That announcement is the gift: you now know your balance is under that number, and so does everyone else, forever. High bidder wins the lot's points and pays.

Once per game, any player may spend a TELL: privately push a number to one other player's phone claiming it is that player's true balance. It arrives as a toast reading "Priya says you have 63." It may be a lie. Nobody else learns a tell happened.

## Technical approach

PartyKit Durable Object per room. State: `{players: {id, name, secretStart, spent, bids[], busted[]}, lots[], phase}`. The server is authoritative and, critically, does per-socket view filtering: a `state:patch` message is serialized separately for each connection, with that player's `secretStart` and derived balance stripped and replaced with a null sentinel. Bids are held server-side until all three lock, then resolved and broadcast at once.

The hard part is not sync — traffic is tiny — it is leak-proofing. One careless broadcast, one shared debug channel, one client-side balance computation, and the whole game evaporates. Every derived value must be computed server-side per recipient; the client must never receive a field it isn't allowed to render. Bust checks happen only on the server.

## v1 scope

- Exactly 3 players, one round of 3 lots
- Random starting balances, random lot point values
- Sealed simultaneous bids with a 25-second timer; no bid = 0
- Bust announcement on the TV
- One TELL per player
- Final score screen revealing all three starting balances

## Out of scope

- 4+ players, multiple rounds, persistent scores
- Reconnect handling beyond a rejoin-by-code
- Any chat, emoji, or audio channel

## Risks & unknowns

Does not knowing your own balance feel like agency or like fog? Mitigation: your own spend history is always visible, so the unknown is one number, not a mess. Busting may feel punishing rather than informative — tune the penalty to "sit out this lot" only. Three lots may be too few for inference to pay off.

## Done means

Three phones join by room code, play three lots, and at least one player is heard saying some version of "wait, how much do I even have?" The final reveal screen shows all three starting balances and at least one player's bidding is visibly explained by it. No client ever receives its own `secretStart` over the wire — verified by reading the socket log.
