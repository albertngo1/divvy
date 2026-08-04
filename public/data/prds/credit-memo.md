## Overview
An SLA credit recovery service for engineering-led companies spending $20k–$2M a year on cloud and SaaS. It watches every vendor's uptime against that vendor's own contract, and when a credit is owed it hands you a finished claim packet before the window closes. Revenue: 25% of recovered credits, or $99/mo for tracking-only.

## Problem
SLAs are opt-in refunds. Almost every one requires the customer to submit a written claim, with evidence, usually within 30 days of the incident. Almost nobody does. Engineering knows the outage happened but doesn't know money is attached; finance knows about money but not outages; the window closes in silence. Vendors budget for this — unclaimed credits are pure margin. A mid-market company with a bad quarter across three vendors routinely leaves five figures on the table.

## How it works
1. You list your vendors and upload order forms / point at published SLA URLs.
2. We compile each SLA into a computable spec.
3. We continuously ingest three evidence streams: vendor status history, our own independent probes, and optionally your telemetry (error rate against that vendor).
4. At month close we compute achieved availability under each contract's own definition, compare to the credit tiers, and generate a claim packet — a filled claim email, a minute-by-minute evidence table, and a content-addressed evidence bundle whose sha256 goes in the email so the record can't be disputed later.
5. A deadline queue nags: "9 days left to claim ~$4,120 from Vendor X."

## Technical approach
The core asset is an SLA-as-code DSL (YAML) capturing measurement window (calendar month vs rolling 30 days), the unit (whole-service vs per-region vs per-request error rate), exclusions (maintenance announced ≥N hours prior, beta features, customer misconfiguration), credit tiers as a step function, claim deadline, and claim channel. Extraction is LLM-assisted from the SLA PDF/URL with mandatory human review, stored with diff-tracked version history — vendors edit SLAs silently, and that diff is itself a sellable alert.

Data sources: Atlassian Statuspage `/api/v2/incidents.json` and `summary.json` (a large share of vendors), plus AWS/Azure/GCP health JSON and RSS feeds. Independent probes at 60s from three clouds into Postgres/Timescale. Attribution join: your error-rate series intersected with the vendor incident window yields "affected minutes" for SLAs that demand proof of impact. Stack: Postgres, Go worker, Next.js dashboard, S3 for evidence bundles.

Hard parts: (a) exclusion clauses swallow most credits, so you must archive maintenance notices *at announcement time* to prove notice was inadequate; (b) mapping a vendor's status components to the SKUs you actually pay for; (c) the vendor's reflexive first reply is "we see no impact on our side," so evidence quality decides the outcome.

## v1 scope
- Five hardcoded vendors with hand-written SLA specs (AWS EC2, Cloudflare, Twilio, SendGrid, GitHub)
- Statuspage/health-feed polling only, no customer telemetry ingest
- Monthly "you may be owed ~$X" email with a copy-pasteable claim draft
- Manual invoicing of the 25%

## Out of scope
Auto-filing without human approval; contract negotiation; non-uptime SLAs (support response time is lucrative but v2); jurisdiction-specific contract law.

## Risks & unknowns
Buyers may fear renewal retaliation and prefer quiet tracking to aggressive claiming. Credits are service credits, not cash, which dampens CFO enthusiasm (counter: they offset the next invoice). Self-reported status pages understate outages — precisely why independent probing matters. Enterprise contracts carry custom unpublished SLAs, making onboarding manual.

## Done means
For one real month and one real outage, the system produces a claim packet that results in a credit actually issued by the vendor, and the predicted dollar amount matches the issued credit within 5%.
