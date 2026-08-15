## Overview
A local-first web tool for travelers, remote workers paid abroad, eBay/AliExpress importers, and anyone with a foreign-currency subscription. Feed it a statement export; it decomposes every non-domestic charge into the components of its cost and tells you, in dollars, what each one took.

## Problem
A foreign card charge has four different skims stacked on top of each other and your statement shows none of them separately:
1. The **network's** wholesale rate (Visa and Mastercard each publish theirs daily, publicly)
2. The **issuer's** foreign transaction fee (0%–3%, buried in a cardmember agreement)
3. **Settlement lag** — the rate applied is the one on the *processing* date, one to four days after you actually spent, so currency drift silently adds or removes money
4. **Dynamic Currency Conversion** — the terminal asked "charge in USD?" and someone said yes, applying a merchant-side rate that is routinely 4–8% off
The arbitrage: the reference rates are free and public, but reconciling them against a real statement line-by-line is tedious enough that literally nobody does it. The people who lose the most from this — nomads and small importers — are exactly the people without a treasury desk.

## How it works
1. Drop in a CSV/OFX/QFX export (or a PDF statement, parsed).
2. The tool identifies foreign-currency lines: an original amount + currency code, or a USD amount whose merchant country differs from your card's.
3. For each, it pulls the network's published rate for a window of candidate processing dates and solves for which date's rate best explains the posted USD amount.
4. It reports the **implied all-in rate**, then splits the spread: `implied = network_rate(t) × (1 + issuer_fee) × dcc_factor`. A residual over ~1.5% that can't be explained by any date in the window is flagged as DCC or a merchant-side conversion.
5. Output: a year-view waterfall — total foreign spend, network spread, issuer fees, lag drift (signed! sometimes it pays you), and DCC losses — plus a ranked list of individual worst offenders ("that €340 hotel in Lisbon: 6.1% over reference, DCC likely, cost you $19.40").

## Technical approach
Stack: single-page SvelteKit app, everything client-side; statement bytes never leave the browser. Rate data comes from Visa's public exchange-rate calculator endpoint and Mastercard's settlement-rate lookup, both of which accept (from, to, date, bank fee) and return a rate; a small scheduled worker mirrors both into a static JSON-per-month file on a CDN so the app makes no cross-origin calls at runtime and works offline. Parsing: `ofx-js` for OFX/QFX, PapaParse plus per-issuer column heuristics for CSV, and a regex/positional parser for the three or four common PDF layouts via pdf.js text items. Merchant country inference from the descriptor tail and MCC when present. The date-solve is a tiny argmin over a 5-day window of `|posted_usd − foreign_amt × rate(d) × (1+fee)|`; ties resolved by preferring the earliest date. Data model: `Txn{date, postDate?, merchant, foreignAmt, foreignCcy, usdAmt}` → `Attribution{refRate, refDate, impliedRate, issuerFeePct, lagDriftUsd, unexplainedPct}`. Hard part: issuer fee is unknown per card, so it must be *estimated* — fit a single fee parameter across all of a card's foreign transactions by minimizing total unexplained residual, then hold it fixed. Cards with a genuine 0% fee and heavy DCC exposure will fight that fit; the answer is a robust (median-based) estimator and showing the fitted fee to the user for confirmation.

## v1 scope
- CSV only, two issuer formats
- Visa rates only
- One card at a time, fee fitted then user-editable
- Single output table plus one total

## Out of scope
- Bank API/Plaid linking
- ATM withdrawals and cash advances
- Crypto or multi-currency accounts (Wise, Revolut ledgers)
- Recommending cards

## Risks & unknowns
The rate endpoints are public but unofficial and may throttle or change shape — hence the mirrored static snapshots, which also make the tool auditable. Statements frequently omit the original foreign amount, which makes attribution impossible; the app must say so per line rather than guess. Legal risk is nil, but accuracy claims must be hedged: this estimates, it doesn't audit.

## Done means
Given a real statement with at least 15 foreign charges including one known DCC transaction, the tool flags that transaction as DCC, and its computed total foreign-exchange cost lands within $2 of a hand-computed ground truth for the same statement.
