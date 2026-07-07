## Overview
Kickback turns the most passive group ritual there is — arguing over what to order — into a hidden futures market. Four friends deciding on takeout each secretly hold a financial stake in specific dishes and can privately trade on which one the group will actually pick, all while openly "just sharing their opinion." It's for groups who already spend twenty minutes on a menu and would rather that time have stakes.

## Problem
Group ordering is dead air with fake democracy: everyone shrugs, one loud person wins, nobody's invested. The itch is that your public advocacy already hides private motives (you want the dumplings) — Kickback makes the money explicit and the hypocrisy the whole game.

## How it works
Six dishes sit on the host screen as a live "order board": each shows a current price driven by how many shares players hold, plus an anonymized ticker of price moves. The host screen NEVER shows who owns what.

1. **Deal (private):** each phone is secretly grubstaked with shares in one or two random dishes and a chip balance. You now quietly want those dishes to win.
2. **Open floor (90s):** the group talks out loud about what to order — meanwhile each phone privately shows buy/sell buttons at live prices, your holdings, and your hidden P&L. You can load up on the dish you're loudly championing, or quietly short the one you're pretending to like.
3. **The vote:** market freezes; everyone casts one real order vote on their phone.
4. **Resolve:** the winning dish pays out its shares. Host reveals each player's P&L and the secret bag they were talking up.

The fun is the gap between your mouth and your portfolio.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `room{menu[6], priceCurve, phase, players}`; `player{id, chips, holdings{item:shares}}` (holdings never broadcast). Buy/sell actions hit the server, which runs a simple automated market maker (LMSR or a capped linear curve) to update the price, then broadcasts only the anonymized price tick to everyone and the private balance/P&L to the owner. The genuinely hard part is a pricing rule that's stable and legible with just 3–4 traders — thin markets swing wildly — plus freezing the book before the vote so nobody snipes the outcome they can already see forming.

## v1 scope
- 3–4 players, one canned 6-dish menu
- One 90-second trading round, one vote, one payout
- Simple linear price curve (no LMSR tuning yet)
- Text-only dishes, no persistence

## Out of scope
- Importing a real menu / photo OCR
- Multiple rounds, images, sabotage or event cards
- Reputation across games

## Risks & unknowns
- Market-maker math with tiny player counts may feel random, not strategic
- Does secret-position-vs-public-advocacy actually spark table talk at 3 players, or fall flat?
- The final vote could be gamed (everyone votes their own bag) — may need a random tiebreak or blind vote

## Done means
Three phones each receive secret holdings, trade during a live 90s window, the host board shows moving prices without leaking positions, the vote resolves the winning dish, and a reveal screen shows each player's P&L and hidden stake — playable start to finish.
