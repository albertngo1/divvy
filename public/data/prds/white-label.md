## Overview
White Label is a phone-first tool (and browser extension) for skeptical shoppers, dupe-hunters, and resellers. Point your camera at a product's regulatory label — or paste a model number — and it tells you who *actually* manufactured it, and which other brands sell the identical device for less.

## Problem
Vox's 'dupes took over the world' and the Microsoft 'proprietary-format lock-in' story are the same itch from two ends: brands charge a premium for something functionally identical to a cheaper equivalent, and they hide the equivalence. For most electronics the equivalence is *provable* — it's stamped on the device — but nobody bothers to look it up. You end up paying $180 for a 'premium' Bluetooth earbud that's the same molded plastic as a $22 one.

## How it works
Every radio device legally sold in the US carries an FCC ID (e.g. `2AB3C-XYZ100`). The first 3–5 characters are the *Grantee Code*, which maps to the real corporate manufacturer regardless of the brand printed on the box. White Label:
1. OCRs the FCC ID (or UL file number) off a label photo.
2. Resolves the Grantee Code to the true manufacturer via the FCC OET Equipment Authorization System.
3. Pulls that grantee's other filings and clusters 'sibling' devices by matching the internal-photos every FCC filing must publish (perceptual hash of the PCB shots) plus form-factor tags.
4. Renders: 'Made by Shenzhen X. 6 other brands ship this exact board. Cheapest: $22.'

## Technical approach
Stack: React Native + on-device OCR (Vision/MLKit) for the FCC ID; a Node backend caching the FCC EAS weekly bulk data dumps and the public EAS query endpoint (`apps.fcc.gov/oetcf/eas`); Postgres. Data model: `product → fcc_id → grantee_code → grantee (real manufacturer) → sibling_filings`. Sibling clustering: download each filing's internal-photo PDF exhibits, run a pHash + ORB feature match to confirm same-board (not just same-grantee). The genuinely hard part is mapping a *consumer* listing (brand + fuzzy model name) to an FCC ID when it isn't printed on the outside — solved via a crowd-sourced brand↔FCC-ID map plus scraping fccid.io.

## v1 scope
- Manual FCC ID entry → grantee name + link to filing.
- Cache the FCC grantee-code table; show 'true manufacturer'.
- List sibling filings by same grantee (no photo-matching yet).
- Shareable card: 'This brand is really ___.'

## Out of scope
- Non-RF products (no FCC ID: cookware, apparel dupes).
- Automated price-comparison across retailers.
- International equivalents (CE/UKCA) beyond a stub.

## Risks & unknowns
- Same grantee ≠ same device; photo-matching is required to avoid false 'dupe' claims — legal/reputational risk if wrong.
- fccid.io scraping is fragile; FCC bulk data is the durable source.
- Grantee shells and rebadging chains can obscure the true OEM.

## Done means
Scan the label of one earbud and one no-name Amazon earbud that share a grantee, and White Label independently reports the same manufacturer plus at least one matched sibling filing, with a link to the FCC internal-photo exhibit proving it.
