## Overview

**Good for It** is a four-player game played over any five-minute broadcast segment — a match, an awards show, a cooking competition. There are prop bets on the TV, but you cannot fund them. Your bankroll is *lendable only*; to place a single bet you must borrow, privately, from another player, at a rate the two of you negotiate while everyone talks over the screen. Two of the four phones hold a genuine edge. Nobody can prove which two.

## Problem

Group prediction games flatten into everyone guessing the same obvious outcome. The interesting asymmetry in real betting isn't the event — it's that information and capital sit in different people's hands, and they have to find each other and agree on a price without any way to verify a claim. That negotiation is the game, and it is invisible in every TV-prediction app.

## How it works

**Deal.** Each phone privately shows a bankroll of 100 marked LEND ONLY and a betting balance of 0. Two phones privately receive a true **edge** about the segment ("the challenger does not appear after the second break"); the other two privately read NO EDGE. Only you know which you hold, and the game explicitly invites you to lie about it out loud.

**Credit (90s, talking encouraged).** The TV shows three fixed-odds props and a single public number: total credit extended so far. Each phone privately sends 1:1 offers — *lend 40 at 20%* to a named player — or requests. Offers route through the server and are never broadcast, so the going rate is genuinely undiscovered; you may be paying triple what someone else paid. Accept/decline is private too.

**Bet (45s).** With borrowed chips only, each phone privately backs the three props. Stakes are hidden.

**Watch (5 min).** The segment plays; props resolve on a pre-authored timeline baked into the clip metadata, so resolution is automatic and the TV pops each one live. Your phone privately shows your debt clock next to your position.

**Settle.** Server order: resolve props → credit winnings → repay principal + interest in offer order → mark **defaults**, which appear on the TV by name with the lender eating the loss. Then the payoff moment: the TV draws the full loan graph — who trusted whom, at what price. A lender who never cared about the broadcast can win.

## Technical approach

Cloudflare Durable Object per room. Model: `Loan {from, to, principal, ratePct, state}`, `Bet {playerId, propId, side, stake}`, `Edge {playerId, text, isTrue}`, `Player {lendable, betting, debts[]}`. Offers are point-to-point, server-routed; the DO is the only holder of the rate book, and the host tab is never sent it until settlement. The hard part is concurrent credit: two borrowers can accept offers that jointly exceed a lender's remaining 100. Solve by escrowing principal on *send* (reserved out of `lendable`, released on decline or 30s timeout) and serializing all mutations for a given lender through the single DO — no client-side optimism on money. Settlement is one atomic transaction so a default can't half-apply.

## v1 scope

- Exactly 4 players, one 5-minute clip, **one round**
- 2 true edges, 2 empty; three props with hard-coded odds and a hard-coded resolution timeline
- Offer form: amount (10/20/40) × rate (0/10/25/50%), one tap each
- Default = lender loses principal, borrower scores 0. No collateral, no partial repayment
- Loan graph drawn at the end

## Out of scope

Live broadcast ingest, in-app chat, secondary markets in debt, collateral, multi-round reputation, 5+ players.

## Risks & unknowns

- Lending may be strictly dominated if defaults are common — interest cap and a small "capital deployed" bonus need tuning.
- Nobody borrows and the round is dead air; v1 mitigates by making zero bets a guaranteed last place.
- Negotiation may sprawl past 90s, or the loudest player may set an anchor price that homogenizes the market.
- Edge text must be genuinely load-bearing on the props, which is hand-authoring work per clip.

## Done means

Four phones, one five-minute clip: at least three loans are struck at two or more distinct rates without any rate appearing on the TV, at least one borrower defaults publicly at settlement, the TV renders the complete loan graph, and no player does arithmetic by hand.
