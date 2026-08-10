## Overview
A single-player idle/tycoon game where the world simulation is a real historical limit order book, replayed message-by-message. You are a market maker: you set spread width, quote size, and inventory skew, then you *watch*. The mischief is the scoreboard — the game refuses to show you live P&L. It shows you a **toxicity meter**: what fraction of your fills came from counterparties who were right. For anyone who has ever wondered why "just quote both sides and collect the spread" doesn't print money.

## Problem
Market microstructure is taught with equations and traded with black boxes. There is no toy that lets you *feel* adverse selection — the fact that your fills are not random, they are selected against you. Existing trading sims are candlestick-clicking games on daily bars, which teach nothing about queue position, latency, or why your inventory is always wrong at exactly the wrong moment.

## How it works
Pick a symbol and a trading day. The book replays at a speed you choose (1×, 60×, or overnight-idle at 3600×). Your only controls are four dials: half-spread (in ticks), quote size, inventory skew coefficient, and a cancel-repost latency budget. You get filled when the replayed market order flow crosses your resting quote *and* your simulated queue position is reached. Every fill is scored 500ms later: did the mid move against you? Toxicity = share of notional filled that was adverse. Between sessions you spend earned "seat credits" on unlocks that are all real microstructure tools — a queue-position estimator, a microprice signal, an odd-lot filter, a hidden-liquidity detector — a deckbuilder-ish meta layer where each upgrade changes the *information* you get, never the edge directly. Runs end when inventory limits or drawdown breach; the post-mortem shows the three worst fills with the book snapshot at that instant.

## Technical approach
Data: LOBSTER free sample days (AAPL/MSFT/INTC/AMZN, level-10 message + orderbook CSVs) for v1; Nasdaq ITCH 5.0 sample files as stretch. Parse to a compact columnar store (Parquet via DuckDB-wasm) so the whole thing runs client-side in a browser tab. Core loop is an event-driven matching engine in TypeScript with a price-level array + FIFO deque per level; your orders are inserted into the real queue at the back of the level with a size-ahead counter that only decrements on cancels/executions at that level — this is the fidelity that makes fills honest. Fair-value proxy = size-weighted microprice; adverse-selection label = sign(mid_{t+500ms} − fill_price) × side. Render the book as a scrolling heatmap on canvas, quotes as two ticks in the ladder.

The genuinely hard part: queue position. LOBSTER gives you level updates, not per-order identity, so you must infer whether a cancel came from ahead of or behind you. v1 uses the standard "cancels are uniformly distributed in the queue" approximation and displays your queue estimate with error bars — the uncertainty is part of the game.

## v1 scope
- One symbol, one day, one dial (half-spread) — the other three fixed
- Replay at 60× only, no save/resume
- Toxicity meter + end-of-run P&L reveal, no upgrades
- Text ladder, no heatmap

## Out of scope
- Live or delayed real-time data, real brokerage anything
- Multi-venue, hidden orders, auction opens/closes
- Options, futures, crypto

## Risks & unknowns
- Queue-position error may dominate the simulated edge, making outcomes feel arbitrary rather than instructive
- LOBSTER sample licensing for redistribution — likely must ship a fetch script, not the data
- Idle pacing vs. attention: 60× replay of one session is ~7 minutes, which may be too short for the idle framing

## Done means
A browser tab replays one LOBSTER day at 60×, my resting quotes fill against real order flow with an inferred queue position, and the end screen shows toxicity %, realized spread capture, and the three worst fills with a book snapshot — and widening my spread visibly lowers toxicity while lowering fill count.
