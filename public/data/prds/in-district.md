## Overview
In District is a low-cost SaaS for small trade associations, union locals, disease-advocacy nonprofits, and regional coalitions: upload your membership CSV, name a bill, and get a ranked leverage board of the congressional districts where you have both constituents and a representative who matters to that bill.

## Problem
Quorum, FiscalNote, and Phone2Action run $15–40k/yr and are built for orgs with a full-time government-affairs team. Everyone below that tier operates on vibes: they know they have 6,000 members, they do not know that 412 of them live in the district of a subcommittee member who hasn't co-sponsored yet. Staffers filter hard on one question — *is this person in district?* — and small orgs cannot answer it, so they send generic national blasts that get ignored.

## How it works
1. Upload CSV (name, address, email, optional join date).
2. Batch geocode → assign 119th Congress district (plus state upper/lower for later).
3. Pick a bill to watch. The app pulls its committee of referral, that committee's roster, current co-sponsors, and recent actions.
4. **Leverage board:** districts ranked by (your constituent count) × (rep pivotality: on the committee, not yet a co-sponsor, in the party that decides it).
5. Per-district **ask sheet**: constituent count, top three ZIPs, district-office address and phone, a draft constituent email, and the rep's last floor statement on the topic.
6. Weekly digest email diffing what moved.

## Technical approach
Next.js + Postgres/PostGIS. Geocoding: the Census Geocoder batch endpoint (free, 10k addresses per submission) with a Pelias/Nominatim fallback for failures; district assignment either from the Census "Geographies" benchmark response or point-in-polygon against TIGER/Line congressional-district shapefiles loaded into PostGIS behind a GIST index. Legislator metadata and committee rosters from the `unitedstates/congress-legislators` YAML repo (`legislators-current.yaml`, `committee-membership-current.yaml`), refreshed nightly. Bills, actions, and cosponsors from `api.congress.gov` v3. Data model: `members`, `geocodes`, `districts`, `legislators`, `committees`, `bill_watches`, and a materialized `leverage_scores` view.

The hard part is address quality, not GIS: apartment lines, PO boxes (structurally undistrictable — must be surfaced as an honest "unassignable" bucket, not silently dropped), and stale addresses that predate the last redistricting. Second hard part is making the pivotality score defensible rather than astrology — v1 keeps it as three transparent, user-visible boolean multipliers instead of a black-box number.

## v1 scope
- Single tenant, no auth beyond a shared link.
- CSV upload → geocode → congressional district only.
- One manually-entered bill number.
- Leverage table sorted by constituent count, with committee membership flagged.
- CSV export.

## Out of scope
State legislatures, CRM writeback (Salesforce/EveryAction), actually sending email, redistricting simulation, mobile.

## Risks & unknowns
Geocoder rate limits and downtime; orgs being (correctly) reluctant to upload member PII to a stranger's SaaS — likely needs a self-hosted or fully in-browser mode to close deals; committee-membership data lag; whether small orgs will pay $99/mo or just want a one-time consulting run.

## Done means
5,000 real member addresses upload, ≥95% get a congressional district, the leverage board for a live bill renders in under 10 minutes end to end, and one real advocacy staffer says the ask sheet is what they'd walk into a district office with.
