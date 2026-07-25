## Overview
A local-only browser game for one player: drop in 12–24 months of your own bank CSV and it compiles into a posture duel. Your buffer is the posture bar. Your recurring bills are wide, readable attacks. Your vet bill is a red 危 you cannot parry. For anyone who has read a budgeting dashboard, nodded, and felt nothing.

## Problem
Budgeting apps are ledgers with pie charts. They tell you what left your account, categorized into buckets you didn't choose. What they never tell you is the only thing that matters: *which shocks were learnable*. A $900 quarterly insurance premium and a $900 emergency root canal look identical in a spending report and are completely different financial objects. One you could have seen coming for eleven weeks. The other you could only have absorbed with a buffer. No tool separates them, so no tool tells you how much buffer you actually need.

## How it works
Parse the CSV, cluster outflows by normalized merchant descriptor, and score each cluster's *predictability*. That score becomes the attack telegraph. Play runs as a ~90-second fight, roughly 7 seconds per month of history:

- **Parryable (blue)** — highly recurrent, low amount variance. Telegraphs ~1000ms. A well-timed press = "pre-funded," zero posture damage.
- **Deflectable (yellow)** — semi-regular: quarterly premiums, annual renewals, the twice-a-year dentist. Telegraphs ~350ms. Parryable if you learned the rhythm.
- **Unblockable (red 危)** — no detectable period. No parry exists. You dodge, which costs raw buffer; if buffer < amount, you eat posture damage.

Posture regenerates at (income − fixed outflow)/day. Posture break = the day your real balance went negative, and the game shows you the date. Afterwards: a **deathblow report** — parry rate, the ranked list of attacks that were parryable but you never learned, and a sinking-fund figure sized to cover the observed unblockable distribution at the 90th percentile.

## Technical approach
Svelte + canvas, no backend, `<input type="file">` and papaparse — the money never leaves the tab. Descriptor normalization: strip store numbers, trailing dates, and payment-processor prefixes via regex, then bucket on the normalized string. Recurrence detection per cluster: build the daily impulse train of that merchant's charges, take its autocorrelation, and also histogram inter-arrival gaps against tolerance windows around 7/14/30/91/365 days. Predictability = 1 − normalized entropy of the gap distribution, penalized by the coefficient of variation of the amounts. Telegraph frames are a monotone map of that scalar — never hand-tuned per user.

The genuinely hard part is two-sided. First, real descriptors are filthy and amounts drift (a utility bill swings ±40% seasonally) so naive clustering shatters one bill into six merchants. Second, the difficulty curve must be *derived* from the statistics, because the moment you tune it for feel, the game is lying about someone's finances.

## v1 scope
- One CSV shape: date, description, amount.
- One fight, 12 months, three attack tiers, keyboard only.
- Posture bar seeded by a manually typed starting balance.
- Deathblow report: parry rate + the sinking-fund number.

## Out of scope
Plaid or any bank linking. Mobile. Income modeling, investments, categories, advice. Multiple save slots.

## Risks & unknowns
Gamifying money stress can read as cruel rather than clarifying — tone of the report matters more than the combat. A misfiring recurrence classifier produces an unfair fight, which destroys trust instantly. CSV export formats vary enough that v1 may only work with two or three banks.

## Done means
I drop in my real statement and get a fight where Netflix telegraphs a full second, the March insurance premium telegraphs briefly enough that I miss it the first run, and the November vet bill comes in red with no parry — and the report's sinking-fund figure is one that would in fact have prevented the posture break the game just showed me.
