## Overview
Cohort is a compliance-analytics SaaS for the ~2,000 small colleges, trade schools, and coding bootcamps that live and die on Title IV federal aid. It projects, per program, whether graduates will clear the new 'do-no-harm' earnings and debt-to-income thresholds, and flags the programs at risk of losing aid eligibility.

## Problem
Under the new federal rule, a program whose grads earn less than a typical high-school graduate in their state — or carry crushing debt-to-earnings ratios — can lose access to federal loans and grants. For a small school, losing Title IV is an extinction event. Today the analysis is a terrified financial-aid officer with a spreadsheet, guessing at outcomes 3-4 years out, using data they don't have. They find out they failed when the letter arrives.

## How it works
A school uploads its enrollment/completion records (or connects its SIS: Banner, Anthology, PowerSchool). Cohort maps each program to its CIP code and GE (gainful-employment) cohort, then models expected graduate earnings against the state's Census-derived high-school-earner benchmark and the median-debt threshold. A dashboard shows each program on a traffic-light grid: safe / watch / failing, with the specific gap ('median earnings $2,400 below threshold') and a what-if slider ('cut program cost 8% → passes').

## Technical approach
Stack: Postgres + a Python/pandas modeling service, Next.js dashboard. Data sources: College Scorecard API (institutional + program earnings), IPEDS, BLS OEWS wage data by SOC/CIP crosswalk, Census ACS state earnings for the high-school benchmark, and the ED GE final rule's exact formula (D/E and earnings-premium tests). Data model: institution → program (CIP) → cohort-year → {completers, median_debt, projected_earnings, benchmark}. The hard part is the CIP→SOC→wage crosswalk and honestly modeling *future* earnings from thin sub-completer counts; we blend Scorecard program-level actuals with BLS regional wages and widen confidence bands when n is small, never claiming false precision.

## v1 scope
- CSV upload of programs + completer counts
- Compute both statutory tests against live benchmarks for one state
- Traffic-light dashboard with the numeric gap per program
- One 'board-ready' PDF export

## Out of scope
- SIS auto-sync
- Multi-year appeal workflow / ED filing
- Anything that touches actual student PII beyond aggregates

## Risks & unknowns
The rule's exact thresholds and effective dates may shift with each administration — the model must be parameterized, not hardcoded. Earnings data lags 2-3 years, so 'projection' is genuinely uncertain and we must be honest about it. Sales cycle to colleges is slow; bootcamps may be the faster wedge.

## Done means
Given a real school's program list, Cohort reproduces the two statutory test outcomes for a known past GE cohort within the published tolerance, correctly labels which programs would have failed, and exports a PDF a financial-aid director signs off on.
