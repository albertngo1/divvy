## Overview
Save As is a browser tool that reverse-engineers a JPEG's provenance from its compression internals. Paste or drop an image; it reports which application(s) last saved it and how many times it's likely been re-encoded — a poor-person's image forensics lab for journalists, community moderators, and anyone verifying a screenshot before resharing.

## Problem
'Where did this image come from and has it been messed with?' is a question paid forensic suites answer for niche pros, while the rest of us eyeball pixels and guess. But JPEGs leak their history: every encoder writes characteristic quantization tables (DQT), Huffman tables, chroma subsampling, and thumbnail quirks. Photoshop, GIMP, iOS, WhatsApp, and Facebook each have recognizable signatures. That signal is *free to read* and unknown to most people — a clean arbitrage: cheap for a parser, valuable to a specific verification niche.

## How it works
You drop an image; everything runs client-side. Save As parses the JFIF structure, extracts the DQT matrices, subsampling mode, and any embedded thumbnail, and compares the quantization tables against a bundled database of known encoder fingerprints. It reports a ranked guess ('Adobe Photoshop, Save-for-Web quality ~60' or 'Facebook re-encode' or 'iOS camera original'), a recompression estimate (double-JPEG artifacts via a DCT-coefficient histogram check for 'saved more than once'), and an EXIF-vs-quantization consistency flag — e.g. EXIF claims 'iPhone 15' but the DQT screams 'Photoshop,' which means edited. A plain-language verdict, plus a raw-evidence panel for skeptics.

## Technical approach
Pure JS/WASM, no upload — critical for trust with sensitive images. Parse JFIF segments manually (walk markers: DQT, DHT, SOF0, APP0/APP1). Fingerprint DB built by harvesting DQT tables from images saved by common tools at various quality settings (seed from the public quantization-table literature and self-generated samples). Match via nearest-neighbor on the flattened 64-value luma/chroma tables. Double-compression detection: decode DCT coefficients (via a small WASM JPEG lib), histogram the AC coefficients, and look for the periodic gaps that re-quantization leaves. Hard part: the fingerprint DB coverage and disambiguating tools that share near-identical libjpeg defaults — hence layering subsampling, thumbnail presence, and EXIF cross-checks to break ties.

## v1 scope
- Client-side JFIF + DQT parse, EXIF extract
- Match against ~15 hand-collected encoder fingerprints
- 'Likely saved by X; EXIF says Y' consistency flag
- Raw evidence panel (DQT matrix, subsampling, thumbnail y/n)

## Out of scope
- PNG/HEIC/WebP (JPEG only for v1)
- Pixel-level tamper localization / error-level analysis heatmaps
- Any server upload or account

## Risks & unknowns
- Re-encoders (social platforms) wipe original signatures — must say 'last save' not 'origin'
- Fingerprint DB is laborious and never complete
- Overclaiming provenance is dangerous; UI must hedge honestly

## Done means
Feeding it a photo saved through Photoshop's Save-for-Web returns 'Adobe / SfW' and flags the EXIF-vs-encoder mismatch, while an untouched camera original reads as consistent — all offline in the browser.
