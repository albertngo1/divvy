## Overview
Wildcat is a sealed-bid auction party game for 3–6 players built entirely around the *winner's curse*. Each phone is a rival oil company holding a private, noisy geological estimate of a lease's true worth. It's for friends who like a little economics — and a lot of trash talk — with their party games.

## Problem
Sealed-bid auctions are the best kind: simultaneous, tense, no turn order. But they're miserable in person — slips of paper, someone peeks, someone can't do the arithmetic, and reveals drag. Worse, the *delicious* part (the fact that whoever wins probably overpaid) is completely invisible unless every player has their own hidden private valuation. You literally cannot run the winner's curse on a shared table.

## How it works
The host TV shows a drilling lease (e.g. "Permian Block 12") whose true value is hidden. Each phone privately shows THAT player's own seismic estimate — the true value plus random noise unique to them — their remaining cash, and a bid slider. Everyone submits a sealed bid at once; the host shows only "locked" checkmarks, never numbers. On reveal, the host flips the true value, spotlights the winner, and computes profit = true value − winning bid. The winner usually overpaid, because *winning means you drew the most optimistic signal*. Cash carries across a few lots; most money after N lots wins.

Private per-phone: your unique noisy estimate, your cash, your bid. Shared: the lot, lock indicators, and the dramatic reveal. Passing one phone around breaks the whole game — every phone holds a *different* secret number.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit Durable Object, one per room; or Socket.IO over Tailscale Serve). Data model: `Room{code, players[], lots[], currentLot, phase}`, `Player{id, name, cash, signal, bid}`, `Lot{trueValue, perPlayerSignals{}}`. The server generates `trueValue` and per-player Gaussian-ish signals and pushes each signal ONLY to its owner — never broadcast. Sync is a simple state machine (LOT→BID→REVEAL) broadcast to all; bids go phone→server and stay secret until all are in or the timer fires. The hard part isn't latency (sealed bids are async-friendly) — it's *trust*: signals and bids must never leak over the wire or into another client's DOM, and the RNG must be auditable so nobody cries rigged. True values live only on the server until reveal.

## v1 scope
- 3 players, one room, one round of exactly 3 lots
- First-price sealed bid, fixed starting cash
- Server-generated true value + per-player noise
- Host: lot name, lock checks, reveal with profit/loss
- Phone: your signal, your cash, a bid slider, submit

## Out of scope
- Second-price/Vickrey modes, multi-round campaigns, spectators, reconnection polish, chat, custom lot themes.

## Risks & unknowns
- Is the winner's curse *fun* or just punishing? Needs noise tuning so shading your bid below your signal is a real skill.
- Players must grok "bid under your estimate" — needs a one-line tutorial.
- Small-N variance could feel random; 3 lots may be too few to feel earned.

## Done means
Three phones join a room code, each sees a *different* secret number for the same lot, all submit blind bids, and the host reveals the true value and names the winner with a correct profit/loss — with no player able to see another's signal or bid before reveal.
