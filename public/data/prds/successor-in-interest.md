## Overview

A paid single-query web service ($29/search, or $299/mo for estate attorneys and probate paralegals) that traces a defunct company name or old ticker forward through its entire corporate-action chain to whatever it is today — including "nothing, it went to zero in 1991" — and produces a printable lineage report with per-hop exchange ratios, a share-count computation, and a pointer to where the money physically is now.

## Problem

Every estate that touches a paper stock certificate hits the same wall. Google gives you the company's Wikipedia page, not the arithmetic. Brokers won't research it. The existing specialists (Stock Search International, R.M. Smythe) charge $85-$300 and take weeks, because a human reads Mergent manuals. Meanwhile ~$70B sits in state unclaimed-property funds, a real chunk of it escheated shares whose owners never learned their company became something else twice.

## How it works

1. You enter what's on the certificate: company name, state of incorporation, share count, issue date, and (if legible) the CUSIP.
2. The service resolves that to an issuer entity and walks the acquisition graph forward, hop by hop.
3. Each hop shows the deal, the date, the consideration (`0.4 shares SRE + $2.05 cash per share`), and the citation — an actual SEC filing link or a state incorporation record.
4. Output: today's share equivalent, current market value, cumulative splits applied, and a flag for each hop where cash consideration means the position was liquidated at that point (so: no, you don't own anything, but there may be an escheated check).
5. Final section auto-searches MissingMoney.com plus the big non-participating states (CA SCO, NY OUF, DE) for the registered holder's name.

## Technical approach

Backbone is EDGAR. `company_tickers.json` and the submissions API (`data.sec.gov/submissions/CIK##########.json`) give current entities plus `formerNames` with date ranges — that alone resolves a surprising number of name changes for free. Merger hops come from EDGAR full-text search (`efts.sec.gov/LATEST/search-index?q=%22Agreement+and+Plan+of+Merger%22&dateRange=`) over 8-K Item 2.01 and S-4/424B3 filings; exchange ratios are extracted from the prospectus with an LLM pass over the "Merger Consideration" section, every extraction stored with its filing accession number and character offsets so the report can cite the exact paragraph, plus a human review queue for anything under a confidence threshold.

Data model is a directed graph: nodes are issuers (CIK, state, incorporation/dissolution dates, former names), edges are corporate actions typed `merger | split | spinoff | name_change | dissolution | bankruptcy_cancellation`, each carrying a ratio, a cash component, an effective date, and a source citation. Valuation is a topological walk multiplying ratios to the terminal node, then a live quote.

The hard parts, honestly: EDGAR only goes back to ~1994, so pre-1994 chains need Mergent/Moody's manuals — v1 handles this by refusing older certificates rather than guessing. And CUSIP-to-issuer mapping is licensed by CUSIP Global Services, so the free path is name matching, which is brutal ("Pacific Enterprises" vs "Pacific Enterprises Inc" vs a totally unrelated 1970s namesake).

## v1 scope

- 1994-present chains only; older certificates get a "needs manual research" upsell
- Utilities and telecom sectors only (densest merger graphs, richest shoebox certificates)
- 200 pre-seeded lineage graphs, hand-verified
- One PDF report template
- Stripe checkout, no accounts

## Out of scope

Actually recovering the shares (that's a transfer agent's job); international issuers; cost-basis or tax reporting; bond and preferred lineages.

## Risks & unknowns

Misstating a valuation to someone settling an estate is a real liability — every report needs prominent "informational, verify with the transfer agent" language. Demand is genuinely episodic (people search once, on a death). LLM ratio extraction failing silently is the quality killer; the citation-offset requirement is the mitigation.

## Done means

Ten historical certificates with known answers (verified against transfer-agent records) run end-to-end, and the computed share equivalent matches on at least eight, with every hop citing a real filing.
