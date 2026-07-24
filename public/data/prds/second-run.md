## Overview
Second Run is a booking-intelligence dashboard for independent, arthouse, and repertory movie theaters — the ~600-1,000 single-screen and small-chain venues in North America whose programmer decides by hand what to book. It answers one question weekly: *given my room, my town, and my margins, what should I put on screen and will the deal pencil out?*

## Problem
The major chains buy Comscore Movies (five figures a year) to model demand and negotiate film rental. Indies can't. They leaned on free public sources — The-Numbers.com most of all — which just went dark/acquired (the HN post 'what happened to TheNumbers.com... should worry us all'). Now a programmer at a 200-seat arthouse is booking on gut, distributor phone calls, and Twitter. They over-book duds and under-book sleepers, and they walk into rental negotiations blind to what a title is really earning.

## How it works
You enter your theater once: seat count, zip, screens, house average ticket price, typical concession-per-head. Each week Second Run shows a ranked 'bookable now' list: for each title in release or re-release, an estimated local demand score, a projected weekend gross for a room your size, and an estimated **film rental take** (the % the distributor keeps, which declines by week-in-release). The margin line = projected gross − rental − fixed nut. A negotiation card shows the published/estimated distributor terms so you can push back.

## Technical approach
Python + Postgres + a small React dashboard. Data: nightly scrape of public weekend/daily grosses from Wikipedia film pages, distributor press releases, and Wayback snapshots of The-Numbers/Box Office Mojo for historical curves; comps for demand from Google Trends and Wikipedia pageview API (per-title, geo-weighted to your DMA). Rental terms are the genuinely hard part — they're confidential — so we model them: a Bayesian estimate seeded from published distributor standard terms (e.g. sliding-scale 'aggregate deals', 90/10 with a house nut, declining weekly floors) and calibrated against any actuals users voluntarily report, improving the prior over time. Projection = local demand index × room capacity × decay curve fit to the title's national trajectory.

## v1 scope
- Manual one-time theater profile
- Weekly scraped gross table for current wide + specialty releases
- Demand score from Wikipedia pageviews + Trends
- Rental estimate from a hand-coded distributor-terms table (top 15 distributors)
- One ranked list with a margin column, exportable CSV

## Out of scope
- Automated booking / distributor integration
- Payment or contract handling
- Concessions optimization, showtime scheduling
- International

## Risks & unknowns
Rental-term modeling may be too fuzzy to trust; mitigated by showing ranges and letting users correct. Scraping sources are fragile (that's the whole reason the incumbent died) — need redundant sources. Willingness to pay among tiny venues is thin; price at ~$40-80/mo and prove one good booking pays for a year.

## Done means
A real indie programmer enters their theater, gets a ranked list for the current weekend, and agrees the top 3 recommendations and margin estimates match what they'd have picked — plus surfaces one title they'd have overlooked.
