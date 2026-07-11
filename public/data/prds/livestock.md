## Overview
Livestock is a darkly funny personal-finance toy for anyone who's lost track of what they subscribe to. Each recurring charge becomes a pen animal with stats, appetite, and personality; managing your money becomes ranching. For people who bounce off spreadsheets but will absolutely min-max a monster barn.

## Problem
Subscription creep is invisible by design — $9 here, $14 there, autopay forever. Traditional trackers show a boring list you close and ignore. The itch is emotional, not informational: you need to *feel* the drain and get a dopamine hit from cutting it. Passive statement-reading becomes an active, competitive husbandry game.

## How it works
Import transactions; the app detects recurring merchants and hatches each as a monster. Monthly, every creature demands its feed (the real charge) from your barn's food store (a budget you set). Well-used services grow fat and shiny (you tag 'I used this'); dormant ones bloat, go feral, and start eating extra (price hikes). Actions: Feed (keep), Breed (merge two into a cheaper bundle goal), or Cull (guided cancel flow with the cancellation URL). A monthly 'roundup' scores your total feed cost and posts it to a friends leaderboard — lowest barn upkeep wins, biggest cull streak gets a badge.

## Technical approach
Stack: React Native (Expo) + local SQLite; a small Node sync service only if using an aggregator. Data: Plaid Transactions API (or a manual CSV / receipt-forward fallback for the privacy-conscious) → recurring-charge detection via merchant-name normalization + interval clustering (group charges by normalized payee, detect ~30/365-day cadence with tolerance, confidence-score each as a subscription). Monster generation is deterministic: hash(merchant) seeds a procedural sprite (color/horns/size from amount + category) so 'Netflix' always looks the same for everyone. Creature stats map directly to real numbers — appetite = monthly cost, weight = months active, feralness = days-since-you-marked-it-used. Hard part: recurring-charge detection precision (annual renewals, free-trial-to-paid transitions, variable-amount utilities) without false monsters that make users distrust it.

## v1 scope
- CSV / manual import + recurrence detection
- Procedural monster per subscription, monthly feed cycle
- Cull flow that opens the cancellation page
- Single-player 'total upkeep' number + streak

## Out of scope
- Live Plaid integration (start manual)
- Multiplayer leaderboard, breeding/bundles
- Any auto-cancellation on the user's behalf

## Risks & unknowns
- Bank-linking is a trust/liability minefield — manual-first sidesteps it.
- Recurrence false positives erode the whole fantasy; needs a quick 'not a subscription' correction.
- Cute framing could trivialize real financial stress — tone must stay playful, not preachy.

## Done means
A user imports a statement CSV, sees their real subscriptions rendered as a barn of distinct monsters with correct monthly appetites, marks two as unused (watch them go feral), taps Cull on one to land on its actual cancellation page, and sees their monthly upkeep number drop.
