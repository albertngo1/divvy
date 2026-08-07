## Overview
A fast web tool for retail investors and advisors: type a thematic ETF ticker, get a single "label purity" percentage, the five holdings that dilute it most, and a chart of how purity has drifted since the fund launched. Cable-tester energy, applied to fund marketing.

## Problem
Thematic ETF names are marketing copy that survives long after the portfolio wanders. A fund named for AI, clean energy, or cybersecurity may hold megacap staples, a natural gas utility, or a payments processor — all defensible under a loose prospectus, none of what a buyer thought they were getting. Holdings are public but arrive as a 300-row table nobody reads, and existing look-through tools compare funds to each other rather than to their own promise.

## How it works
Enter a ticker. The tool shows: **Label purity 41%** — the portfolio-weighted share of assets in holdings whose actual business matches the fund's stated theme. Below it, a ranked "dilution" list, each row naming the holding, its weight, and the sentence from its own 10-K that drove the score. Below that, a purity-over-time line built from every quarterly filing, so you can see a fund quietly decay. A watchlist tab is the daily surface: purity change since the last filing, plus a standing leaderboard of the widest name-vs-holdings gaps across the thematic universe.

## Technical approach
Python + SQLite + a static Svelte front end. Holdings come from SEC EDGAR N-PORT-P XML (`/Archives/edgar/data/{CIK}/...`), which gives per-holding name, LEI/CUSIP, value, and portfolio percentage. Theme text comes from the fund's summary prospectus investment-objective paragraph, extracted once per fund. Holding text comes from the issuer's latest 10-K Item 1 business description, resolved LEI → CIK.

Scoring: embed theme text and each holding's business description with a text-embedding model; raw cosine is uncalibrated, so fit an isotonic regression on ~200 hand-labeled (holding, theme) pairs to convert similarity into a defensible match probability. For holdings over 3% weight, refine using XBRL segment revenue (`RevenueFromExternalCustomers` by reportable segment) to compute a *revenue-weighted* match — this is what stops a conglomerate from scoring 1.0 because one division fits.

Hard parts: N-PORT publishes with a ~60-day lag (must be shown, not hidden); security-name strings are inconsistent across filers, so entity resolution needs LEI-first with fuzzy fallback and a manual override table; and calibration, without which the number is vibes wearing a lab coat.

## v1 scope
- 25 hand-picked thematic ETFs, one snapshot each
- Purity number + top-5 dilution list with source sentences
- Static site, nightly regeneration, no accounts

## Out of scope
Mutual funds, swap/derivative look-through, portfolio import, brokerage integration, buy/sell opinions.

## Risks & unknowns
Framing risk: this must read as "semantic overlap between name and holdings," never as an accusation of misrepresentation. Embedding scores for diversified conglomerates and holding companies will be the loudest error class. Filing lag makes recent-rebalance funds look stale. Unknown: whether purity actually predicts anything (tracking error vs. pure-play peers) — worth checking, not worth claiming.

## Done means
For five funds I know well, the dilution ranking matches my own manual read of the holdings table; every score is clickable down to the 10-K sentence that produced it; and the purity-over-time chart for at least one fund shows a visible post-launch decay I can verify by hand.
