## Overview
Born On Date is a phone-first field tool for HVAC/R service techs, home inspectors, and property managers. Photograph the equipment nameplate; get back manufacture date, tonnage, refrigerant, SEER, and warranty status in under three seconds — offline, in a 110°F attic, with no typing.

## Problem
Every HVAC manufacturer encodes manufacture date differently inside the serial number, and none of them agree. Trane uses a week-year prefix on some vintages and a letter-year on others; Goodman uses YYMM; Rheem uses MMYY plus a plant code; Carrier uses week-year *suffix*. Techs currently squint at a sun-bleached, wasp-nested plate, hand-copy a 14-character serial into a phone, and Google "lennox serial number decode" while standing on a roof. Getting it wrong is expensive in both directions: quoting a replacement on a unit still under 10-year parts warranty burns a customer, and missing a 2010-vintage R-22 unit means quoting a repair that can't legally be done cheaply.

## How it works
1. Tech frames the plate. Live preview draws boxes around the two fields that matter (MODEL, SERIAL) rather than dumping raw OCR.
2. Multi-frame capture: 8 frames over ~1.5s, OCR each, vote per character. Corrosion and glare move between frames; the true character doesn't.
3. Brand is inferred from logo + plate layout (a small classifier), which selects the right serial grammar.
4. Each brand's grammar is a declarative rule: a regex with named capture groups plus a date-extraction expression, e.g. Goodman `^(?<yy>\d{2})(?<mm>\d{2})\d{5,}` → 20YY-MM. Ambiguity is surfaced, not hidden: "Rheem: 2014-06 (95% confident) or 2006-14 (invalid month) → 2014-06."
5. Output card: age, refrigerant (from model prefix + date heuristics), parts-warranty expiry given registration assumption, and AHRI reference if the model matches an outdoor/indoor pair.
6. One tap exports to the tech's invoice as a photo + decoded block — the photo is the audit trail.

## Technical approach
Expo/React Native shell. On-device OCR via Apple Vision (`VNRecognizeTextRequest`, accurate mode) and ML Kit on Android — no server round trip, because attics have no signal. Preprocessing: CLAHE contrast normalization plus a perspective unwarp from the detected plate quad. Character-level voting across frames with a confusion prior (8/B, 0/O/D, 1/I, 5/S, 2/Z) so a single bad frame can't flip the year.

Data model: `brand → [ {vintage_range, serial_regex, date_expr, notes, source_url} ]`, seeded from published decoder tables (Building Intelligence Center, manufacturer service bulletins) and shipped as a signed JSON bundle that updates out-of-band from app releases. AHRI Directory is scraped/cached for model pairs.

The genuinely hard part is not OCR — it's rule coverage and *trust*. There are ~40 brands × multiple vintages, rules conflict, and a confidently wrong date is worse than no date. So every decode carries a confidence and a citation link to the rule's source, and disagreements between two candidate rules are shown side by side rather than silently ranked.

## v1 scope
- Six brands only: Goodman/Amana, Carrier/Bryant, Trane/American Standard, Rheem/Ruud, Lennox, York.
- Serial → manufacture date. Nothing else decoded.
- Manual serial entry always available as the escape hatch.
- Share sheet export of photo + text block. No CRM integration.

## Out of scope
Commercial chillers, boilers, European brands, warranty registration lookup via manufacturer portals, parts ordering, any account system.

## Risks & unknowns
Decoder tables are community-maintained and partly wrong; need a "this is incorrect" report loop from day one. Plate OCR on stamped (not printed) metal is materially harder — may need a dedicated embossed-text path. Manufacturers could object to redistributing decode tables, though the rules themselves are facts.

## Done means
Given a test set of 60 real plate photos across the six v1 brands — including 15 deliberately corroded or glare-blown — the app returns the correct manufacture month/year for ≥90% within 3 seconds on an iPhone 13 in airplane mode, and every remaining case returns "unsure" rather than a wrong date.
