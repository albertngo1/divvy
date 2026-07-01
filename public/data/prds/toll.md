## Overview
Toll is a browser roguelike set in the near-future web where sites charge bots per request (Cloudflare's Monetization Gateway, taken to its logical end). You play a crawler agent with a fixed token wallet, navigating a procedurally generated graph of interlinked sites — some free, some tolled, some traps — trying to reach target pages and extract their data before your wallet hits zero. For roguelike fans and anyone following the AI-crawler-payments fight.

## Problem
The pay-per-crawl future is a genuinely novel economic landscape and nobody's *played* in it. Roguelikes are about resource attrition under uncertainty — a perfect fit — but they're all dungeons and goblins. There's a fresh, legible tension in 'every click costs money and you can't see the price until you knock.'

## How it works
Each run generates a directed graph of sites (nodes) with hidden crawl tolls on their edges. You start at a seed URL with a token budget and a contract (e.g. 'extract 3 product prices'). Moving to a node deducts its toll; you learn adjacent tolls only by 'sniffing' (a small cost). Some nodes are honeypots that drain you; some offer 'cache' shortcuts; robots.txt gates require detours. Spend wisely, fulfill the contract, bank the profit, and the next run scales up. Permadeath = bankruptcy.

## Technical approach
Pure client-side TypeScript, canvas or SVG for the node-graph map, seeded PRNG for reproducible runs. Core data structure is a weighted directed graph with partially observed edge costs; the interesting algorithmic layer is procedural generation that guarantees at least one solvable path within budget (constrained generation + a budget-feasibility check via shortest-path/Dijkstra before a run is accepted). Toll values and honeypot placement tuned so runs feel tight but fair. Hard part: generating graphs that are *tense but always winnable* and surfacing partial information so decisions feel skillful, not random.

## v1 scope
- Procedurally generated 15-node graph with hidden tolls + sniff action
- One contract type (reach and extract N target nodes)
- Token wallet, bankruptcy = game over, seeded runs
- Text/SVG map, click-to-move

## Out of scope
- Meta-progression, upgrades, multiple crawler classes
- Real HTTP or actual crawling (it's an abstraction, not a scraper)
- Multiplayer / daily-seed leaderboards

## Risks & unknowns
- Could feel like spreadsheet math without strong feedback and stakes.
- Guaranteeing solvability every run without making it obvious is fiddly.

## Done means
A seeded run generates a solvable tolled graph, the player spends tokens to fulfill a contract or goes bankrupt, and the same seed reproduces the same map.
