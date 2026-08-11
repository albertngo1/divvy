## Overview
A research tool and public leaderboard that scores Polymarket wallets not by realized PnL but by *latency-adjusted* PnL: what a follower would actually have earned entering Δ seconds after the whale, at prices really available on the book, net of the impact the alert itself caused. For anyone tempted by a "copy whale trades in one tap" Telegram bot, and for the people building them who'd like a real backtest.

## Problem
The copy-trading pitch is that a wallet made $1.4M so you should mirror it. That number is a fiction for a follower. It ignores three things: the whale's fill is usually the last good fill (a size order eats the book), the alert channel moves the price before you click, and a large share of top-PnL wallets are market makers whose edge is spread capture that cannot be mirrored at all. Nobody publishes the one curve that matters — edge as a function of your delay — because computing it requires replaying the tape, not reading a PnL API.

## How it works
For every trade by a tracked wallet: take timestamp t, market, side, size, price p. Reconstruct the executable price for a follower entering at t+Δ for Δ ∈ {1s, 5s, 30s, 60s, 5m, 30m, 2h}, walking the reconstructed book for a fixed follower size ($500 default, configurable). Hold to market resolution. Aggregate into a decay curve per wallet: PnL(Δ), plus a fitted half-life — the delay at which half the edge is gone. Rank by PnL(60s), the honest number for someone reacting to an alert. Three flags fall out for free: **maker** (edge is two-sided quoting, uncopyable), **impact** (edge inverts once follower size exceeds the book), and **alert-shadowed** (a repeatable price move in the 5–90s after this wallet trades, i.e. you are the exit liquidity for their followers). Output is a static site: one decay chart per wallet, a scatter of raw PnL vs 60s PnL, and a headline half-life distribution.

## Technical approach
Data: Polymarket's public data API (`data-api.polymarket.com` trades endpoint) for the full trade tape per market, the CLOB API for market/token metadata and resolution outcomes, and the Goldsky Polygon subgraph for on-chain fills as a cross-check on wallet identity. Ingest into DuckDB (Parquet on disk, one file per month) — the whole tape is small enough for a laptop. Book reconstruction: Polymarket is CLOB with public trade prints but no free historical L2 snapshots, so v1 approximates the executable price with a size-aware model fit from the tape — VWAP of prints in the [t+Δ, t+Δ+30s] window with a square-root impact term calibrated per market from observed print sequences, and a documented uncertainty band. Impact detection: event-study of mid-price in the ±180s window around each whale trade, aligned and averaged per wallet, with a permutation test against random-time windows to prove the move is real. Front end: static Astro + Observable Plot, regenerated nightly by a cron job.

Hard part: the book approximation. Without L2 history the follower's fill price is an estimate, and the whole product's credibility rests on it — so the calibration and its error bars have to be published, not hidden, and every claim quoted as a range.

## v1 scope
- Top 200 wallets by volume over the last 6 months, resolved markets only
- Δ grid of 5 values, single $500 follower size
- One page: raw PnL vs 60s-adjusted PnL scatter, per-wallet decay chart
- Maker flag via two-sided-quoting ratio

## Out of scope
- Live alerting, executing anything, Kalshi/other venues, unresolved markets, portfolio construction across whales, fees/gas modeling beyond a flat constant

## Risks & unknowns
- Impact model error could swamp the effect it's measuring; needs a holdout test on markets deep enough to sanity-check
- Wallet identity is fragile — one trader across five addresses looks like five mediocre traders
- Polymarket API rate limits and schema drift; historical depth may be shallower than needed
- Legal/geographic access varies; this is a research artifact, not advice

## Done means
The site publishes a decay curve for 200 wallets where at least one visibly celebrated whale shows positive raw PnL and negative PnL at Δ=60s, the impact event-study passes its permutation test at p<0.01 for the flagged wallets, and the whole pipeline rebuilds from scratch in under 20 minutes on a laptop.
