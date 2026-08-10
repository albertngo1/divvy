## Overview
A four-minute auto-battler for 3-4 people, stripped to the one mechanic that no other genre has: **the shared pool**. Every player rerolls a private shop, but all shops draw from a single finite bag. What you *don't* see is the only intel you get about anyone else's board.

## Problem
Auto-battlers are secretly information games — good players read opponents by what stops appearing in their own shop — and every party-game version of "drafting" throws that away in favour of passing packs around. Pack-passing is public, slow, and tells you everything. A shared invisible bag is private, instant, and tells you exactly one thing, indirectly. It also cannot exist without a phone per player: one device passed around collapses the whole mechanic to a single visible deck.

## How it works
One bag holds 5 unit types × 4 copies = 20 tokens. Three shop phases, 40 seconds each. Each phone shows a private 3-slot shop drawn from the bag; **reroll** returns your slots to the bag and draws three fresh ones. You may **buy** up to 3 units total across the whole game; bought units leave the bag permanently.

Holding three copies of one type **upgrades** it to double power. So hoarding is both the strongest play and the loudest one — the copies you take are copies nobody else can ever see. That single lever creates the incentive and the leak at the same time.

Each player gets one **audit token**: burn a phase to see the bag's exact remaining composition.

At the end, all three boards flip on the TV and resolve in a round-robin using a rock-paper-scissors-plus matrix printed on screen all game. Highest total wins.

PHONE (private): your 3 shop slots, your bought board, your reroll button, your audit token. TV (public): the RPS matrix, the bag's remaining *count* only, each player's board as face-down cards with a count, and a **declined pile** — every unit rerolled away this phase, unattributed and shuffled. That pile is public deduction fuel: four declined archers means somebody is rerolling hard past archers.

## Technical approach
Host tab + phone PWAs + one authoritative Durable Object. Model: `{bag: [tokenId→type], reserved: {playerId→[tokenId]}, boards: {playerId→[type]}, declined: [type], phase, deadline}`. Every draw mutates one shared array, so the DO must serialise draws — two phones rerolling in the same millisecond can't both get the last archer. That's the genuinely hard part, plus the accounting for **reserved** tokens: a unit sitting unbought in your shop is invisible to everyone else, which is a real, temporary denial and must be released correctly on reroll, on timeout, and on disconnect. Reconnect replays private shop state from the DO, never from the client. Phones never receive the bag contents except through an audit.

## v1 scope
- 3 players, 5 unit types × 4 copies, 3 phases of 40s
- 3 buys each, unlimited rerolls, one audit token
- One reveal, one round-robin, one winner
- No gold, no economy, no benches, no positioning

## Out of scope
- Multiple rounds, HP/elimination, unit abilities, items, a fourth player in v1

## Risks & unknowns
- With only 20 tokens the bag may drain to obviousness before phase three; the ratio of copies-to-players is fragile.
- The inference may be too subtle to *feel* — players might just buy greedily and never read the absences. The declined pile exists to rescue this and may need to carry more weight.
- Heads-down phone time with a quiet TV is a real party-energy risk.

## Done means
Three phones finish a full game in under five minutes with no double-drawn token across 50 rerolls, and at least one player says out loud, mid-game, that someone must be hoarding a specific unit — and is right.
