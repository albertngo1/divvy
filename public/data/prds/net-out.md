## Overview
A 4-player concurrent-room trading game where nobody negotiates. Each phone privately posts standing barter offers; a server clears them by finding *cycles* in the offer graph. For groups who love the trading phase of Catan-likes and hate that it takes twenty minutes and only two people at a time.

## Problem
In-person trading is the most social mechanic in tabletop and the most tedious to execute. Trades are serialized — one loud pair at a time while everyone else waits — and they are structurally limited to *bilateral* deals, because a human table cannot find a four-way ring where A gives wood to B, B gives ore to C, C gives brick to D, D gives sheep to A. Those rings exist in almost every hand. They are invisible because finding them requires reading everyone's private wants at once, which is exactly what a table of humans cannot do and a server trivially can.

## How it works
Four players, three goods (Clay / Ore / Silk), six goods each, one 60-second round.

**Privately on each phone:** your inventory; a secret goal card ("end holding 4 Silk"); and your *offer sheet* — up to three standing offers of the form `GIVE 2 Clay → GET 1 Ore`, editable at any moment via three tap-sliders. Your sheet is never shown to anyone.

**On the shared TV:** every 10 seconds a CLEARING TICK fires. The server treats each live offer as a directed edge (player → good they want) and searches for cycles of length 2–4 in which every leg is satisfied simultaneously. The TV animates the winning ring: anonymous seat pips connected by a rotating loop, goods sliding around it, a satisfying clunk. It shows *that* a 4-way ring cleared and how many goods moved — never who wanted what, never anyone's sheet.

So the loop is: post greedy rates and nothing clears; post generous rates and a ring forms but you overpaid. You read the table by watching which ring sizes keep failing to appear.

## Technical approach
A Cloudflare Durable Object per room is the sole authority on inventory. Phones send `{offerIdx, give, get, ratio, clientSeq}`; the server replies with version-stamped inventory patches, so a phone that edits mid-tick simply loses the race and gets corrected. The host tab is a pure render client with zero authority.

Data model: `Room { seats[], inventory: Record<seat, {clay, ore, silk}>, offers: Record<seat, Offer[3]>, tick, seed }`.

The hard part is *not* sync. It's clearing. This is the kidney-exchange matching problem: multiple disjoint cycles may be simultaneously executable and the choice between them is a fairness decision. At v1 scale (4 seats, 3 goods) we brute-force all cycles of length 2–4, select the maximum-cardinality set, and tie-break with a per-room seeded PRNG so clearing is deterministic, replayable, and un-gameable by submit timing. The second hard part is *legibility*: if players can't feel why a ring fired, the game is noise. Hence the ring animation and a private per-phone postmortem — "your Clay→Ore offer completed a 4-ring."

## v1 scope
- Exactly 4 players, 3 goods, 6 fixed goods each
- One 60-second round, six server-clocked ticks
- Max 3 standing offers per phone, integer ratios 1:1 / 2:1 / 3:1 only
- One secret goal card per player, scored once at the end
- TV: inventory bars, ring animation, final reveal of all four goal cards

## Out of scope
Chat, counter-offers, multi-round economies, dynamic pricing, more than 3 goods, spectators, rejoin-after-disconnect.

## Risks & unknowns
The biggest risk is opacity — players may experience clearing as a slot machine. If two ticks pass with no cycle the room deflates, so we may need a "near-miss" hint on the TV ("a 3-ring was one Ore short"). Cycle brute force is fine at 4 seats and explodes by 8; that's a real ceiling.

## Done means
Four phones join from a QR code. A ring of length 3 or 4 clears that no pair of players could have executed bilaterally, every inventory sums correctly against the starting total, each phone shows only its own leg, and a player can state afterward — correctly — that they were in a trade with three people they never spoke to.
