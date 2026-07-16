## Overview
Nerve is a real-time all-pay escalation auction for 3-6 people in one room, on a shared host screen with phones as private paddles. It takes the notorious "dollar auction" / war-of-attrition — the tensest idea in game theory and the most miserable to run at a table — and compresses it into a silent 45-second nerve test.

## Problem
Escalation auctions are electric on paper and awful in person: they drag, someone always feels bullied into overpaying, and everyone reads everyone else's flinch. The whole point — bluffing about how deep your pockets go — collapses when bids are shouted and wallets are visible.

## How it works
The host TV shows one Lot ("The Vault — worth 50") and a single price that ticks UP by 1 credit/second. Every player presses-and-HOLDS a button on their phone to stay in. While you hold, YOU personally accrue cost equal to the current price — all-pay: you eat what you racked up even if you lose. Release = you fold, your spend is locked, you're out for good. The last player still holding wins the Lot's value; everyone else just paid for nothing.

Private on each phone: your SECRET starting budget (dealt differently to each player, 40-120 credits), your live accrued cost, and a pulsing "you'll bust in Xs" warning as you approach your budget; hit it and you auto-fold at your max. Shared on the host: only the rising price and an anonymized "◼◼◼ still in" block tally — no names, no budgets. You cannot see who's holding or how rich they are. That hidden budget is the read: is the last block someone bluffing on 45 credits or a tycoon on 120?

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object). Model: Room{lotValue, price, tickMs, phase}; Player{id, budget(secret), holding, accrued, folded}. The server owns the clock, ticks every 250ms, increments accrued for each holder, and checks budget-bust. Phones emit only debounced hold/release events. Hard part: release fairness under jitter — a 150ms lag shouldn't cost you the win. Mitigate by timestamping releases on server receipt with a small fixed grace, and freezing the clock the instant the tally hits 1. If the last two releases land in the same tick → both fold → Lot VOIDED (everyone pays, nobody wins) — a delicious outcome, not a bug.

## v1 scope
- 1 Lot, fixed value, 3-4 players, one round
- Random secret budgets per phone
- Server-owned rising price + hold/release
- Host shows price + anonymized block tally + winner banner

## Out of scope
- Multiple lots, budget carryover, re-buys
- Spectators, custom sound, rematch flow
- Public leaderboards

## Risks & unknowns
- Could feel like pure chicken; hidden budgets must carry the deduction
- Network jitter fairness at the release moment
- "Everyone paid for nothing" can feel mean — lean into it as comedy

## Done means
Four phones join; all hold; the price rises on the host; releasing folds you and locks your visible spend; running out of budget auto-folds you at your max; the last holder is credited the Lot's value; and a simultaneous double-release correctly voids the Lot with everyone charged.
