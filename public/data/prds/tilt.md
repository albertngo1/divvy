## Overview
Tilt is a solo, offline game that turns your actual trading history into a roguelike about your own behavioral biases. You import a brokerage CSV; Tilt reconstructs every round-trip trade and stages your worst-behaving stretch as a boss rush, where each recurring mistake pattern is an enemy you fight by making the disciplined counterfactual choice. For retail investors who suspect their own psychology — not the market — is their biggest drawdown.

## Problem
Everyone knows the clichés (cut losses, let winners run) and nobody knows if *they personally* violate them. Brokerage apps show P&L, never behavior. The disposition effect, revenge trading after a loss, and averaging down into losers are invisible in a returns chart but obvious in the sequence of decisions — if someone reconstructs it. Budget apps did this for spending ("you spent $X on coffee"); nothing does it for the emotional side of your trades, and a dry report gets closed instantly. A game gets replayed.

## How it works
You drop in a trades CSV (Fidelity/Schwab/Robinhood export). Tilt pairs buys/sells into round-trips, computes per-trade hold time, realized return, and position sizing relative to your average, then mines patterns: sold-winners-early (disposition), added-to-losers (Martingale), sized-up-after-a-loss (revenge), overtrading clusters. Each detected pattern becomes a "boss" with HP proportional to how much it cost you. In a fight, Tilt replays the real market context at that decision point and offers you the disciplined alternative; picking it chips the boss's HP and shows the counterfactual equity curve. Beat all bosses and you unlock a "clean run" scorecard: what your year would've returned with the biases removed, vs. buy-and-hold and vs. your actual result.

## Technical approach
Local web app (React + a single WASM/JS engine), no account, CSV never leaves the browser. Parse trades, FIFO-pair into round-trips, join against free daily OHLC (Stooq CSV or yfinance-cached data bundled for the tickers in your file) to compute counterfactuals. Bias detectors are simple, transparent rules with thresholds (e.g. disposition = median winner hold << median loser hold, tested for significance). Boss HP = summed realized cost attributable to that pattern. The hard part is honest counterfactual construction — "what if you'd held" needs a defensible exit rule (e.g. hold to your own average winner-hold, or to a trailing stop) so the game teaches a real lesson rather than hindsight-cherry-picking the top tick.

## v1 scope
- CSV import + FIFO round-trip pairing for US equities
- Three bias detectors: disposition, revenge-sizing, averaging-down
- One counterfactual rule per bias + equity-curve overlay
- Boss-rush UI, clean-run scorecard vs buy-and-hold

## Out of scope
- Options, futures, crypto, multi-currency
- Live brokerage API sync
- Prescriptive advice / anything regulated

## Risks & unknowns
- CSV format sprawl across brokers
- Counterfactual exit rule must be defensible, not lucky
- Survivorship/delisted tickers missing from free OHLC

## Done means
I import a real 200-trade year, Tilt correctly surfaces at least one true bias (verifiable by hand — e.g. winners held 4 days, losers held 40), stages it as a boss, and the clean-run scorecard shows a plausible counterfactual return with the equity curves overlaid — all without any data leaving the browser.
