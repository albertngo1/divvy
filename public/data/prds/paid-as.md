## Overview
A read-only analytics service for dental practices that turns the practice's own claim history into an empirical model of every payer it bills. Instead of a front-desk person sitting on hold for 35 minutes to get a "full breakdown of benefits" that is non-binding and frequently wrong, the office gets a distribution of what this carrier *actually pays* for this code, derived from adjudicated reality. For 1–10 chair general practices, DSO billing departments, and dental billing companies.

## Problem
Every new patient triggers a manual insurance verification call. Reps read from a script, misquote frequencies and waiting periods, and disclaim everything ("not a guarantee of payment"). The office then quotes the patient an estimate, the claim comes back downgraded or denied, and the practice either eats the difference or sends a surprise bill that torches goodwill. Meanwhile the practice already holds a ground-truth dataset — years of EOBs — and nobody mines it.

## How it works
Nightly, the tool reads the practice management database and joins each billed procedure to what the carrier actually allowed. For each (carrier, plan fingerprint, CDT code) it builds an empirical distribution of allowed amount, a downgrade rate, a denial rate keyed by CARC/RARC reason code, and a days-to-payment distribution. At treatment planning, the coordinator picks the CDT codes and the patient's plan; the sheet prints P10/P50/P90 patient portion plus flags: "This plan downgraded posterior composites to amalgam in 41 of 47 cases (87%). Quote the amalgam number." A monthly "payer report card" ranks carriers by effective reimbursement, denial rate, and float.

## Technical approach
v1 targets Open Dental, which runs on a MySQL database with a documented schema — no X12 parsing needed. Pull `claimproc` (InsPayAmt, InsPayEst, WriteOff, CodeSent, Status), `procedurelog`, `procedurecode` (ProcCode = CDT), `claim`, `carrier`, `insplan`, `patplan`. Ingest into Postgres; Python + pandas for the modeling layer; a small FastAPI + server-rendered HTML front end.

Core statistics: allowed amounts are bimodal (downgraded vs not), so the mean is worthless — model the distribution and report quantiles. Where n < 8 for a cell, shrink hierarchically: (carrier, plan, code) → (carrier, code) → (code, region) via empirical-Bayes partial pooling. Downgrade probability is a Beta-Binomial with a carrier-level prior. Downgrade *detection*: flag rows where `CodeSent` differs from the billed code, plus rows where the allowed amount clusters within tolerance of the carrier's known allowed for the cheaper alternate code.

The genuinely hard part is plan identity. "Delta Dental" is not a plan; two patients under the same carrier can have opposite benefits. Build a plan fingerprint from group number + employer + annual max + benefit year start + a quantized vector of observed coverage percentages per category, then cluster fingerprints so a new patient maps onto an existing empirical plan even when the group number is typo'd.

## v1 scope
- Read-only connector to one Open Dental MySQL instance
- Top 25 CDT codes by volume, top 5 carriers
- Static nightly HTML report: allowed-amount quantiles + downgrade rates + payer report card
- No writes back to the PMS, no patient-facing output yet

## Out of scope
X12 835/837 parsing, Dentrix/Eaglesoft connectors, eligibility APIs, claim submission, medical (CPT) billing, anything that touches PHI off-site (run on-prem first).

## Risks & unknowns
PHI handling and a BAA are table stakes; on-prem deployment sidesteps most of it but complicates support. Small practices may lack the volume for tight intervals on rare codes. Fee schedule renegotiations make old data stale — need recency weighting with a half-life. PMS vendors are hostile to third-party DB access.

## Done means
Pointed at a real practice's Open Dental database, the report reproduces that office's known downgrade behavior for at least three carriers, and a blind backtest on the most recent 90 days of claims shows the P10–P90 interval containing the actual patient portion at least 80% of the time — beating the office's existing estimator on mean absolute error.
