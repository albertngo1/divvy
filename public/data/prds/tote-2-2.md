## Overview
Tote turns the dead time a group spends browsing before it picks something — takeout dishes, movie posters, songs for the party playlist — into a private parimutuel market. 3–6 players, one host screen showing a gallery of options the group will genuinely choose from tonight. Each phone secretly stakes chips predicting which option the group will land on.

## Problem
Choosing what to watch or eat is slow, passive, and someone always caves to the loudest voice. Tote makes browsing a competition and, as a side effect, produces the group's real decision.

## How it works
- Host shows a gallery of 6 options and opens a two-minute market.
- Each PHONE privately holds a chip budget (say 10) to drop across options, and LIVE parimutuel odds (implied % backing each) that update as everyone stakes — aggregate only, never who staked what. You place secretly; you see the crowd's shape, not its members.
- The shared HOST screen shows the gallery and a live tote board of odds — but no individual bets.
- Market closes. Then the group does the real thing: an open majority VOTE on the option to actually pick. That option resolves the market parimutuel-style — the whole pot splits among its backers, proportional to chips. Backing the chalk (obvious favorite) pays little; spotting an under-loved option the group swings to pays big.
- Output: the option the group truly picks, plus a chip ranking. One round.

It's a beauty contest on the group's OWN future vote — reflexive, no external truth. You read the drifting odds (is everyone overrating the crowd-pleaser?) and bet against the room while sitting inside it.

Per-phone load-bearing: simultaneous, secret, individually-budgeted placements with private live-odds feedback. A passed phone destroys the hidden-market core — everyone would see everyone's bets.

## Technical approach
- Host tab + phone PWAs + authoritative WS server.
- Data model: Room{options[], phase, closeTs, pot}; Bet{playerId, allocations{optionId: chips}}; server aggregates allocations into odds.
- Sync: phones stream allocation edits; server recomputes aggregate odds and broadcasts (~2 Hz) to all phones + host. Individual allocations never leave the server except as sums. Vote phase = one tap per phone, majority; host breaks ties.
- Hard part isn't latency — it's market integrity: prevent last-millisecond sniping (freeze allocations at server-timestamped closeTs) and prevent the odds feed from leaking who bet what (only emit sums, always rounded). Plus reflexivity — the vote must stay independent enough not to just self-fulfill: show no odds during the vote so it's a fresh gut choice.

## v1 scope
- 3 players, one hardcoded 6-option gallery (image + label).
- 10 chips each, live aggregate odds, market close, group vote, parimutuel payout, chip ranking.

## Out of scope
- Custom galleries / menu import, multi-round, chip carryover, anti-collusion, spectators, steering/chat.

## Risks & unknowns
- Reflexivity: does everyone pile on the favorite, making it dull? Contrarian parimutuel payout should counter it; playtest.
- 3 players may be too thin for a real market — likely wants 4–5.
- Do people enjoy the vote resolving their own bets, or feel it's rigged? Hide odds during the vote.

## Done means
3 phones join, privately stake 10 chips across a 6-option gallery with live shared odds, the market closes, the group votes, and the host shows a correct parimutuel payout + chip ranking — with no phone ever seeing another player's individual allocation.
