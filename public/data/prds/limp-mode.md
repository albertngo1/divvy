## Overview
Limp Mode is an offline fault-code decoder for heavy and agricultural equipment, built on the *public* SAE J1939 SPN/FMI diagnostic standard plus crowd-sourced per-manufacturer overlay packs. It's for farmers, owner-operators, and independent mechanics who get locked out of dealer diagnostic tools.

## Problem
The FTC just forced John Deere to open up repair, but the day-to-day pain remains: a machine throws a code, the dash shows a cryptic `SPN 636 / FMI 4`, and the only way to learn what it means is a dealer service call billed at shop rates. The J1939 diagnostic codes are a genuinely public standard, yet the decode tables are scattered across paywalled PDFs, forum posts, and OEM portals. Nobody who's stuck in a field at harvest can assemble them.

## How it works
Two entry paths: (1) plug a ~$15 ELM327/J1939 Bluetooth dongle into the equipment's diagnostic port, or (2) just type the SPN + FMI numbers shown on the dash. The app decodes to: affected component, failure mode in plain English, likely causes ranked, severity, and whether it triggers limp-home. Each code+model page carries crowd-sourced "what actually fixed it" notes.

## Technical approach
SPN (Suspect Parameter Number) and FMI (Failure Mode Identifier) come from SAE J1939-71/73; the base tables are public and ship as a bundled SQLite pack. React Native app talks BLE to the ELM327, reading PGN 65226 (DM1 — active DTCs) and unpacking the SPN/FMI/occurrence-count bitfields. Manufacturer-proprietary SPNs (above 520192) are handled by versioned per-brand JSON overlay packs, seeded from public sources and extended by user submissions. The genuinely hard part: proprietary PGN encodings differ per OEM and some are lightly obfuscated, so the overlay format must tolerate partial/uncertain decodes and label confidence.

## v1 scope
- Single brand overlay (John Deere) plus the base J1939 table
- Manual SPN+FMI entry only (no dongle yet)
- Fully offline decode of ~500 base codes
- 20 hand-curated common codes with fix notes

## Out of scope
- Clearing or writing codes; actuator/output tests
- Live sensor telemetry streaming
- Automotive OBD-II passenger cars

## Risks & unknowns
- OEMs may encrypt proprietary PGNs or send C&Ds over decode packs
- Dongle protocol variance (J1939 vs J1708/J1587 on older gear)
- Liability if a bad decode leads to a costly wrong repair

## Done means
With no network, entering `SPN 636 FMI 4` returns "Engine Position Sensor — voltage below normal; check sensor wiring/connector; limp mode likely," and a real ELM327 read of an active DM1 frame resolves to the same page.
