## Overview
A hidden-role deduction game for 4 players themed on expense-report fraud. Every phone privately shows the same itemized report; one player's copy has a single line inflated. The group must talk their way to the true grand total and out the padded ledger.

## Problem
Social deduction almost never uses *numbers* as the hidden signal. There's an untapped delight in an imposter who sees cooked books, doesn't fully know it, and has to bluff a total they were never shown.

## How it works
The **host screen** shows an expense report as six line-item *labels* only — Taxi, Hotel, Dinner, Supplies, Coffee, Tips — with **no amounts**. Each **phone** privately shows all six amounts. Three players see identical honest numbers; one player — the **Padder**, not told they're it — has exactly one line inflated (e.g. Hotel $220 instead of $120).

**Talk phase (60s):** players describe the report qualitatively — 'Hotel's our biggest line, right?' 'Dinner and Taxi look about even.' Nobody may read raw numbers aloud (enforced socially by the rules card). The Padder's private view makes some of their comparisons subtly wrong, and if they start to suspect their Hotel line runs hot, they face the core dilemma: submit their honest-to-them total and stick out as the high outlier, or shade toward the total everyone else seems to imply — which is itself a tell if they overshoot.

**Submit:** each phone privately enters (a) its computed grand total and (b) a vote for who holds the padded report. The host reveals **anonymized totals** (one runs high) beside the vote tally. Honest players win by fingering the Padder; the Padder wins by escaping. The delicious twist: the Padder can only hide by inferring the *true* total from others' qualitative hints — a number their own ledger never shows them.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `report {labels[], amounts[]}`, per-player `ledgerView = amounts + optional single padded cell`; `submissions{playerId: {total, vote}}`. Sync is trivial — a talk timer plus one private submission barrier, then a reveal broadcast. The genuinely hard part is **divergence calibration**: the padded line must be big enough to detect through discussion yet small enough to be deniable, and the report must be composable to a total in someone's head under time pressure. Secondary hard part: preventing accidental public number leaks (mitigated by hiding amounts on the host and a no-numbers-aloud rule).

## v1 scope
- Exactly 4 players, one round.
- One hand-authored 6-line report, one padded line, fixed pad size.
- 60s talk timer, private total + vote submission, reveal screen.

## Out of scope
- Multiple report packs, variable pad sizes, currencies.
- Multi-round scoring, imposter teams, per-player unique ledgers.
- Any amount rendering on the host.

## Risks & unknowns
- Mental arithmetic under a timer may add friction / exclude some players.
- If the pad is obvious, the Padder is instantly caught; too subtle and totals cluster.
- 'No numbers aloud' is a social rule, not enforced — leaks break the round.

## Done means
Four phones join, three show identical amounts and one shows a single-line-padded ledger; players discuss with no raw numbers spoken, submit private totals and votes, and the reveal shows the padded total as an outlier while the vote surfaces the Padder better than chance in playtests.
