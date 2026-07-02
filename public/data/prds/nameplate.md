## Overview
A mobile field tool for HVAC, refrigeration, and appliance technicians. Point your phone at the equipment's metal rating plate, and Nameplate reads the model and serial number, then decodes everything the manufacturer buried in those strings: date of manufacture, cooling capacity (tonnage/BTU), refrigerant type, efficiency rating, and warranty status. For the solo tech and small service shops, not the enterprise.

## Problem
Every service call starts with a tech squinting at a corroded, greasy nameplate behind a condenser coil, hand-typing a 20-character serial into a work order. The serial isn't just an ID — each brand encodes the manufacture *date* into it differently (Carrier uses week/year in positions 1–4, Trane uses a year+week prefix, Goodman embeds YYMM). Techs either memorize a dozen brand rulesets or guess the unit's age wrong, mis-quote warranty coverage, and lose margin. There's no fast, offline, brand-aware decoder in a glove-friendly app.

## How it works
1. Tech frames the plate; the app auto-captures when text is sharp and glare is low.
2. On-device OCR extracts candidate model/serial strings, cleaning O/0 and I/1 confusions.
3. A brand classifier picks the manufacturer from plate layout + model prefix.
4. The matching decode ruleset parses the serial → manufacture date; the model number → tonnage, refrigerant, SEER.
5. A card shows age, 'X years into a 10-year parts warranty,' and flags R-22 phase-out units. Everything is savable/exportable to the work order.

## Technical approach
Expo/React Native. On-device OCR via Apple Vision (iOS) and ML Kit / LiteRT-LM (Android) — no server round-trip so it works in a basement with no signal. The core asset is a versioned JSON rules pack: per-manufacturer regex + positional decoders for serial→date, plus model→spec lookup tables scraped/curated from public nomenclature guides (Building Intelligence Center, Preston's Guide, manufacturer PDFs). Data model: `{brand, serialPattern, dateExtractor, modelTokens, refrigerant, capacityTon}`. The genuinely hard part is coverage and correctness of decode rules across brands and their historical scheme changes — plus OCR robustness on pitted, angled, sun-faded plates.

## v1 scope
- iOS only, top 5 residential brands (Carrier, Trane, Goodman, Lennox, Rheem)
- Manufacture-date + refrigerant decode only
- Manual-edit fallback for every field
- Copy-to-clipboard export

## Out of scope
- Warranty API lookups against manufacturer portals
- Multi-plate/asset history
- Parts ordering, pricing

## Risks & unknowns
- Decode rules drift as brands change schemes; needs a correction feedback loop
- OCR accuracy on the worst 10% of plates
- Whether techs trust an auto-decoded date enough to quote off it

## Done means
Given 30 real photos of covered-brand plates, the app returns the correct manufacture year for ≥90% and the correct refrigerant for ≥95%, fully offline, in under 3 seconds per capture.
