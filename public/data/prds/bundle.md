## Overview
Bundle is a client-side daily browser puzzle that turns the scariest, most mythologized corner of crypto — Maximal Extractable Value — into a safe, tactile ordering game. Each day you're handed a block's worth of pending transactions and a couple of your own slots; you drag them into the order that extracts the most value before the slot deadline. For the crypto-curious who want to *feel* how transaction ordering, sandwiches, and priority fees actually work without risking a cent.

## Problem
MEV is opaque and folklore-ridden: everyone's heard 'sandwich attack' and 'front-running' but almost nobody has an intuition for the mechanic. There's no sandbox to build that intuition — real chains are terrifying and expensive, and the searcher bots (like the trending MEV-Arbitrage-Bot repo) are impenetrable Solidity + Python. A deterministic toy where ordering is the only lever makes the whole idea click.

## How it works
Each day a seeded 'mempool' of ~8 pending transactions lands on a toy constant-product AMM (x*y=k). Every tx is a card: a swap/add/remove with a gas tip, a price effect, and per-account nonce dependencies (some cards must precede others). You have 2 'insert' slots for your own transactions. You drag the block into an ordering; a sparkline shows the pool price walking as the block executes. Your profit = value your inserts extract (a triangular arb, or sandwiching a fat victim swap) minus gas, subject to a block gas limit. A precomputed par score and a share string ('Bundle #123 — 94% of par') drive the leaderboard.

## Technical approach
Pure TypeScript, no backend. A deterministic 'EVM-lite' simulator applies an ordered list of swaps against a handful of token reserves and tracks each account's PnL. The puzzle generator seeds by date, guarantees a nonzero optimal extraction, and computes par via branch-and-bound over orderings — pruned by the dependency DAG plus DP over independent connected components, since raw 8! is fine but larger sets need pruning. Rendering: draggable mempool cards, a live reserve sparkline, a settling animation as the block executes. The genuinely hard part is puzzle *generation*: producing seeds that are solvable, non-trivial, have a clean 'aha' (a hidden sandwich or a two-hop arb), and a fair, correct par.

## v1 scope
- One token pair + one triangular arb opportunity
- Drag-order 8 txs, 2 insert slots, one gas limit
- Date-seeded daily puzzle, precomputed par
- Share card + localStorage streak

## Out of scope
- Real chain / mempool data
- Competing against other bots' bids (gas auctions)
- Flashloans, multi-block, cross-domain MEV

## Risks & unknowns
Par correctness is load-bearing and easy to get subtly wrong. Balancing 'teaches real MEV intuition' against 'feels like DeFi homework.' Onboarding someone with zero AMM knowledge in the first 30 seconds.

## Done means
Given a fixed seed, a player who finds the optimal ordering hits the computed par exactly; the puzzle rotates at UTC midnight; and the share string reports profit/par reproducibly across machines.
