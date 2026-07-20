## Overview
Declare is a 3–6 player concurrent-room bluffing game riffing on *Sheriff of Nottingham*. Everyone is a merchant trying to sneak high-value contraband past a rotating Sheriff by hiding it in a private bag while declaring only legal goods aloud. It's for groups who love the sweaty face-to-face lie of a customs checkpoint.

## Problem
The magic of Sheriff of Nottingham is the sealed bag: you know what's inside, everyone else only has your word. Physical play is slow (passing bags, shuffling cards, honor-system peeking) and impossible to scale. The bluff wants private, tamper-proof per-player state — exactly what phones give you.

## How it works
A rotating Sheriff sits out each round. The **host TV** shows the market legend (Apples/Bread/Cheese = legal, low value; Pepper/Silk/Crossbow = contraband, high value but illegal to carry), each merchant's *public spoken declaration* ("3 apples"), and whose bag is being inspected.

Each **phone shows privately**: your dealt hand of goods, a bag you drag up to 3 cards into (contents visible ONLY to you), and a declaration picker where you commit a single legal good + count. Your actual bag never appears on anyone else's screen.

The **Sheriff's phone privately** shows all declarations and, one merchant at a time, an INSPECT / WAVE-THROUGH toggle. Verbal bribing happens out loud (v1 keeps money simple). On INSPECT, the bag flips face-up on the TV: if you lied you forfeit the goods + pay a penalty; if you were honest the Sheriff pays you. Waved-through bags enter your stall face-down and score at reveal — contraband pays big.

Simultaneous private bag-loading is the whole game; a single passed phone would leak every bag and kill the bluff.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve; host tab + phone PWAs. Data model: `Room{phase, sheriffId}`, `Player{hand[], bag[] (private), declaration{good,count}, stall[]}`. Phases: LOAD (simultaneous, private) → DECLARE (lock) → INSPECT (Sheriff acts, others idle) → REVEAL (TV). Sync strategy: server holds bag contents server-side and never broadcasts them to non-owners until REVEAL; each client only receives its own `bag` plus everyone's public `declaration`. The genuinely hard part is **hidden-state integrity** — one buggy broadcast that leaks a `bag[]` to the room ruins the round, so every outbound payload is filtered per-recipient and bag reveals are server-authoritative, never client-asserted.

## v1 scope
- 3 players, one round, fixed Sheriff (no rotation yet)
- One bag each, max 3 cards, single legal declaration
- Sheriff inspects or waves each of the 2 merchants
- TV reveal + naive scoring (contraband value − penalties)

## Out of scope
- Money/bribery economy, multi-round rotation, deck management, negotiation UI, spectators

## Risks & unknowns
- Bribing is verbal and unenforced in v1 — may feel thin without stakes
- Balancing contraband value vs. inspection penalty for a fun risk curve
- Per-recipient payload filtering must be airtight or the bluff collapses

## Done means
Three phones each load a private bag no other client can see, lock a public declaration, the Sheriff inspects one bag which flips truthfully on the TV, scores compute correctly, and a network sniff of any non-owner client never contains another player's bag contents before REVEAL.
