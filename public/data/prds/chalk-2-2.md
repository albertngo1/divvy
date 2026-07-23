## Overview
Chalk turns the most passive group ritual — squinting at a delivery menu while everyone dithers — into a private pari-mutuel market. 3-6 friends bet chips on which dish the table will collectively crave most, then reveal their own honest hunger. You win by reading the room, not your gut. For anyone who's ever argued about dinner.

## Problem
Picking where/what to eat is dead air: a menu gets passed around, people mumble 'I'm fine with anything,' and twenty minutes evaporate. The menu is a shared thing everyone consumes silently and idly. Chalk weaponizes that idle read into a fast, sweaty betting game — and still ends with an actual dinner decision.

## How it works
The host TV shows 6 dishes from a real menu (curated or pasted in). Each phone privately gets 10 chips and a betting board of the 6 dishes. **Privately**, each player stakes chips across dishes — predicting which one the WHOLE table will vote as its #1 craving. No one sees anyone's allocation; the TV shows only a lock counter ('3/4 locked'). After everyone locks, each phone **privately** casts one honest craving vote (the dish you actually want most). Votes tally live on the TV. The top-voted dish is the 'chalk.' Pari-mutuel payout: the total chips staked on the winning dish are redistributed proportionally to those who backed it — bet big on the crowd favorite, cash big. The catch: your honest vote is public at reveal, so betting the room while secretly craving the weird dish exposes you. Highest chip total wins; the winning dish is what you actually order.

Per-phone is load-bearing: the whole game is simultaneous SECRET stakes plus a SECRET honest vote. Pass one phone around and both leak — the market collapses.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Room {menu: Dish[], phase, players: {id, chips, stake: Record<dishId,int>, vote: dishId|null}}`. Sync: phones POST stakes; server validates sum ≤ 10, echoes only lock-count to TV. On phase flip, server reveals votes + runs pari-mutuel settlement server-side (single source of truth for payouts). Hard part: fair simultaneity — no phone should learn the lock order or others' stakes before its own lock, so the server buffers and reveals atomically. Menu parsing (paste a URL/text → 6 dishes) is a nice-to-have; v1 ships a hardcoded menu.

## v1 scope
- 3 players, one hardcoded 6-dish menu, one round
- 10 chips, private allocation, private honest vote
- Server-side pari-mutuel settlement + a TV leaderboard
- Reveal screen showing everyone's honest vote

## Out of scope
- Menu URL parsing / OCR
- Multiple rounds, chip carryover, seasons
- Real ordering integration (DoorDash etc.)

## Risks & unknowns
- 6 dishes may be too few for interesting spread; tune to 8?
- Pari-mutuel can feel swingy with 3 players — validate payout math feels fair
- Honest-vote reveal must feel spicy, not punitive

## Done means
Three phones each privately stake 10 chips and cast a hidden craving vote; the TV reveals votes, names the chalk dish, settles chips pari-mutuel, and declares a chip leader — all with no phone ever seeing another's stake before lock.
