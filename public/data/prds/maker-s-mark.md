## Overview

**Maker's Mark** is a ~12-minute anonymous gift exchange for 3–5 people in a room with a host screen. Each player secretly makes one small digital charm for one other player, out of materials they mostly don't hold. Everyone keeps their charm no matter what. The group *wins* only if no recipient correctly identifies their maker.

## Problem

Gift games collapse into who-spent-most or whose-was-funniest — scored, comparative, forgettable. And anonymity is usually framed as an obstacle to overcome (find the traitor). The itch: make anonymity the **prize**, and make the leak come from something you genuinely *want* to do — asking for the one material that would make your gift right.

## How it works

**Setup.** The server privately deals each phone an inventory of 3 material tiles from a pool of 6 (brass, sea glass, thread, feather, ash, salt — each with a distinct visual) and a private **recipient**, assigned as a derangement. Nobody knows who holds what. Nobody knows who is making for whom.

**Build (3 min).** Your phone privately shows a charm canvas. You must place exactly 3 materials and type one inscription (≤40 chars). Your recipient's name appears on your phone only.

**The leak.** To make something that actually fits your recipient, you almost always need a tile you don't hold. The host TV runs a public **request board** — "SEAT 3 WANTS THREAD" — attributed by seat, on the big screen, for everyone. Fulfilling a request is done privately from your phone and the transfer itself is anonymous; only the *asking* is public. So every material in your finished charm that you had to ask for is a signature. There's also a **quiet gift** button — push a tile at someone who didn't ask — which muddies the log for everyone.

**Reveal.** The TV displays all charms at once, unlabeled, then routes each one to its recipient's phone. Each phone privately names one suspect. If zero recipients are correct, the TV plays the "no maker's mark" ending. Any correct hit and the group fails — but every player still downloads their charm PNG. The keepsake is unconditional; only the anonymity is at stake.

## Technical approach

Host tab + phone PWAs + a PartyKit Durable Object per room (or Socket.IO over Tailscale Serve). DO state: `{seats[], inventories: {playerId: [tileId]}, assignments: {makerId: recipientId}, requests: [{seat, material, open}], transfers: [{from, to, tileId}], charms: {makerId: {slots[3], inscription}}, suspicions: {}}`. Inventories, assignments, and charm specs are projected per-connection; the host receives only aggregate/anonymized views.

A charm is stored as **data, not pixels** — material ids, slot positions, inscription — and both the phone and the host render it through the same shared renderer module, so the TV and the recipient's phone show a byte-identical charm.

The hard parts: (a) **transfer atomicity** — two players fulfilling the same open request in the same tick must resolve to one winner server-side, with the loser getting an "already fulfilled" toast and their tile untouched; (b) keeping transfers anonymous while requests are attributed, which means the transfer log broadcast to the TV must be aggregated ("a tile moved") with no timing correlation to a specific fulfiller — buffer and flush transfer events on a fixed 5s tick; (c) reveal routing, where every phone simultaneously receives a *different* payload while the host holds all of them.

## v1 scope

- Exactly 4 players, one round, one charm each.
- 6 material types, 3 tiles dealt each, 3 slots per charm.
- One 3-minute build/trade window, single hardcoded timer.
- Request board + fulfill + quiet gift. No counter-offers, no trades-for-trades.
- One suspicion guess per recipient, all-or-nothing group result.
- Keepsake = PNG download from the recipient's phone. No gallery, no persistence.

## Out of scope

Multi-round exchanges, drawing or photo materials, chat, negotiated two-way trades, more than one room, spectators, and any point total.

## Risks & unknowns

The leak may be too strong at 4 players — with one public request, deduction could be trivial; tuning may require more materials or fewer public requests. The inscription is a much bigger authorship leak than the tiles (word choice, in-jokes), which could dominate the intended mechanic. Players may simply never trade, making the game inert and the charms generic. Whether a 3-tile charm feels like a keepsake at all, rather than clip art, is the biggest open question.

## Done means

Four phones join, each receives a private inventory and a private recipient, at least one public request is posted and privately fulfilled with the tile atomically moving exactly once, all four charms render identically on the host TV and on the receiving phone, each recipient submits one suspicion, and the TV shows either the "no maker's mark" ending or a failure — with all four phones able to download their own charm PNG in both cases.
