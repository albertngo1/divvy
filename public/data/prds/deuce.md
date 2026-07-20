## Overview
Deuce turns the most passively-consumed object in any group outing — a restaurant menu — into a rigged little appetite market. 3–6 friends stare at the same menu on the host screen and privately bet on which dish the *table* will collectively want, then secretly cast the one order that helps resolve the very market they wagered on. It's a Keynesian beauty contest disguised as deciding where the group's stomach lands.

## Problem
Reading a menu together is dead air: everyone silently scans, someone mutters "ooh, the short rib," and the table herds. All the interesting information — who *actually* wants what, who's bluffing hungry — stays invisible until the waiter arrives. Deuce mines that hidden appetite and pays out on it.

## How it works
The host screen shows a fixed menu of 6 dishes (name + one-line description, no prices). Two sealed phases:

**Phase 1 — Book it.** Each phone PRIVATELY allocates 5 chips across the 6 dishes, predicting which dish the table will most order. The host screen shows only a pot animation and a "3 of 3 locked" counter — never anyone's spread.

**Phase 2 — Fire.** Each phone PRIVATELY picks the ONE dish they'd personally order tonight. Sealed and simultaneous.

**Resolve.** Orders are tallied; the dish with the most orders is the House Special. Pari-mutuel: every chip bet on that dish splits the whole pot proportionally; everything else burns. The reflexive twist is the fun — your own order counts toward resolving the market you bet on, so you can bet heavy on a dark-horse dish and then order it yourself to pump it, gambling that nobody else read the room the same way. With a small table one order is a huge lever, and because everything is hidden until reveal you never know if your pump lands.

The host reveal shows the order tally and each player's payout, but keeps individual bet spreads secret, so the post-round table-talk ("who bet the whole stack on the fish?!") is all bluff and inference.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `room{menu[6], players[], phase, pot}`, per-player `bets{dishId:chips}` and `order:dishId`, both server-held and never broadcast until resolve. Sync strategy: server is the single source of truth; phones submit sealed payloads, server acks with only an anonymized locked-count. On both-phases-locked the server computes the tally + pari-mutuel payout and pushes one reveal event. The genuinely hard part isn't latency — it's **airtight secrecy**: no bet or order can leak through the socket before resolve, so the server must withhold all per-player state and only emit aggregate counters mid-round.

## v1 scope
- 3 players, one menu, one round.
- 6 hardcoded dishes, 5 chips each.
- Two sealed phases, pari-mutuel payout, single reveal screen.
- Chip totals shown; no persistence across rounds.

## Out of scope
- Multiple menus / menu upload / real restaurant data.
- Prices, guess-the-price mechanics.
- Multi-round tournaments, running bankrolls.

## Risks & unknowns
- Reflexivity may feel exploitable (pump-and-order) rather than clever at 3 players — needs playtest to see if it's funny or broken.
- Ties in the order tally need a clean split rule.
- Is betting on friends' appetites legible enough, or does it just feel like guessing?

## Done means
Three phones join a room, each secretly allocate chips and lock an order, and the host screen reveals a House Special with correct pari-mutuel payouts — with no player's bet spread or order visible to anyone before the reveal event fires.
