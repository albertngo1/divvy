## Overview
Tonnage is a phone app for HVAC service techs that reads an equipment rating plate from a photo and instantly returns manufacture date, capacity (tonnage/BTU), refrigerant type, electrical specs, and likely replacement parts. It's for field techs and small mechanical contractors — the people crouched on a hot roof squinting at a corroded sticker.

## Problem
Every manufacturer encodes the manufacture date and specs differently inside the model and serial number — Carrier's week/year scheme differs from Trane's, from Goodman's, from Rheem's, and older units use retired conventions. Techs currently type half-legible serials into a patchwork of "HVAC serial decoder" websites, or call the parts desk. It's slow, error-prone, and the date drives everything: warranty status, R-22-vs-R-410A refrigerant, and whether to repair or condemn. (Same spirit as `whatcable`: turn cryptic printed codes into plain English.)

## How it works
Tech snaps the nameplate. OCR extracts the model and serial strings; the app identifies the manufacturer (from logo/format heuristics or a dropdown) and runs the matching serial-decode rule to output manufacture month/year, tonnage (parsed from the model number's capacity digits), refrigerant, voltage/phase, and MCA/MOCP. It flags red items: "R-22 — phased out," "14 years old — near end of life," "warranty likely expired." One tap generates a customer-facing summary card with a repair-vs-replace note.

## Technical approach
Stack: React Native (camera + on-device crop), OCR via the platform vision API (VNRecognizeText / ML Kit) with a cloud fallback for bad plates. The core IP is a rules engine: a library of per-manufacturer decoders (`serial → date`, `model → tonnage/refrigerant`) expressed as small declarative parsers, since each brand is a distinct regex + lookup. Data model: `Manufacturer(patterns, decoders)`, `Reading(model, serial, decoded, confidence)`, `JobPhoto`. The genuinely hard part is robust field extraction: nameplates are dirty, angled, glare-hit, and mix embossed + printed text, so OCR confidence is low — v1 leans on a guided capture box and lets the tech correct the parsed model/serial before decoding. Seed the decoders from published manufacturer date-code tables (Carrier, Trane, Goodman, Rheem, Lennox, York) — public and well-documented.

## v1 scope
- Manual manufacturer pick (no logo classification)
- Decoders for the 4 biggest residential brands
- Editable OCR result before decode
- Date + tonnage + refrigerant + age/EOL flag

## Out of scope
- Live parts-catalog pricing/ordering
- Warranty API lookups per manufacturer
- Commercial/industrial and boiler nameplates

## Risks & unknowns
- OCR accuracy on corroded plates may force heavy manual entry
- Serial schemes have exceptions and undocumented edge years
- Contractors may already have brand loyalty to existing decoder sites

## Done means
For a photo of a real Carrier or Goodman nameplate, the app returns the correct manufacture year and tonnage matching the manufacturer's published date-code table, with a one-tap customer summary — verified against five actual units across two brands.
