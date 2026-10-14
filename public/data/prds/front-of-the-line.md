## Overview
A solo daily puzzle game built on real on-chain history. Each day you get one historical Ethereum block's worth of pending DEX swaps (trimmed to 8–15 transactions) and act as the block builder. It's for crypto-curious people who've heard 'MEV' and want to feel how it works, without deploying a bot.

## Problem
MEV explainers are walls of text, and trending flashloan-bot repos promise free money (often as scams). Nobody gives you a safe sandbox where you can *be* the extractor and learn intuitively why slippage tolerance is a price you set for strangers.

## How it works
- Board: a column of transaction cards (who, pool, amount in, min amount out = slippage) and the current reserves of 1–3 Uniswap v2-style pools.
- Drag cards to reorder them. Insert your own buy/sell cards using a capped flash-loan budget.
- Each move simulates live: reserves update with constant-product math and transactions whose minOut fails turn red and revert (and you eat their gas).
- Score = your profit − gas. Then the reveal: the real block's ordering, the real builder/searcher's profit (from the archive), and your percentile against other players.
- Puzzle wrinkles come from real history: two searchers fighting over the same victim, a back-run arbitrage between two pools, a victim with 0.1% slippage who simply can't be sandwiched.

## Technical approach
- Offline pipeline (Python): pull candidate blocks with known sandwiches from a public dataset (e.g. libmev / ZeroMEV APIs or our own detection over Ethereum archive logs via a provider like Alchemy). Decode Uniswap V2 `Swap` events and reserves at block start (`getReserves` at block−1). Strip the searcher's own transactions to leave the victims.
- Daily puzzle JSON `{pools:[{r0,r1,fee}], txs:[{id, pool, dir, amtIn, minOut, gas}], realProfit}`.
- Client: React + a tiny deterministic AMM engine (bigint math, 0.3% fee) that replays exactly to wei, validated against on-chain outputs.
- Optimal-solution solver for the 'par' score: the order space is small, so use branch-and-bound over permutations, plus a golden-section search on the front-run size per victim, since profit is unimodal in size given the victim's minOut.
- The hard part: picking blocks where the puzzle is *interesting* (more than one victim and a nontrivial ordering) and being exact about fees and rounding, so the real-builder comparison stays honest.

## v1 scope
- Uniswap V2-style pools only, 1 pool per puzzle
- 10 hand-curated historical blocks
- Reorder plus one front-run and one back-run card
- Reveal screen with the real profit

## Out of scope (for now)
- V3 concentrated liquidity, multi-hop routes
- Live mempool or any real execution, ever
- Leaderboards with accounts

## Risks & unknowns
- Ethics: framing should teach victims (a 'how to not get sandwiched' panel on your own slippage), not recruit attackers.
- Historical reserve reconstruction errors would make the 'real' comparison wrong.
- The niche audience may be small, so the shareable daily score card matters.

## Done means
For 10 curated blocks, replaying the real historical order in the engine reproduces every on-chain swap output exactly. A player can reorder and insert trades and get a profit number. The solver's par score is ≥ the real searcher's profit on every puzzle.
