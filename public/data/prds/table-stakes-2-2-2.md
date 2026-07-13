## Overview
A dinner-table party game for 3-6 people who are staring at a menu waiting to order. The shared host screen (a phone propped up, a laptop, or the TV) shows the menu as a numbered list; every player's phone is a private betting slip. It turns the dead five minutes before ordering into a hidden-information wager on your own friends' predictability.

## Problem
Deciding what to order is passive, silent, and slightly boring — everyone reads the same menu alone. Meanwhile the table already *knows* Dave always gets the burger. That shared knowledge is latent competition nobody has ever cashed in on.

## How it works
Each player starts with a stack of chips. The round has two simultaneous private phases:

1. **Lock your order.** On your phone you privately pick your real order from the numbered menu. Nobody sees it. You can order the obvious thing — or bluff and order something weird to dodge the predictors.
2. **Bet the table.** Still privately, you place variable-size chip bets predicting what each *other* player locked. Big stake = big conviction.

When every phone is locked, the host screen flips to a reveal grid: everyone's real order beside everyone's bets. Payouts: a correct prediction pays 2× your stake. But if **nobody** correctly predicted *your* order, you collect a wildcard bounty from the pot — so ordering off-menu-meta is a real strategy, and the game becomes predictor-vs-bluffer.

**Private (phone):** your locked order, your bet slip, your chip stack, your current bounty risk.
**Shared (host):** the menu, the pot size, an anonymized "3 of 4 locked" progress bar, then the full reveal grid and payouts.

## Technical approach
A host browser tab + phone PWAs + an authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{menu[], pot}`, `Player{id, chips}`, `Order{playerId, itemId}` (server-held, hidden), `Bet{fromId, onId, itemId, stake}`. Sync is commit-then-reveal: the server accepts orders and bets but never broadcasts them until all phones report `locked`, then computes payouts server-side and pushes one reveal payload. The genuinely hard part isn't real-time twitch sync — it's a *fair simultaneous reveal* with no leakage (server is sole authority; phones get only their own state until the barrier releases) and menu ingestion (v1 sidesteps this by hard-coding a menu).

## v1 scope
- 3 players, one hard-coded 8-item menu, one round.
- Two phases: lock order, place at least one bet on each opponent.
- Server computes 2× correct-prediction payouts + wildcard bounty.
- Host reveal grid with final chip counts.

## Out of scope
- OCR / scanning a real menu.
- Multi-round bankrolls and persistent leaderboards.
- Odds-scaling by item popularity.
- Tie-break subtleties beyond even split.

## Risks & unknowns
- If a friend is *totally* predictable, predicting them is boring and cheap — the wildcard bounty must be juicy enough to make bluffing tempting.
- Chip-economy balance (bounty vs. 2× payout) needs playtesting with 3 vs. 6 players.
- Works best with people who know each other; cold groups have nothing to predict.

## Done means
Three phones join a room, each privately locks one order and at least one bet per opponent, the host reveals all orders simultaneously, and the server correctly pays 2× on hits plus wildcard bounties — with no phone ever seeing another's order before the barrier releases.
