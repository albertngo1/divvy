> **Spotted in the news:** NPR's 'They're stealing from the poor': A major source of SNAP fraud robs recipients of millions. Card skimming keeps draining EBT accounts on a predictable deposit-day schedule.

## Overview
Last Swipe is an intake form and clustering engine for SNAP benefit-theft reports. It is built for legal aid offices, food banks and state anti-fraud units. Victims, or the caseworkers helping them, record the last few legitimate places they used the card before it was drained. The system then finds stores and terminals that show up far more often than chance would predict, and sends a ranked list of likely skimmed terminals to the state EBT processor and the retailer.

## Problem
NPR reports that skimming 'robs recipients of millions'. Magstripe-only EBT cards are easy to clone. Thieves wait for the state's staggered deposit day and drain accounts within hours. Federal replacement of stolen benefits ran out in December 2024, so in most states the loss now falls on the family. A typical loss is $300 to $900, which is often the household's entire food budget for the month. Each victim's report goes into a separate call-center ticket, so nobody connects five drained cards that were all used at the same corner-store lane last Tuesday. Meanwhile the skimmer keeps collecting cards.

## How it works
1. A victim or caseworker fills in a 3-minute mobile form: county, drain date, and the last 3 places the card was used (store picker plus optional receipt photo). It also asks for a screenshot of the transaction history from ebtEDGE or the Propel app.
2. Store locations are matched against the USDA SNAP Retailer Locator dataset.
3. Every night a job scores each retailer by observed victim visits against expected visits, using retailer size and local SNAP volume as the baseline (Poisson rate test).
4. Any store that crosses the threshold produces a one-page alert: number of victims, date window, and lane if a receipt shows it. The alert goes to the partner org, which forwards it to the state processor (FIS or Conduent) and the store owner.

## Technical approach
Next.js form and Postgres with PostGIS. The USDA SNAP retailer CSV, updated quarterly, serves as the store dimension. Receipt and screenshot OCR runs through Tesseract or a vision model and pulls out merchant name and terminal ID. The hard part is the baseline. Big supermarkets will always show up in victims' histories, so expected visit rates have to be estimated from retailer type and county SNAP redemption data, which USDA publishes at an aggregate level. Fuzzy-matching merchant name strings to retailer IDs is the second hardest piece.

## v1 scope
- One state, one partner legal-aid org
- Web form only, caseworker-entered
- Nightly ranked store list emailed to the partner
- Manual match of the top 10 flagged stores

## Out of scope (for now)
- Direct integration with EBT processors
- Recipient-facing balance alerts (Propel already does this)
- Replacement-claim filing

## Risks & unknowns
Whether enough reports come in is the core risk: clustering only works once a single county produces dozens of reports. State processors might ignore third-party alerts. The likely buyers are state SNAP fraud units or a foundation grant, and procurement is slow. Victims are PII-sensitive and wary of anything that looks like a government form. Chip cards (California and Oklahoma are rolling them out) will shrink the problem over time.

## Done means
Using 60 days of reports from one partner, the system flags at least one terminal that the processor or retailer later confirms had a skimmer. The partner also files at least 50 reports through the form without help.
