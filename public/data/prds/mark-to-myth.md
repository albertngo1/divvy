## Overview
A scraper + static site that reconstructs a *shadow price series* for late-stage private companies (SpaceX, Stripe, Databricks, Anthropic, Anduril) entirely from mandatory public filings. Every registered fund holding an illiquid private security must report it as a Level-3 fair-value mark, with share count and dollar value, on Form N-PORT. Divide one by the other and you have an implied price per share — from a dozen independent appraisers, monthly. For anyone who follows private markets, employees holding options, and journalists who currently write "valued at $X in its last round" as if valuation were a single number.

## Problem
Private company valuations are reported as one stale number — the last round price — which is a negotiated fiction that can be 18 months old. Real marks exist and are public, but they are buried in machine-hostile XML across hundreds of fund filings, so paid platforms (Caplight, Forge, Notice) resell what is technically free data. Nobody publishes the dispersion, and dispersion is the actual signal: when one big fund cuts a mark 30% and the others don't move for two quarters, that gap is information.

## How it works
1. Pick target issuers from a seed CSV of name aliases ("Space Exploration Technologies Corp", "SpaceX").
2. Sweep EDGAR for N-PORT-P filings, pull the holdings XML, keep rows where `fairValLevel == 3`.
3. Fuzzy-match issuer name; parse `title` for share class ("Series G Preferred", "Class C Common").
4. Implied price = `valUSD / balance`. Normalize to a reference class using a hand-curated conversion table.
5. Emit one chart per issuer: a line per fund, a shaded interquartile band, last-round price as a step function, and a "who moved first" table ranking funds by lead/lag on inflection points.

## Technical approach
Python + httpx against `https://data.sec.gov/submissions/CIK##########.json` and `efts.sec.gov/LATEST/search-index?q=%22spacex%22&forms=NPORT-P` (respect the 10 req/s limit and User-Agent rule). Parse holdings with `lxml`; N-PORT XML gives `name`, `lei`, `title`, `cusip`, `balance`, `units`, `valUSD`, `assetCat`, `fairValLevel`. Land everything in DuckDB: `holdings(cik, fund_name, period_end, issuer_id, class_label, shares, value_usd, implied_px)`. Frontend is a single generated HTML file with Observable Plot; refresh via cron.

The hard part is entity resolution and per-share normalization: funds hold through feeder LLCs and SPVs (so `balance` is SPV units, not company shares), share classes have different liquidation preferences, and some funds report a stake in "SpaceX Class A" alongside a separate warrant line. Detect SPV/feeder rows by class-label regex plus an implied-price outlier test (>3 MAD from the issuer-quarter median) and quarantine them rather than silently averaging garbage.

## v1 scope
- 3 issuers, ~12 hand-picked fund CIKs
- One `fetch.py`, one DuckDB file, one static chart page
- Manual alias + share-class tables as CSV
- Quarantine list printed to stderr, no auto-resolution

## Out of scope
BDC 10-Q schedules of investments, corporate 10-K stakes, secondary-market tick data, alerts, any paid API, portfolio tracking.

## Risks & unknowns
Coverage gaps (funds redact or aggregate); 60-day publication lag makes it a lagging indicator; share-class math could produce a confidently wrong number, so every point must link back to its source filing URL.

## Done means
Running `python fetch.py spacex` produces a chart with ≥4 funds and ≥8 quarters where every plotted point links to the exact filing, and at least one documented case of two funds' marks on the same series differing by >20%.
