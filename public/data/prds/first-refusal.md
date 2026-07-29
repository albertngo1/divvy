## Overview

A fast, nervy auction party game for 3–5 players. The host screen is the auction block; each phone is a private bidder's booth with its own privately-timed, privately-priced window onto the same falling price. Three lots, about eight minutes, and at least one person screaming.

## Problem

A Dutch (descending-price) auction is thrilling exactly once per lot and only for the person who breaks — everyone else stares at a shared number an auctioneer is chanting. And its cousin, once-around first refusal ("pass or take?" around the table), is the slowest mechanic in tabletop: four people wait while one person thinks. Both problems are the *shared, sequential clock*. Give every player their own clock, opening at a time they can't predict and others can't see, and the waiting disappears while the nerve multiplies.

## How it works

Each player privately holds a **Need card**: a secret multiplier over item categories (×3 on SALTY, ×0 on SWEET). Same lot, wildly different values.

Per lot:
1. TV shows the item — "CAR CHARGER", "HALF A BIRTHDAY CAKE" — with its category and base value visible to all.
2. A hidden price schedule ticks 12 → 1, one per second.
3. Each phone is assigned a secret window: opens at a random offset 0–7s, lasts 4s. Your phone shows a live falling price *only while your window is open* — you might see 11→8, or 5→2, or never overlap with anyone.
4. While your window is open: a big **TAKE** button, your Need card, your live price. Your phone also pulses (haptic, or a visual ring on iOS) at a rate proportional to how many rivals are currently live — you feel the room without seeing it.
5. The TV shows only the item and a row of anonymous lamps, one lit per live bidder, positions re-shuffled every frame so nobody can track a lamp to a person.
6. First TAKE ends the lot at that player's displayed price. Then the TV twists the knife: it reveals the winner, what they paid, and **the lowest price that was still coming**.

Score = Σ (base value × your multiplier) − prices paid. Shouting is allowed and useless: nobody can verify whether you're live.

## Technical approach

Authoritative Socket.IO or PartyKit server ticking at 10Hz. Per-lot state: `{ startedAt, schedule: number[], windows: { playerId: {openAt, closeAt} }, sold: null | {playerId, price} }`. Clients don't run their own timers — they render from a server-stamped anchor plus local elapsed, with drift correction each tick.

The genuinely hard part is **fairness under latency**: a game decided in seconds punishes a 300ms phone. Mitigation: a TAKE carries the client's displayed price and tick index; the server accepts it if that price is legal for that player's window and no earlier accept exists. The DO is single-threaded, so first-write-wins is deterministic and race-free. The loser gets an immediate "ALREADY SOLD" rather than a silent no-op. Second subtlety: the liveness pulse must be a smoothed, delayed count — an exact instantaneous rival count leaks identity by correlation with window edges.

## v1 scope

- 3–4 players, QR join, no accounts
- 3 lots from a hardcoded deck of 6 items, 3 categories
- Fixed 4s window, random offset, price 12→1
- No budgets — you can always afford it; price is just subtracted
- One score screen, one "you missed 4" reveal per lot

## Out of scope

Budgets and bankruptcy, more lots, reconnect mid-lot (you simply forfeit the window), spectators, sound design, custom item packs.

## Risks & unknowns

May read as a reflex test rather than a decision — window length is the tuning knob. Random offsets can gift someone a free cheap lot; may need offsets balanced across the lot set rather than independently drawn. iOS Safari has no Vibration API, so the haptic channel needs a visual fallback that carries the same tension. Anonymized lamps may be de-anonymized socially by watching people's faces — which might be a feature.

## Done means

Four phones join; server logs confirm four distinct window offsets on one lot; exactly one TAKE is accepted and two TAKEs sent within 100ms resolve deterministically with the loser shown ALREADY SOLD; the TV displays the winner's price and the lower price that was still coming; final scores match a hand-computed tally including Need multipliers.
