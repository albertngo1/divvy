## Overview
A differential fuzzer and conformance suite for interest accrual. You give it your accrual function (HTTP endpoint, Python callable, or SQL expression); it hammers it with adversarial date schedules across all standard day-count conventions and reports disagreements denominated in dollars per $1M notional. For fintech lenders, private-credit and revenue-based-finance shops, BNPL, tokenized-treasury issuers, and anyone whose auditor recently asked "which convention is this?"

## Problem
Day-count conventions are a joke nobody laughs at. 30/360 US, 30E/360, 30E/360 ISDA, ACT/360, ACT/365F, ACT/ACT ISDA, ACT/ACT ICMA, NL/365 — they differ by a few basis points, which is invisible in a unit test with round dates and enormous across a portfolio. The bugs cluster in exactly the places nobody tests: February month-ends, leap years, 31st-to-30th rolls, stub first and last periods, and periods straddling a year boundary where ACT/ACT ISDA splits the fraction. There is no test suite for this. Teams find out during an audit or a customer dispute.

## How it works
1. Register your implementation as an adapter (`POST /accrue {start, end, rate, notional}` → amount).
2. The engine generates schedules: every month-end pairing, leap-year crossings, 1-day and 364-day stubs, long/short first coupons, business-day rolls under Following / Modified Following / Preceding with real holiday calendars.
3. It computes the reference answer for each of 8 conventions from a clean-room implementation, then diffs against yours.
4. Output: a ranked report — "your function matches ACT/365F on 94% of cases; the 6% are all periods starting on Jan 31, where you match 30/360 US instead. Cost: $2,411 per $1M per year." Plus a shrunk minimal failing case, like a proper property-based tester.

## Technical approach
Python core, `hypothesis` for schedule generation with custom date strategies biased toward month-ends and Feb 28/29. Conventions implemented directly from ISDA 2006 Definitions §4.16 and the ICMA rulebook; cross-validated against QuantLib's `DayCounter` classes as an oracle so the reference itself is checked. Business-day calendars from `python-holidays` plus a hand-curated SIFMA/TARGET set. Data model: a `Schedule` (accrual start, accrual end, payment date, period type: regular/short-first/long-first/short-last) and a `Verdict` (convention, mismatch count, max dollar delta, minimal repro). The hard part is not the conventions — it is inferring *which* convention the code under test actually implements, which is a classification problem over a sparse disagreement matrix; near-identical conventions (ACT/365F vs NL/365) only separate on leap-year cases, so the generator must deliberately hunt separating inputs.

## v1 scope
- 8 conventions, no business-day adjustment
- One adapter type: an HTTP endpoint
- CLI producing a markdown report with dollar deltas
- Free public web toy: two dates + notional → all 8 answers side by side

## Out of scope
Compounding, amortization schedules, holiday-calendar coverage beyond US/EUR, multi-currency.

## Risks & unknowns
Small market that may prefer to just copy QuantLib; the free toy might be the whole product; convention classification could be ambiguous for genuinely custom in-house math.

## Done means
Run against three deliberately broken reference implementations (an off-by-one 30/360, a leap-year-blind ACT/365, a stub-period mishandler); the tool identifies each bug, names the convention actually implemented, produces a minimal failing date pair, and states the annual dollar error on $1M — all without being told what the bug is.
