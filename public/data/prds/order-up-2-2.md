## Overview
A social betting game for 3–6 friends who think they know each other. The group passively browses a menu on the TV — the most universal shared-consumption ritual there is. But instead of just ordering, everyone secretly commits their own order AND privately wagers chips on what everyone *else* will order. It's a parimutuel market on your friends' appetites.

## Problem
"What are you getting?" is small talk. Meanwhile you privately, smugly know your friend always gets the spiciest thing and your partner never orders fish. That table-reading knowledge is never scored. The itch: cash in on knowing your people — and get caught out when someone orders wildly off-brand.

## How it works
Host screen (shared): a menu of 6 dishes with photos and names — no prices needed. A roster of player avatars. During betting it shows only a countdown and who has locked, never anyone's picks or bets.

Each phone (PRIVATE), simultaneously and secretly, does two things: (1) **Your order** — tap the one dish you'd actually eat. (2) **Your book** — you get 100 chips per other player and distribute each stack across the 6 dishes for that person (all-in on one dish, or hedged). Everything is hidden; nobody sees your order or your bets until reveal.

Reveal, one player at a time on the TV: their real order flips up. For that player, the table runs parimutuel — everyone who backed the correct dish splits the losers' chips staked on that player, proportional to their stake. Read your friend perfectly and go all-in: big score. Hedge: safe. Whiff: broke. The off-brand order that nobody backed is the delicious upset. Host tallies a final leaderboard.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve).

Data model: `Room { menu[6], players[], phase }`, `Player { id, order, book: {targetId → {dishId → chips}}, locked, winnings }`. Server holds all secret state and never echoes another player's `order`/`book` to clients during the betting phase — the privacy boundary is server-enforced, not just hidden in the UI.

Sync strategy: phones send `commit {order, book}`; server marks locked and broadcasts only a `lockCount`. When all locked, server computes parimutuel settlement per target deterministically (pool of all chips staked on that target, winners = backers of the true dish, split pro-rata) and streams a `reveal {targetId, order, payouts[]}` per player for a paced TV animation.

Genuinely hard part: less real-time sync than *simultaneous secret commit integrity* — no client may learn another's order before its own lock, or the market is rigged. Solve with server-authoritative locks and a hard rule that `order`/`book` are write-only from clients and never rebroadcast until the global reveal phase. Parimutuel math must handle zero-winner pots (nobody backed it → chips returned or rolled to a jackpot).

## v1 scope
- 3 players, one round, one fixed 6-dish menu.
- 100 chips wagered per other player; free allocation.
- Simple pro-rata parimutuel, zero-winner = refund.
- Host reveal-per-player + one leaderboard.

## Out of scope
- Custom/uploaded menus, real prices, categories.
- Betting on side questions (appetizer, drink, dessert).
- Multi-round, persistent bankrolls, odds display.
- Player-written dishes.

## Risks & unknowns
- With near-strangers it's a coin flip; needs friends who actually know each other.
- 6 dishes may be too few (predictable) or too many (fiddly on phone).
- Balancing all-in vs hedge payouts so the upset stays juicy without punishing solid reads too hard.

## Done means
3 phones join, each privately locks one order plus chip allocations on the other two, and after reveal the host shows a leaderboard where correctly-backed dishes paid out parimutuel from the losing stakes, with a clean refund path when nobody backed a dish.
