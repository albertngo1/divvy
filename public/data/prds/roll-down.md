## Overview
Roll Down steals the auto-battler (TFT / Dota Underlords) shop-and-bench loop and compresses it into one frantic party round. Each player builds a tiny army in secret on their own phone, then all armies auto-fight on the shared TV while everyone just watches, sweating. For 3–4 friends who love the 'rolling the shop' dopamine but don't want a 40-minute ranked match.

## Problem
Auto-battlers have the best economy-tension of any genre — but they're solo, slow, and screen-bound. The delicious part (the shop refresh, the contested unit) is invisible to the room. There's no couch-party auto-battler because the drafting is private by nature — which is exactly what makes it perfect for per-phone.

## How it works
One 45-second **shop phase**. Each phone PRIVATELY shows: your gold (start 10), your 5-slot shop of face-up units, a 'Reroll (2g)' button, and your bench/board of bought units with auto-computed synergies. The shared TV shows ONLY neutral drama: a countdown, each player's avatar, gold spent, and a live 'pool depleting' ticker (e.g. 'Knights remaining: 6').

The load-bearing twist is the **shared finite pool**. There are, say, 8 copies each of 12 unit types across the whole table. Your shop draws randomly from what's LEFT. When you buy the last Knight, every other player's future shops can never offer a Knight again — and they find out only when their own private shop mysteriously stops showing them. Three of the same unit auto-combine into a starred super-unit, so racing a rival for the last copy is a private knife-fight neither of you can see the other fighting.

At 0s, all boards lock. The TV runs a deterministic round-robin auto-battle (positions, synergies, RNG seed) with juicy animations. Winner by most survivors. One round, done.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). **Data model:** `Pool` = map unit→remaining count (server-authoritative, single source of truth); per-player `{gold, shop[5], bench[], board[]}`. **Sync:** every buy/reroll is a server RPC that atomically decrements the pool and re-rolls the actor's shop; only that player's shop diff is pushed to them, while a redacted `poolCounts` broadcast goes to the TV. The genuinely hard part is **atomic contention** — two players tapping the last Knight within 20ms must resolve to exactly one winner with no phantom purchases; the server serializes all pool writes in the Durable Object's single-threaded loop and rejects the loser with a snappy 'gone!' shake. The auto-battle itself is a pure function of the locked boards + a shared seed, computed once on the server and replayed identically on the TV.

## v1 scope
- 3 players, one 45s shop phase, one auto-battle.
- 6 unit types, 2 synergy pairs, 3-copy star-up.
- Fixed 3x3 board, auto-positioning (no manual placement).
- Deterministic battle, survivor-count scoring, single winner screen.

## Out of scope
- Multiple rounds / interest economy / items.
- Manual unit positioning, benching drag-drop.
- Persistent ranks, more than 4 players.

## Risks & unknowns
- Is 45s enough to feel the pool contention, or does it need 2 rounds to bite? Playtest.
- Auto-positioning may make outcomes feel arbitrary — tune synergies so drafting choices dominate RNG.
- Pool-depletion ticker on TV must telegraph tension without revealing who bought what.

## Done means
3 phones join a room code; each rolls/buys from a private shop drawn from one shared server pool; buying the last copy of a unit provably removes it from every other player's future shops; at 0s the TV plays one auto-battle and declares a winner — with a logged case where two players contested the final copy and exactly one got it.
