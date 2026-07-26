## Overview
An alt-data research tool and dashboard for anyone who trades or covers M&A. It reconstructs the complete history of every public bug-bounty program's *scope* — the list of domains hackers are allowed to attack — and treats a newly-appearing domain the company didn't previously own as a corporate-change event. Then it event-studies the acquirer's stock around that date.

## Problem
Alt-data is picked over: satellite parking lots, credit-card panels, app rankings. Bug bounty scope is not, because nobody thinks of the security team as a leak surface. But scope is maintained by engineers, updated in near-real-time, published to the whole internet, and *has to* list an acquired property before pentesters can legally touch it. Someone has to add `newco.com` to the in-scope list, and that someone does not report to IR.

## How it works
1. Clone `arkadiyt/bounty-targets-data` with full history — hourly commits since 2017, files like `data/domains.txt`, `data/wildcards.txt`, `data/hackerone_data.json`.
2. Walk `git log` per file and `git show <sha>:<path>` to materialize a `(program, target, first_seen_utc, last_seen_utc)` table in Postgres. This is the whole dataset and it's free.
3. Filter to *interesting* additions: registrable base domain never seen in any program before, WHOIS creation date > 1 year before the add (so it's an existing property, not a product launch), and current registrant/NS differ from what the program's own domains use.
4. Resolve program → ticker via a hand-curated CSV (~200 public-company programs). This curation is the moat and there's no shortcut.
5. Label ground truth: SEC EDGAR full-text search (`efts.sec.gov/LATEST/search-index?q=`) for 8-K Item 2.01 / press-release exhibits mentioning the domain's brand, to get the announcement date.
6. Compute lead/lag: `scope_add_date − announce_date`. Then a market-model event study (estimation window −250..−30, event window −1..+5, CAR vs SPY beta from stooq/yfinance dailies).

Output: a leaderboard of programs by average lead time, a distribution histogram of lead/lag days, and a live daily feed of fresh unexplained scope additions with a "who owns this" enrichment card.

## Technical approach
Python + Postgres. `git log --format=%H|%ct -- data/domains.txt` then batched `git cat-file --batch` for speed — naive `git show` per commit on 70k commits is hours; batch mode is minutes. Store targets as an interval table with GiST index on the validity range so "scope as of date D" is one query. WHOIS/RDAP via `rdap.org` bootstrap (free, JSON, rate-limited). Passive DNS is nice-to-have but paid; skip in v1. Event study in `statsmodels`.

The genuinely hard part is base rate. Programs add hundreds of domains a year for boring reasons — new marketing microsites, CDN hostnames, regional TLDs. The classifier that separates "we bought a company" from "marketing launched a landing page" is the entire product, and it has to be built from WHOIS age, registrant delta, and brand-token novelty against the parent's existing name space.

## v1 scope
- Ten hand-picked programs with public tickers (Shopify, Snap, Coinbase, Twilio…)
- Domain adds only; ignore wildcards, mobile, source-code assets
- Hand-labeled positives from a list of those companies' known acquisitions
- One chart: lead/lag histogram. If the mass is all on the lag side, that's the honest finding.

## Out of scope
- Trading, signals-as-a-service, any execution
- Private programs, Intigriti/YesWeHack parity
- Real-time alerting

## Risks & unknowns
The likely null result: acquirers add target domains *after* announcement, during integration — a lagging indicator, publishable but not tradeable. Sample size is thin (maybe 50 clean events). Everything here is public data with no MNPI, but the writeup should say so plainly.

## Done means
A reproducible notebook that, from a fresh clone, outputs the lead/lag histogram over ≥30 labeled acquisition events with the median lead time stated and a bootstrap CI on the event-window CAR.
