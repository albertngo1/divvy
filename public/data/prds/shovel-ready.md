## Overview
A subscription data service that forecasts skilled-trades labor demand shocks by county, 12–18 months ahead, from public paper trails. Buyers: small/mid electrical and mechanical contractors, construction staffing agencies, electrical distributors, IBEW/UA locals, and community-college apprenticeship programs.

## Problem
A hyperscale campus lands in your county and every journeyman electrician within 60 miles is gone at +$14/hr. Contractors who bid a hospital retrofit at last year's labor rate eat the difference; staffing firms learn about the project from the local paper; apprenticeship programs size next year's cohort off two-year-old BLS data. The information exists — it's just spread across utility queues, state environmental filings, and county planning PDFs, in that order of earliness, and nobody joins it.

## How it works
A pipeline ingests leading indicators ranked by how early they appear: (1) utility large-load interconnection queues (ERCOT LLIQ, PJM, MISO, SPP, state PUC dockets); (2) **state air-permit applications for diesel/gas backup generators** — 60 × 3MW gensets is not a warehouse, and these land months before any press release; (3) county rezoning and site-plan agendas; (4) building permits and bid postings. Each resolved site gets estimated MW, phase dates, and a confidence tier. A labor model converts MW into electrician / pipefitter / sheet-metal FTE-months spread over a construction S-curve, aggregates to commuting zones, and divides by BLS OES county employment for those SOC codes to produce a tightness index and a wage-pressure band. Output: weekly email, a map, and CSV/API.

## Technical approach
Python + Prefect, Postgres/PostGIS, DuckDB for analytics. County agendas are PDF chaos: pdfplumber for text, then an LLM extraction pass constrained to a strict JSON schema, with everything low-confidence routed to a human review queue. The genuinely hard part is entity resolution — developers file each campus under a fresh single-purpose LLC, so the same project appears as four names and four MW figures. Link with splink over registered-agent name, parcel APN, geocoded address, utility service point, and MW proximity; keep a canonical `campus` table with a merge audit log so a bad merge is reversible. Labor coefficients (electrician-hours per MW) come from published NECA/AIA cost breakdowns and DOE data-center studies, calibrated against certified payroll (LCPtracker/Davis-Bacon) on comparable completed jobs.

## v1 scope
- One state (Virginia): air permits + interconnection queue + one county's agendas
- ~30 sites, hand-verified
- A spreadsheet and a one-page map emailed weekly to 5 friendly contractors
- No self-serve signup, no API

## Out of scope
National coverage; non-data-center construction; a wage-benchmarking product; a job board; anything with a login.

## Risks & unknowns
Contractors may nod enthusiastically and not pay. Some states seal or delay filings. MW estimates and hours-per-MW coefficients could be off by 2×, which destroys the tightness index. Confidentiality-agreement projects may skip every indicator until permits.

## Done means
Three pilots paying $500/mo, and a retrospective showing the model named 8 of 10 projects that broke ground in the following 12 months *before* their public announcement, with MW within ±40%.
