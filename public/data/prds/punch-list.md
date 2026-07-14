## Overview
Punch List is a mobile-first tool for small landlords and property managers that converts a move-in and move-out photo walkthrough into a legally defensible, itemized security-deposit deduction statement. Buyers: independent landlords (1–20 units) and small PM shops who currently fight deposit disputes with a shoebox of blurry photos.

## Problem
Security-deposit deductions are a legal minefield: tenants dispute them, small-claims courts side with tenants who lack documentation, and landlords must distinguish 'damage' from non-deductible 'ordinary wear and tear.' New laws — notably California AB 2801, now phasing in — *require* landlords to take photographs before/after tenancy and include them with itemized statements. Most landlords have no system: they take random photos, forget the move-in baseline, and write vague statements like '$300 cleaning' that get tossed in court.

## How it works
1. Move-in: guided room-by-room photo capture (kitchen, each wall, floors, fixtures) with timestamps — this is the immutable baseline.
2. Move-out: the app re-prompts the *same* shot list, side-by-side with the move-in photo so the landlord reproduces the angle.
3. For each flagged item, landlord tags: damage vs. wear, description, and a cost (typed or pulled from a repair-cost library).
4. Punch List applies a depreciation/'useful life' schedule (e.g. paint lasts N years → prorated deduction) and flags deductions likely to be ruled 'ordinary wear.'
5. Output: a jurisdiction-aware itemized statement PDF with embedded before/after photos, timestamps, and statutory disclosures — ready to mail within the deposit-return deadline.

## Technical approach
Stack: React Native app, Node/Postgres backend, S3 with content-hash + EXIF preservation for provenance. Data model: `properties`, `units`, `inspections` (type: movein/moveout), `photos` (shotlist_slot, exif, hash), `deductions` (category, useful_life_months, age_months, prorated_amount). Depreciation engine: per-category useful-life table → `deduction = replacement_cost * (1 - age/useful_life)`. Optional CV assist: an on-device model highlights diffs between paired before/after shots to nudge the landlord toward real damage (nice-to-have, not load-bearing). The genuinely hard part is the legal ruleset: per-state deposit deadlines, itemization requirements, wear-vs-damage standards, and AB 2801's photo mandate — encode as a versioned per-jurisdiction JSON policy pack, launch CA-first where the law creates urgency.

## v1 scope
- Guided move-in and move-out photo capture with shot-list reproduction
- Manual per-item damage/wear tagging + cost
- Depreciation proration on a small category table
- CA-compliant itemized deduction PDF with embedded photos

## Out of scope
- CV auto-diff (manual first)
- E-signature / tenant portal
- Payment/deposit escrow handling

## Risks & unknowns
- Legal accuracy is the whole product; wrong disclosures create liability — needs attorney review per jurisdiction.
- Landlords are seasonal users (only at turnover) → low engagement, pricing likely per-inspection or per-unit/year.
- Reproducing camera angles is fiddly; ghost-overlay UX is critical.

## Done means
A landlord completes a move-in walkthrough, months later completes a paired move-out walkthrough, tags three deductions, and Punch List outputs a CA-compliant PDF with correctly prorated amounts and embedded timestamped before/after photos that a small-claims judge would accept.
