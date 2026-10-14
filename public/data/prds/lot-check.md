> **Spotted in the news:** Tampa Bay 28 ran an interactive asking 'Is that bottle of acetaminophen in your cabinet part of a recall?', because recalls are announced by lot code and nobody checks lot codes at intake, least of all volunteer-run pantries that redistribute household donations.

## Overview
Lot Check is a phone-based intake tool for food banks, food pantries and diaper/OTC banks. It checks donated items against active recalls at the lot-code level, at the sorting table.

## Problem
The Tampa Bay acetaminophen interactive shows how recalls work: by brand, UPC and specific lot numbers printed in tiny type. Households barely check. Pantries are worse off, because they redistribute thousands of donated items a week, sorted by volunteers who rotate every shift. Regional food banks get recall notices from Feeding America, but small partner pantries and church closets rely on someone happening to read the news. The costs are recalled formula, peanut-contaminated goods or adulterated OTC drugs reaching the most vulnerable clients, plus the liability that makes some pantries refuse OTC and baby items altogether.

## How it works
1. A volunteer scans the UPC.
2. If any active recall matches that UPC or brand+product, the app asks for the lot code. The volunteer types it or snaps a photo for OCR.
3. The app returns one of three answers: **green** (no recall), **red** (matches a recalled lot, set aside), or **amber** (recall exists for this product, lot unreadable, set aside).
4. A daily job re-checks the pantry's stocked inventory log against new recalls and pushes "pull these items" alerts.

## Technical approach
- PWA built with React and a Postgres backend, offline-capable for church basements.
- **Data sources:** openFDA food and drug enforcement endpoints (they include `code_info` with lot text), USDA FSIS recall API, CPSC recalls API.
- **Data model:** Recall(source, product_desc, upcs[], lot_patterns[], date_range), ScanEvent, Inventory.
- **The hard part:** `code_info` is free text ("Lots 2304A–2309C, exp 06/27"). It needs a parser that converts it into ranges and regexes, with an LLM-assisted extraction step whose output a human verifies for each new recall. UPCs are often missing, so brand+product fuzzy matching is a fallback.

## v1 scope
- FDA food and OTC drug recalls only
- Scan → red/amber/green, manual lot entry (no OCR yet)
- One partner food bank's network of about 10 pantries
- Weekly digest of new recalls relevant to commonly donated categories

## Out of scope (for now)
- Full inventory management (PantrySoft, Link2Feed already exist)
- Expiration-date enforcement
- Consumer app

## Risks & unknowns
- **Who pays:** regional food banks or Feeding America grants, about $500/yr per network. Pantries themselves won't pay.
- **Liability:** a false green is worse than having no tool, so messaging must say "checks known recalls" and amber must be the conservative default.
- **Friction:** if lot entry slows a 2-hour sort shift, volunteers skip it. The lot prompt must appear only when a recall exists for that product.

## Done means
Against a test set of 200 historical FDA recalls, the parser correctly classifies at least 95% of seeded recalled lots as red and produces 0 false greens. In a live pilot, the per-item scan adds a median under 4 seconds when no recall exists.
