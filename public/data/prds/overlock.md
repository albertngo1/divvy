## Overview
Overlock is a B2B SaaS for self-storage facility operators that manages the legal lien-and-auction lifecycle for delinquent units. It tracks each unit's state-mandated notice timeline, drafts compliant notices, and produces an auction-ready, court-defensible paper trail. Named for 'overlocking' — the operator's second lock placed on a nonpaying unit.

## Problem
When a tenant stops paying, an operator can't just cut the lock and sell the contents. Every US state imposes a strict lien procedure: specific waiting periods, certified-mail notice with exact required language, public advertisement, and only then an auction. Get the timing or wording wrong and the auction is void — inviting lawsuits and wiped-out proceeds. Small and mid-size operators (1–20 facilities) track this on whiteboards and spreadsheets, and routinely botch it. Why now: online storage auctions (StorageTreasures, Lockerfox) are mainstream, and states keep amending statutes (e-notice, email allowances), so hand-maintained checklists rot fast.

## How it works
Operator flags a unit as delinquent (or syncs from their management software). Overlock instantiates a state-specific timeline: computes each required date (pre-lien notice, lien notice, advertisement window, earliest legal sale date) from the delinquency date and the tenant's contract. At each milestone it generates the correctly-worded notice as a mail-merged PDF, integrates certified-mail dispatch, and logs proof. A dashboard shows every delinquent unit as a horizontal timeline with the next required action and a red flag if a deadline is missed. When the clock clears, it exports a listing packet to the auction platform.

## Technical approach
Rails or Django + Postgres. Core is a rules engine: a versioned per-state JSON ruleset encoding waiting periods, notice types, required statutory language templates, and advertisement rules, with an effective-date field so historical units use the law as it stood. Timeline computation is date arithmetic over business/calendar days per statute. Integrations: Lob API for certified mail + delivery tracking; CSV/API sync with storage management systems (storEDGE, SiteLink, Storable); export to StorageTreasures. Data model: Facility → Unit → Tenant → LienCase → NoticeEvents. The genuinely hard part is legal accuracy across 50 states and keeping rulesets current — this is a legal-content moat, not just code, so v1 ships 3–4 states reviewed by a storage attorney.

## v1 scope
- 3 states, attorney-reviewed rulesets
- Manual unit entry, auto-computed timeline
- Generate certified-notice PDFs with correct language
- Missed-deadline alerts via email

## Out of scope
- All 50 states
- Direct management-software two-way sync
- Payment collection / tenant portal
- Auction hosting itself

## Risks & unknowns
- Legal liability if a ruleset is wrong — needs disclaimers and attorney sign-off
- Statutes change; maintenance is ongoing cost
- Incumbents may bundle this into management software

## Done means
An operator enters a delinquent unit in a supported state, Overlock produces the full correctly-dated notice schedule, generates a compliant certified notice PDF, and flags the earliest legal sale date — all matching that state's statute as verified by counsel.
