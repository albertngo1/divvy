## Overview
Callout is an offline, on-device voice-to-work-order app for field service techs — HVAC, plumbing, elevator, appliance repair — who work where there's no signal. Speak the job, get a structured work order.

## Problem
Techs must record parts used, labor hours, equipment make/model/serial, and diagnosis for invoicing and warranty. But typing on a phone in a crawlspace or mechanical room is miserable, and cell/wifi is usually dead down there — so notes get lost or reconstructed hours later, delaying billing and eroding warranty claims.

## How it works
The tech taps record and talks naturally: "replaced the run capacitor, 45/5 MFD, unit's a Carrier 24ACC6, serial 1234, hour and a half." Fully offline ASR transcribes it, and an on-device small model extracts a structured work order — parts with quantities, labor hours, make/model/serial, symptom, resolution. The tech reviews the parsed fields, snaps a nameplate photo (OCR'd to confirm the serial), and signs off. When signal returns it syncs to the office or exports to the invoicing tool.

## Technical approach
React Native. ASR via Moonshine micro / whisper.cpp compiled for mobile — the sub-500kb speech models making truly offline field ASR viable on cheap phones is the direct spark. Structured extraction via a small quantized on-device LLM (Qwen 3.8-tiny / Phi class) with grammar-constrained JSON decoding, so output is always a valid work-order object even offline. Nameplate OCR via ML Kit; fuzzy-match the extracted model against a bundled equipment/parts catalog (SQLite FTS) to normalize part numbers. Sync layer: a local queue posts to a Django/Supabase backend when online and exports ServiceTitan/Housecall Pro CSV. The hard part is robust extraction of noisy jargon (MFD ratings, refrigerant types, alphanumeric serials) fully offline with acceptable latency on a mid-range Android, plus a correction UI that's genuinely faster than typing.

## v1 scope
- Offline record → transcript → regex+small-model extraction of {parts[], hours, model, serial, notes}
- Editable review form
- JSON / CSV export
- Single trade (HVAC) catalog bundled

## Out of scope
- Dispatch and scheduling
- Live office sync (queue-and-export only in v1)
- Payments
- Multi-language and other trades' catalogs

## Risks & unknowns
On-device model accuracy on trade jargon. Phone compute and battery under sustained inference. Adoption versus incumbent field-service-management apps. Noisy job-site audio (compressors, blowers).

## Done means
With airplane mode ON, speaking a realistic HVAC repair produces a correct, editable work order with parts, hours, and serial in under 15 seconds on a $300 Android.
