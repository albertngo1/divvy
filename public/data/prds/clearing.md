## Overview
A real-time trading party game for 3–6 players that replaces the single most tedious tabletop ritual — round-robin Catan/Bohnanza haggling — with silent, simultaneous, double-blind offer matching. Host TV plus a phone per player.

## Problem
Table-trading is agony: it's sequential (only one deal at a time), it blocks the whole table, it's dominated by the loudest player, and quiet players get steamrolled or forgotten. The negotiation *is* the fun; the logistics are the tax.

## How it works
Each phone privately holds a hand of ~7 commodity chips (colored tokens: Ore, Wheat, Clay…) and a **secret goal card** ("collect 4 matching + 1 wildcard"). A single 90-second live window opens for everyone at once. On your phone you assemble directed offers: pick a target from the player roster, drag chips into a **GIVE** slot and a **WANT** slot, tap Send. Offers are invisible to everyone, including your target. The server continuously scans all pending offer pairs: if A→B ("give 2 Ore, want 1 Wheat") and B→A ("give 1 Wheat, want 2 Ore") are mutually satisfiable, it **auto-executes instantly** — swaps the chips, buzzes both phones with a haptic, logs a receipt. The host TV shows ONLY anonymized aggregate flow: arrows pulsing between avatars, a "a trade cleared!" ticker, and each player's goal-progress bar (public pressure). Contents stay private. Timer ends → closest to their secret goal wins; ties broken by trades cleared. The skill is inferring needs from the public bars and firing the complementary offer before a rival does.

## Technical approach
Host browser tab + phone PWAs + authoritative WS server (PartyKit / CF Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{players[], phase, deadline}`; `Player{hand:Map<commodity,int>, goal, offers:[{to, give:Map, want:Map, ts}]}`. Sync: phones send offer intents; the server holds authoritative hands and re-runs a matcher on every offer mutation (pairwise compatibility against the target's offers to you). The genuinely hard part is **atomicity under races**: two of your offers can become executable simultaneously against different partners competing for the same chip. The server takes a per-player mutex on hand mutation, executes one match, re-validates the rest, and pushes versioned hand state so phones can reconcile optimistic drag UI (a chip you're dragging may vanish mid-gesture).

## v1 scope
- 3 players; 3 commodity types; 7 chips each
- One 90-second round; one secret goal each
- Exact-complement bilateral offers only (no partial fills)
- Host: flow arrows + cleared-trade ticker + progress bars

## Out of scope
Multiparty/ring trades, partial fills, counter-offers, chat/emotes, reconnect grace, multiple rounds.

## Risks & unknowns
The auto-matcher can feel opaque ("why did that fire?") — needs a clear cleared-trade receipt. Exact-match may be too rare → dead air; might need fuzzy matching. Public progress bars could leak too much or too little.

## Done means
Three phones join with distinct hidden hands + goals; two players independently send complementary offers and the server swaps chips within ~200ms, both phones update, and the host ticker logs one anonymized cleared trade; at timer end the closest-to-goal player is declared winner.
