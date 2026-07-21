## Overview
A betting game built on the most universally endured passive ritual: watching one person doom-scroll a streaming service's grid, unable to choose. 3-5 players. The browse paralysis you all suffer through becomes a live private sportsbook.

## Problem
Picking what to watch is agony everyone consumes silently — one person holds the remote, thumbs through forty thumbnails, opens three trailers, and lands on the thing you all suspected they'd pick anyway. That predictability is the joke. Still Watching? turns your read of a friend's taste and indecision into money.

## How it works
One player is the **Chooser** (random in v1). The TV mirrors a scrollable grid of ~16 show posters; the Chooser drives the highlight from their phone and will eventually lock one title as "tonight's pick." Everyone *else* privately, before browsing begins, fills a hidden bet slip across three markets:
1. **The pick** — stake chips on which poster the Chooser lands on.
2. **Over/Under** — the house line on seconds-to-decide (e.g. 30s); bet over or under.
3. **The tell** — will they open a trailer/details before locking? Yes/No.

The Chooser does not bet — they just browse, genuinely, obliviously. The TV shows an anonymized **odds board**: a heat-map of where money sits per title, live, no names. Then the Chooser browses for real. The server timestamps browse-start and lock, records the title and whether details were opened, and settles all three markets. Most chips wins.

The phone is load-bearing: every non-Chooser bets *secretly and simultaneously*, and the odds board is an aggregate of hidden slips. Pass one phone around and you'd both leak bets and destroy the simultaneity the market depends on.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `room{code, chooserId, grid[16], line, phase, browseStartTs}`; `bet{playerId, title, ou:'over'|'under', tell:bool, stakes}`. The Chooser's scroll/lock events stream to the server, which owns the clock — decision time = `lockTs - browseStartTs`, server-authoritative so no client can fudge it. Odds board recomputes on each bet as an anonymized aggregate. Hard part: precise, tamper-proof timing (network jitter must not swing the over/under) and a live odds heat-map that reflects hidden money without revealing any individual's slip.

## v1 scope
- 3 players, one round, one random Chooser
- Built-in 16-poster grid, one fixed over/under line
- Three markets, private simultaneous slips, anonymized odds board
- Server-timed lock, settlement, chip tally

## Out of scope
- Real streaming-service integration or live catalog
- Rotating Chooser across rounds, dynamic house lines
- Cashing out / hedging mid-browse

## Risks & unknowns
- A self-aware Chooser could troll the bettors (stall, pick a joke title) — may be a feature
- Over/under line calibration; timing fairness across phones
- Thin 3-player markets can feel swingy

## Done means
A random Chooser browses a mirrored grid while two other phones lock hidden bets across pick/over-under/tell; the TV shows only anonymized odds; the server times the lock authoritatively, settles all three markets correctly, and names a chip leader.
