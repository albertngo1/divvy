## Overview
Apex turns paying down debt into a Monster Hunter-style hunt. Each debt (card, loan, that one 29% store card) is rendered as a monster with a health bar equal to its balance and a glowing weak point equal to its interest rate. For anyone grinding out debt payoff who finds spreadsheets demoralizing.

## Problem
The avalanche method (attack highest-APR debt first) is mathematically optimal but emotionally flat — a spreadsheet gives no dopamine, so people default to random payments or the slower snowball. Monster Hunter's genius is making a long grind feel like escalating mastery via telegraphed weak points and satisfying carves. Grafting that loop onto debt makes the *correct* strategy also the *fun* one.

## How it works
You enter your debts once. Apex ranks them by APR and marks the highest as the current 'apex predator' — the beast you should be hunting. Each month you log a payment; the tool computes the split between principal (damage) and interest (the monster's regen/armor), animates the health bar dropping, and awards 'carves' quantified as dollars of future interest you avoided by hitting the weak point instead of spreading fire. Kill a monster (zero the balance) and you get a trophy + a permanent buff (freed-up minimum payment auto-rolls into the next hunt — literal snowball-onto-avalanche). A hunt log shows your longest streak and total interest slain.

## Technical approach
Pure client-side: Svelte + IndexedDB, no accounts, no bank linking (money data stays local; that's a feature). Core math is a straightforward amortization engine — given balance, APR, min payment, and your logged payment, compute interest accrued, principal reduction, and counterfactual interest-if-you'd-paid-a-lower-APR-debt-instead (that delta is the 'carve reward'). Weak-point targeting = sort by effective APR including fees. The interesting bit is the counterfactual valuation loop that makes the reward number honest: it simulates the alternate allocation to price each dollar of your payment in avoided-interest terms, so the game never lies to make you feel good. Monsters get procedural sprites seeded by debt name hash (SVG, no art budget).

## v1 scope
- Add debts (balance, APR, min payment)
- Auto-flag the apex (highest-APR) target
- Log a monthly payment, animate damage + show carve reward
- Kill = trophy + auto-roll freed minimum into next target

## Out of scope
- Bank/Plaid sync (manual entry only)
- Multiplayer / leaderboards
- Snowball vs avalanche toggle debates — v1 is avalanche-only

## Risks & unknowns
- Gamifying debt could feel tone-deaf to someone in real distress; tone must stay light, never cutesy about hardship
- Manual entry friction — will people log monthly?
- Making the counterfactual reward legible without a finance lecture

## Done means
With three seeded debts of different APRs, logging a payment against the highest-APR 'monster' drops its health bar by the correct principal amount, displays a carve reward equal to the verified interest saved versus paying the lowest-APR debt, and zeroing a balance rolls its freed minimum into the next target automatically.
