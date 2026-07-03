## Overview
Cold Feet is a personal "anti-portfolio" tracker. Where GitHub's LangAlpha ("Claude Code for Investing") helps you *make* trades, Cold Feet tracks the trades you *didn't* — the ones you researched, hovered over, and chickened out of — and computes the counterfactual P&L of the path not bought. For retail investors curious whether their gut is a genius or a coward.

## Problem
Everyone remembers the stock they "almost bought at $12." Nobody logs it, so the memory is pure survivorship bias — you recall the moonshots you missed and forget the ones you dodged. Without a ledger of your near-misses, you can't tell if your hesitation is discipline or a systematic tax on your returns.

## How it works
When you're tempted, you log a "cold feet" entry: ticker, hypothetical size, direction, and a one-line why-not. That's the whole capture ritual. Cold Feet timestamps it and marks the entry price. It then tracks each near-miss as a phantom position, showing live counterfactual gain/loss and an aggregate "Regret Index" — your total would-be P&L, plus a "Coward's Batting Average" (share of skips that would have made money). A monthly recap surfaces your best dodge and your worst chicken-out, so hesitation becomes a measurable, improvable behavior instead of a vibe.

## Technical approach
Stack: SvelteKit + SQLite (or plain localStorage for v1). Prices from a free tier — Alpha Vantage, Finnhub, or yfinance-style scraping — polled daily; entries store `{ticker, side, qty, entry_price, entry_ts, reason}`. Counterfactual P&L is `(current − entry) × qty × side`, aggregated with per-entry and portfolio views; the Regret Index normalizes against what a same-dollar S&P index buy would've returned over the same window, so it isolates *stock-picking* regret from just-being-in-the-market. Hard part: honest entry capture — the value dies if logging is friction, so the flow must be a 5-second quick-add (a browser extension button on any ticker page is the ideal, if scope allows).

## v1 scope
- Quick-add form: ticker, direction, size, reason
- Daily price refresh via one free API
- Per-entry counterfactual P&L + aggregate Regret Index
- Sort near-misses by biggest regret / biggest dodge

## Out of scope
- Real brokerage integration or actual trading
- Options, crypto, FX (equities/ETFs only at first)
- Tax-lot accounting, dividends, splits handling beyond a naive adjust

## Risks & unknowns
- Free price APIs rate-limit and go stale on delistings/splits
- Behavioral: does anyone honestly log fear, or only their good calls?
- Regret framing could be genuinely demoralizing rather than instructive

## Done means
I log 'almost bought NVDA at $X, 10 shares, too pricey,' and a week later the entry shows the correct phantom P&L and updates my Regret Index against the same-period SPY benchmark.
