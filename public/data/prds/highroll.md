## Overview
Highroll steals the auto-battler (TFT / Hearthstone Battlegrounds) shop phase for 3-6 players: a host screen shows a shared, scarce unit shop and the battle arena; each phone is your private bench where you draft a squad nobody else can see. You shop simultaneously, contest the same units, then watch your hidden comps auto-fight. For friends who love drafting and trash-talk but won't sit through a 40-minute ranked lobby.

## Problem
Auto-battlers are perfect party fodder — quick reads, greed vs. safety, contested pieces — but they're solo online games with matchmaking and long runtimes. The two things that make them tick, contested shared pools and hidden boards, are exactly what a single passed phone can't reproduce. Nobody has squeezed the shop-phase dopamine into a same-room party format.

## How it works
Host TV shows a shared "river" of 9 face-up unit cards with limited copies (e.g. only two 🗡️Duelists exist), plus each player's gold and a shop timer. When the phase opens, all phones can grab simultaneously: tap a river card to buy it (costs gold), first tap wins — the server resolves contention atomically and the card vanishes from everyone's river.

Privately on your phone: your bench of purchased units, your gold, and live synergy hints ("2 Duelists = +attack; get a 3rd") only you see — opponents can't tell what you're building. Publicly on TV: the river, who has how much gold, and a shrinking timer. When the timer ends, boards reveal and the server auto-resolves a deterministic round-robin battle on the TV (unit stats + simple class synergies), declaring a winner. The whole appeal is racing to snipe the unit two other people also need while hiding your win condition.

Privately per phone: bench, gold, synergy coaching. Shared on TV: the scarce river, gold totals, timer, then the battle and result.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `Room { players[], river:Card[], phase, timerEnd }`; `Player { gold, bench:Card[] }`; `Card { id, class, cost, attack, hp }`. The server owns the river; buys are `buy(cardId)` events resolved in arrival order — the first valid buy mutates state and broadcasts an updated river, a rejected buy returns "gone." Sync strategy: optimistic UI on phones (card greys instantly on tap) reconciled against the server's authoritative `river_update`. Combat is a pure deterministic function of revealed boards, computed once on the server and replayed on the TV. Hard part: contention — two players tapping the same last Duelist within 30ms. The server must serialize buys per-room (a single-threaded Durable Object helps), award exactly one, and cleanly reject the loser with no double-spend.

## v1 scope
- 3 players, one 30-second shop phase, one battle.
- 12-card set, limited copies, river of 9; gold = 3, units cost 1, bench max 3.
- Private benches, shared scarce river, first-tap-wins buys.
- One deterministic auto-battle + winner on TV.

## Out of scope
- Multiple rounds, gold interest/economy, unit levels/upgrades, items, re-rolls, board positioning, animations beyond a simple resolve, more than one synergy type.

## Risks & unknowns
- The auto-battle is a passive spectator moment — fun to watch, or dead air?
- One shop phase may be too shallow to force real drafting decisions.
- Contention edge cases and optimistic-UI flicker on flaky phone wifi.

## Done means
Three phones join, shop the same scarce river simultaneously with correct first-tap-wins contention and no double-buys, keep benches hidden until reveal, and the server resolves one deterministic auto-battle declaring a single winner — demoed on real phones over the room's wifi.
