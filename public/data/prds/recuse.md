## Overview
Recuse is a monitoring SaaS for appellate litigators, legal journalists, and judicial-ethics watchdogs. It continuously matches sitting federal judges' disclosed financial holdings against the named parties in the cases assigned to them, surfacing conflicts of interest that are grounds for recusal — and, retroactively, for vacatur on appeal.

## Problem
In 2021 the *Wall Street Journal* found 131 federal judges had unlawfully heard cases involving companies they owned stock in. Nobody caught it in real time because the two data sources — judges' annual financial disclosures and the parties on each docket — live in different systems and nobody joins them. A litigator who spots a conflict *before* judgment has leverage; one who spots it after has an appeal. Today that check is a manual, after-the-fact scandal, not a workflow.

## How it works
You add a watchlist: a judge, a company, or one of your own active cases. Recuse resolves the parties on that judge's dockets, matches them against the judge's most recent disclosure of stocks, funds, and reporting-family assets, and scores each potential conflict. When a fresh assignment or filing creates a match, you get an email/Slack alert with the docket, the disclosed holding, the transaction date, and a one-click evidence packet (disclosure PDF page + docket sheet) ready to attach to a recusal motion.

## Technical approach
Data comes from the CourtListener free APIs: the RECAP docket/search endpoints for cases and parties, the People endpoint for judge identity, and the Financial Disclosures database for asset holdings (already OCR'd into structured rows). Stack: Postgres + a nightly Python worker (CourtListener REST + webhook subscriptions for new filings), a small Next.js dashboard, Postmark for alerts. Data model: judges ⇄ holdings ⇄ (entity) ⇄ parties ⇄ dockets. The genuinely hard part is **entity resolution** — matching a disclosed line like "Acme Corp common" to a docket party "Acme Corporation, Inc." and to its ticker and subsidiaries. I lean on the SEC EDGAR ticker/CIK map plus a subsidiary graph, blocked candidate generation, and a scored match (name similarity + ticker + industry) with a human-review queue for anything under threshold.

## v1 scope
- One jurisdiction (a single circuit's district courts)
- Watch by judge only
- Nightly batch, email alerts
- Manual confirm queue for fuzzy entity matches
- Evidence packet = two linked PDFs

## Out of scope
- State courts, PACER paid pulls
- Real-time (sub-hour) alerting
- Automated legal advice or motion drafting

## Risks & unknowns
- Disclosure data lags 6–12 months; a judge may have divested — flag as "possible, verify."
- Entity resolution false positives erode trust fast; bias toward recall + human confirm.
- Willingness to pay: is this a $200/mo boutique tool or a per-motion service?

## Done means
Given a seeded judge with a known 2021 conflict, Recuse independently surfaces that case, links the correct disclosure line, and generates a packet whose two PDFs a lawyer confirms are motion-ready.
