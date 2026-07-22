## Overview
Chit turns the thing a group does before ordering food — passively scrolling a menu — into a private sportsbook. 3–6 players, one real scanned menu on the TV, one round. Everyone quietly bets over/under on hidden facts about each dish while pretending to just pick lunch.

## Problem
A menu is dead air: the table skims it, someone reads a calorie count aloud, everyone shrugs. That skim is full of hidden numbers (price, calories, sodium, review score) nobody has stakes in. Chit gives the skim stakes — and makes the fun come from betting against what you *think the room* believes, not just knowing the number.

## How it works
The host TV displays a real menu (a diner or takeout menu, scanned/OCR'd ahead of time), highlighting one dish at a time. For each dish it shows a single **line** for a hidden stat — e.g. "Loaded Nachos — calorie line: 1,100. OVER / UNDER?"

Each **phone privately** shows: your secret chip stack (nobody sees who's rich), an OVER/UNDER toggle, and a wager slider. All bets lock **simultaneously** on a countdown — no one sees anyone's pick or amount. Then the TV reveals the true stat and pays out **pari-mutuel**: winners split the losers' pooled chips in proportion to their stake. Crucially the phone shows only the *total* pot size, never the split — so you're guessing whether the crowd piled onto the obvious side (cheap payout) or left value on the contrarian side (fat payout). Six dishes, then the biggest stack wins.

The host screen is the shared "broadcast": menu, line, dramatic reveal, running pot. The phone is your bookie slip: hidden bankroll, hidden bet, hidden conviction.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{menuId, dishIndex, phase}`, `Player{id, bankroll, currentBet:{side, amount, locked}}`, `Dish{id, statType, line, trueValue}`. Menus are pre-OCR'd JSON with a curated stat per dish (calories from a nutrition source, or a fabricated-but-plausible "1-star odds"). Sync: server owns phase transitions (betting→locked→reveal→payout) and broadcasts only aggregate pot to phones; individual bets stay server-side until reveal. The genuinely hard part is **fairness of the hidden pari-mutuel** — floating-point payout rounding must never mint or destroy chips, so payouts are computed in integer chip units with a documented remainder rule.

## v1 scope
- One hardcoded menu, 6 dishes, calories only as the stat
- 3 players, one round, fixed starting bankroll
- Simultaneous locked bets + pari-mutuel payout
- TV reveal animation + final stack ranking

## Out of scope
- Betting on what the table actually orders (reflexive market)
- Multiple stat types, multiple menus, OCR pipeline
- Odds movement / live line adjustment

## Risks & unknowns
- Calorie "truth" is fuzzy; needs a defensible source or the reveal feels arbitrary
- Pari-mutuel with 3 players can feel swingy — may need a house cushion
- Is hidden-pool contrarian value legible in one round, or does it need a few?

## Done means
Three phones join a room, each secretly bets over/under with a wager on 6 dishes, the TV reveals real calorie counts, pari-mutuel payouts settle to exact integer chips with zero drift, and one player is crowned by stack size.
