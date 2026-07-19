## Overview
Quiet Exit is a single-player finance roguelike that grafts the co-op extraction-horror loop of R.E.P.O. — carry heavy, fragile valuables to the exit without making noise that summons the monster — onto tax-efficient portfolio liquidation. For people who find rebalancing and capital-gains planning opaque and want to *feel* the tradeoffs.

## Problem
Selling appreciated assets is a game of hidden penalties: realized gains, short- vs long-term brackets, wash-sale rules, market impact. Most people liquidate blindly and eat avoidable tax. Portfolio tools show spreadsheets, not the tension of 'move too fast and you trigger something.' Nobody has made the *dread* of a loud sale legible.

## How it works
You hold a portfolio of lots — each a 'fragile valuable' with a cost basis, quantity, acquisition date, and current price. A run gives you a cash target to extract over N turns. Selling a lot is carrying it to the exit; the *noise* it makes equals the realized gain. Accumulated noise fills the Director's meter — the taxman — which escalates threats: bracket creep, a market-crash 'ambush,' a wash-sale trap if you rebuy too soon. Exceed your tax 'shatter budget' and the run ends. Between turns you draft roguelike tools: HIFO lot selection (carry quieter), tax-loss harvesting (muffle noise with a paired loss), a donor-advised-fund 'silent door,' a Roth-conversion gambit. Hit the cash target under budget to win; score by cash extracted minus tax paid.

## Technical approach
Stack: client-side TypeScript SPA (React + Zustand), no backend. Data model: `Lot{basis, qty, acquiredDate, price}`, `Portfolio`, `RunState{turn, cashTarget, noise, taxPaid, tools}`. Engine: each sell computes realized gain (short/long-term via holding period), applies a simplified progressive bracket table, slippage as a function of order size vs a per-asset liquidity number, and a 30-day wash-sale window check. Market drift is geometric Brownian motion seeded by the daily date so everyone gets the same run. Director escalation is a scripted curve keyed to cumulative noise. The hard part is balancing: real tax rules must stay recognizable yet produce tight, readable decisions — tune via a headless simulator that plays thousands of random runs and reports win-rate and decision entropy.

## v1 scope
- One preset portfolio archetype + a daily seeded run.
- Long/short-term gains, one bracket table, slippage, wash-sale trap.
- 6 draftable tools, Director meter, win/lose.
- Post-run summary: cash out, tax paid, 'if you'd dumped it all' comparison.

## Out of scope
- Real brokerage integration or importing actual holdings.
- State taxes, NIIT, AMT, options.
- Multiplayer / co-op (despite the R.E.P.O. lineage).

## Risks & unknowns
- Could read as edutainment homework rather than fun — the Director tension must carry it.
- Oversimplified tax model may teach wrong intuitions; add a clear 'not advice / simplified' banner.
- Balancing the noise economy is the make-or-break.

## Done means
A daily seeded run is playable end to end, the Director escalates with realized gains, at least one tool meaningfully changes optimal play, and the summary shows tax saved vs a naive full-liquidation baseline.
