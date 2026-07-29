## Overview
A local tool for retail investors that answers one question with their own money: does your speed help you? It imports your real trade blotter and simulates a family of counterfactual twins who placed every one of your orders k days later, then plots terminal wealth as a function of k. For anyone who suspects their portfolio is a monument to impulse but has never seen it quantified.

## Problem
Everyone knows the behavior-gap studies in the aggregate and nobody believes they apply personally. Brokerage apps show you returns, maybe a benchmark, never a counterfactual — because the counterfactual is where the shame lives. There is no way to see whether your P&L came from picking good things or from timing, and the two failure modes require opposite fixes.

## How it works
Import a blotter, get a delay-response curve: terminal wealth for k ∈ {0, 1, 3, 7, 30, 90} trading days, with a block-bootstrap confidence band. A curve that rises with k means patience is free money and your reflexes are a tax. A peak at k = 0 means you actually have short-horizon edge and should stop reading self-help. Alongside it: per-trade regret (execution price at t vs t+k), an impulsivity score, and reference twins — "never sold anything" and "bought the index with the same cash flows."

Then the live half. A held-order queue: you write down an order you want to place *right now*, with a thesis, and it sits. Thirty days later you get an email asking whether you still want it. Your answer is logged. Over a year you learn the single most useful number about yourself — what fraction of your convictions survive a month.

## Technical approach
Python, SQLite, a static HTML report. Import adapters for Schwab/Fidelity CSV, Interactive Brokers Flex Query XML, and Robinhood exports, normalized to a canonical blotter: (timestamp, symbol, side, quantity, price, fees, currency). Optional SnapTrade for live sync. Prices from Stooq's free daily CSV endpoints with Tiingo as a paid fallback; use split- and dividend-adjusted series consistently and reinvest dividends into the cash ledger.

The simulation engine replays the blotter with each order's execution shifted to the first trading day ≥ t+k, filled at that day's typical price (H+L+C)/3 as a VWAP proxy. Buys hold dollar notional constant (share count moves); sells hold *position fraction* constant, since by then position sizes have diverged from reality.

That divergence is the hard part. Once k > 0 the counterfactual portfolio's state drifts: orders become infeasible — selling shares you no longer hold, buying with cash you don't have. Maintain an explicit cash ledger and margin flag; scale infeasible buys down to available cash, sells down to the held position, and log every shortfall. Report a **policy fidelity** metric: the fraction of intended order notional actually executed. When fidelity drops below ~85%, the report says so loudly, because the twin has stopped being a fair comparison and become fan fiction.

## v1 scope
- One import adapter (Fidelity CSV) plus a hand-written blotter format
- Long equity and ETF positions only, USD only
- Delay curve for five k values with bootstrap bands, plus the buy-and-hold twin
- Held-order queue with local cron + SMTP email at 30 days

## Out of scope
Options, futures, crypto, short sales, multi-currency, tax-lot/wash-sale accounting, intraday delays under one day, any brokerage write access.

## Risks & unknowns
A single lucky or unlucky trade can dominate a small blotter — the bootstrap band may be too wide to say anything, which is itself an honest result. Delisted tickers break price lookups. The tool can be actively harmful if a rising curve talks someone into hindsight-driven strategy changes; the report should show the band, not just the line.

## Done means
Importing a real multi-year Fidelity CSV produces a delay-response curve with confidence bands in under 60 seconds, policy fidelity is reported for every k, and the held-order queue has round-tripped one real order to a 30-day email and recorded the answer.
