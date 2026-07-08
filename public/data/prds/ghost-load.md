## Overview
Ghost Load is a fraud-vetting tool for freight brokers and dispatchers. Before tendering a load to a carrier, you enter their MC/DOT number and get a single legit-or-scam confidence score plus a ranked list of red flags — built entirely from free public FMCSA data most brokers never bother to cross-reference under deadline pressure.

## Problem
Double-brokering fraud is a current epidemic in US freight: a scammer with a freshly reactivated authority poses as a legit carrier, accepts a load, quietly re-brokers it to an unwitting real trucker they never intend to pay, and pockets the difference — or the load simply vanishes. Brokers vet carriers manually across three ugly government portals while a driver waits on the phone, so most just eyeball the authority status and hope.

## How it works
1. Broker enters an MC or DOT number (or pastes a carrier packet).
2. The tool pulls that carrier's FMCSA record and computes signals: authority age vs. reactivation date, recent authority churn, physical-address geocode vs. a residential/UPS-Store/CMRA flag, phone/email reuse across many MC numbers, insurance on file, out-of-service history, and a mismatch between the name on the rate con and the registered legal name.
3. Each signal maps to a weighted risk contribution; the UI shows a 0–100 score, a plain-English "why" list, and a printable vetting record for the file.
4. Optional watchlist: flag numbers you've been burned by and share within your brokerage.

## Technical approach
Stack: a small Postgres + FastAPI backend with a nightly ETL. Data sources: FMCSA SAFER Company Snapshot, the FMCSA QCMobile API (carrier + authority + insurance endpoints), the L&I authority history, and the SAFER bulk company census file for offline joins. Address classification uses USPS/CMRA reference data + a geocoder to detect residential or mailbox-store HQs. The scoring is a transparent weighted-rule engine (not ML) so every flag is explainable and defensible in a dispute. The genuinely hard part is entity resolution — the same fraud ring rotates MC numbers but reuses phones, emails, and addresses, so the value is a graph linking carriers by shared contact fingerprints and surfacing clusters.

## v1 scope
- Single MC/DOT lookup returning score + flag list
- ~8 rule signals wired to live QCMobile + SAFER data
- Residential/CMRA address flag
- Printable PDF vetting record

## Out of scope
- Automatic load-board integration
- Real-time load tracking
- Any payment/factoring features
- ML risk model

## Risks & unknowns
- FMCSA API rate limits and occasional staleness
- False positives on legitimate new authorities (owner-ops) — need calibration
- Fraud rings adapt; the contact-fingerprint graph needs steady curation
- Liability framing: it's advisory, not a guarantee

## Done means
Given a known-good and a known-fraudulent MC number, the tool returns distinguishable scores with correct, explainable flags for each, and produces a one-page vetting record in under 5 seconds per lookup.
