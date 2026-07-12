## Overview
Clean Claim is a pre-submission linter for dental insurance claims, sold to independent dental practices and the third-party billers who serve them. It catches the avoidable denials — missing or wrong attachments, documentation, and formatting — before the claim leaves the office.

## Problem
Dental practices bleed revenue to denials, and a huge share aren't clinical disputes — they're 'attachment required', 'missing periodontal charting', 'radiograph not diagnostic', 'narrative required for D4341'. Each payer has its own quietly-changing rules about what a given procedure code needs. Front-desk staff learn this by getting denied, re-working the claim, and resubmitting weeks later. The money arrives a month late or not at all.

## How it works
The office's practice-management system (Dentrix, Open Dental, Eaglesoft) exports or feeds a pending claim. Clean Claim reads the procedure (CDT) codes, the payer, and the attached documents, then runs a payer-specific rule set: 'D2740 crown for Delta CA → needs pre-op radiograph + narrative if within 5 yrs of prior'. It returns a red/yellow/green verdict per claim with a checklist of exactly what's missing, so staff fix it once, up front. A weekly digest shows which rules are catching the most would-be denials.

## Technical approach
Stack: a rules engine over Postgres, a lightweight importer for Open Dental's schema (SQL) and standard 837D/CSV exports, Next.js UI. Data model: payer → CDT code → requirement rules (attachment type, frequency limits, narrative triggers) with effective dates. Rules are seeded from published payer processing manuals and the client's own historical remittance (835/ERA) denials — we mine their past denial-reason codes (CARC/RARC) to auto-learn which code+payer combos burn them most. The hard part is maintaining accurate, current payer rules at scale; we treat each practice's own denials as ground-truth telemetry that continuously sharpens the rule set.

## v1 scope
- Import pending claims from Open Dental for one office
- Rule sets for the top 5 payers and top 20 CDT codes
- Red/yellow/green + missing-attachment checklist per claim
- Weekly 'denials prevented' count

## Out of scope
- Actual claim submission / clearinghouse integration
- Appeals drafting (that's the losing, downstream game)
- Medical (vs dental) billing

## Risks & unknowns
Payer rules are undocumented and drift constantly — the mining-from-denials loop must carry the load, and cold-start accuracy for a new payer is weak. HIPAA scope means BAAs and careful PHI handling from day one. Some PMS vendors gatekeep data access.

## Done means
On a practice's real backlog, Clean Claim flags a claim that was in fact later denied for a missing attachment, names the correct missing item, and across a month measurably lowers that office's attachment-related denial rate versus their baseline.
