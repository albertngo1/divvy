## Overview
A daily scanner for prediction-market traders (Polymarket, Kalshi) that scores every open market on **resolution-language risk**: the probability that the outcome turns on ambiguous wording rather than on the event itself. Output is a ranked list — "markets where you are trading the rules, not the news" — plus an alert feed for rules text edited after launch.

## Problem
Most traders read the title and price the event. The contract is the rules body, and the two disagree more often than anyone admits: an unnamed "official source," a deadline with no timezone, a gradable predicate ("significant," "major," "formally announces"), or two named sources of truth that can contradict each other. When they diverge, the market misprices — and the edge belongs to whoever actually read the paragraph. Nobody has a systematic screen for it.

## How it works
Nightly pull of open markets. Each market's resolution text is decomposed into clauses and scored on a red-flag vector. The screen sorts by `wording_risk × open_interest × |price − 0.5|` — ambiguity only pays where there's size and where the crowd is confident. A separate watcher hashes each market's rules text and fires when it changes post-launch (an edit is itself a tradable event). You click a market and see the exact highlighted clause that earned the score, so you can judge it yourself in 20 seconds.

## Technical approach
- **Sources:** Polymarket Gamma API (`gamma-api.polymarket.com/markets`) for market + `description`/resolution text and volume; UMA optimistic-oracle proposal/dispute events on Polygon (subgraph or contract logs) as ground-truth **labels** for markets that ended contested; Kalshi `api.elections.kalshi.com/trade-api/v2/markets` for rulebook text and its explicit settlement-source field.
- **Features (LLM extraction into a fixed JSON schema, one call per market, cached by text hash):** named source present & machine-checkable; timezone specified; gradable/vague predicate count; undefined actor ("the administration"); multiple conflicting sources; explicit tie/void clause; horizon vs deadline mismatch.
- **The money feature:** embed title and rules body separately (any small embedding model) and compute divergence — high divergence is exactly where headline traders and rules traders disagree.
- **Model:** logistic regression / gradient boosting on disputed-vs-clean. Postgres, one row per market snapshot; a `rules_text_versions` table keyed by hash.
- **Hard part:** label sparsity and survivorship — most ambiguity resolves obviously and never disputes. Mitigate with a weak second label: multi-round UMA proposals, or a >30-point price whipsaw within 6h of resolution.

## v1 scope
- Pull 500 open Polymarket markets, one LLM call each, 8 boolean red flags
- Hand-weighted score (no training) + one HTML page, sorted
- Rules-text hash stored daily; a diff prints to the console

## Out of scope
Auto-trading, order routing, Kalshi ingestion, any UI beyond one page.

## Risks & unknowns
UMA dispute history may be too small to train on; API terms on scraping volume; LLM flag extraction may be noisy on legalese.

## Done means
On a held-out set of ~40 historically disputed markets vs 400 clean ones, the top risk decile captures ≥30% of the disputes, and the diff watcher catches at least one real post-launch rules edit in its first week.
