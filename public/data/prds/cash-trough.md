> **Spotted in the news:** Leon County Schools approving an up-to-$30M short-term loan to cover payroll and bills, alongside reports of more K-12 districts in financial crisis.

## Overview
Cash Trough is a cash-flow forecasting tool for the finance offices of small and mid-size US school districts (2,000–40,000 students). Its job is to answer one question each week: on which day does our bank balance drop below payroll, and by how much?

## Problem
This week Leon County Schools approved a short-term loan of up to $30M to cover payroll and bills, and other coverage describes a growing number of K-12 districts in financial crisis. A large part of this is a timing problem. Property taxes arrive in a few big lumps (often November–January). State aid comes on a fixed disbursement calendar that some states delay or back-load. Payroll goes out every two weeks without fail. The result is a predictable trough each fall and spring. Many districts track cash in a spreadsheet one CFO maintains by hand, see the trough late, and then borrow through tax/revenue anticipation notes or bank lines carrying legal, rating and interest costs. Borrowing earlier, borrowing less, or rearranging vendor payment timing would cost less. Having one person hold all the cash knowledge is also a major risk when that person leaves.

## How it works
1. Import 3 years of daily bank and general-ledger cash transactions (CSV export from Skyward, Tyler Munis, PowerSchool BusinessPLUS, or the bank).
2. Cash Trough classifies inflows (state aid, local tax, federal grants, other) and outflows (payroll, benefits, debt service, vendors).
3. It loads the state's published aid payment schedule and the county tax collector's collection calendar.
4. It projects a daily balance for the next 52 weeks, with a band built from prior years' timing variance.
5. A scenario panel covers the levers a CFO actually has: 'state delays the March payment by 30 days', 'tax collections run 5% low', 'defer the bus purchase to July', 'draw $8M on the line on Oct 1 instead of Nov 15'.
6. One-page board memo export: the trough date, its depth, the recommended borrowing amount and window, and the interest saved compared with last year.

## Technical approach
Postgres plus a Python forecasting service and a plain web UI. Recurring flows are modelled deterministically: payroll from the pay calendar and recent run sizes, debt service from amortization schedules. Calendar-driven inflows come from state aid schedules and county tax installment dates. A per-category residual model built from historical timing variance supplies the uncertainty band. Data model: account, transaction, category, recurring_rule, external_calendar, scenario, forecast_point. The hard part is the state aid calendars. Every state publishes them in a different format (PDF memos, Excel files, finance-office web pages), and they change mid-year. v1 parses one state's calendars by hand and keeps them current.

## v1 scope
- One state (Florida: FEFP disbursement schedule)
- CSV import from one ERP export format
- Daily balance forecast with a variance band
- 3 preset scenarios plus one free-form override
- PDF board memo

## Out of scope (for now)
- Live bank feeds
- Bond issuance or TAN document preparation
- Budget (as opposed to cash) forecasting
- Multi-state calendar library

## Risks & unknowns
Buyer: the district CFO or finance director. Purchases under roughly $10–15K/year often avoid a full RFP. Competitors: municipal advisors already do this for bigger issuers, and ERP vendors sell forecasting modules that small districts rarely license. Districts are cautious about sending ledger data to an unknown vendor. Some troughs come from real deficits, not timing, and a forecast doesn't solve those. The tool still makes them visible sooner. Sales cycles follow the fiscal year, so pitching in March–May is too late for that year's borrowing decision.

## Done means
Using 3 years of a pilot district's real history, Cash Trough is run as of each Sept 1. For at least 2 of the 3 years, it predicts the minimum-balance date within ±10 days and the trough depth within ±15%. The district's finance director says they would use the board memo for this year's borrowing decision.
