## Overview
A single-page tool for retail bond holders — the dentist with $400k in state munis, the retiree laddering corporates — that reconstructs the dealer markup embedded in every bond they've ever bought, using trade data that is already public and free but effectively unreadable. Not a broker, not a trading app: a forensic receipt generator.

## Problem
Bonds trade principal, not agency: the dealer sells you the bond out of inventory at whatever price they choose, and the "commission" is invisible inside the price. Since 2018, confirms must disclose a markup — but only for retail principal trades the dealer offset the same day, which is a large loophole, and the disclosure lands on a paper confirm nobody reads. Academic estimates of retail muni markups run 1–2% of par, i.e. a year or more of coupon vaporized at purchase. The data to prove it exists: MSRB EMMA publishes every muni trade with a customer-bought / customer-sold / interdealer flag, and FINRA publishes the same for corporates. Nobody has made it usable by the person who was actually charged.

## How it works
User enters a CUSIP, a trade date, their price, and par amount. The tool pulls every reported trade in that CUSIP for a ±3 day window and computes the *prevailing market price* using the MSRB Rule G-30 waterfall the dealer was supposed to use: (1) same-day interdealer trades in the same security, size-weighted; (2) failing that, same-day institutional customer trades; (3) failing that, a comparable-security estimate. Output is one number with three framings: dollar markup, yield give-up in basis points, and "you paid 1.4 years of coupon to enter this position." A portfolio view (paste a CSV of fills) rolls this into lifetime friction and ranks it by broker. The mischievous finish: a one-page printable markup receipt, citing the specific interdealer prints by timestamp, addressed to your rep.

## Technical approach
Python + FastAPI + DuckDB; a nightly job walks EMMA's per-CUSIP trade pages and FINRA's fixed-income trade history for CUSIPs users have queried, caching into Parquet (`trades`: cusip, exec_ts, price, yield, par_band, side_flag, settlement). Security terms — coupon, maturity, call schedule, dated date, day count, tax status — come from the EMMA security details page and drive a proper yield engine: yield-to-worst across the call schedule via Brent's method on the price/yield function, 30/360 accrual, so the basis-point framing is real and not a linear approximation. Tier 3 of the waterfall is the hard part: fit a daily AAA-equivalent spot curve by Nelson–Siegel over that day's high-grade interdealer prints, then predict the subject bond's price from duration, rating bucket, state, sector, and AMT flag; residual is the markup estimate, and it must carry an explicit confidence band or it's just a plausible-sounding lie. Second hard part is size bias: institutional block prints are systematically better than the $10k lots you actually trade in, so comparing your fill to a $2M print overstates the theft. Correct with a par-size ladder estimated from the full trade panel.

## v1 scope
- One CUSIP, one fill, one number
- Waterfall tier 1 only (same-day interdealer, same CUSIP); say "insufficient data" otherwise
- Trade fetch on demand, cached to a local Parquet file
- Plain HTML result page, no accounts

## Out of scope
Executing trades, corporate bonds, treasuries, portfolio import, mobile, brokerage OAuth.

## Risks & unknowns
EMMA and FINRA public pages are scrape-hostile and their terms of use may bar systematic collection — the licensed real-time feeds cost real money, which may cap this at hand-entered CUSIPs. Trade tapes are delayed and size-banded (par above $1M shows as "MM+"), destroying precision on the exact trades that matter most. And the tier-3 comparables model is where a wrong answer becomes an accusation.

## Done means
Given a real confirmed muni purchase whose confirm already discloses a markup under Rule G-15, the tool independently reproduces that disclosed markup within 10 basis points, without ever seeing the confirm.
