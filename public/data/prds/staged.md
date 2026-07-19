## Overview
Staged is a browser extension for apartment hunters that flags AI-generated and AI-"virtually staged" photos on listing sites (Zillow, StreetEasy, Apartments.com). It turns the fun-house toy of AI image detection into something dangerously useful: catching landlords who paint over a water-stained ceiling with a Midjourney one. Sparked by NYC moving to *require* disclosure of AI in listings — Staged enforces it whether they disclose or not.

## Problem
Virtual staging and outright AI generation are now standard in real-estate marketing, and the results are good enough that a renter can't tell the sunlit hardwood floors from the actual scuffed laminate until move-in day. Disclosure rules are coming but unenforced and easy to skirt. Renters have no forensic tooling; they just squint and hope.

## How it works
On a listing page, Staged intercepts each photo and runs a per-image analysis, overlaying a small badge: **Real / Virtually Staged / AI-Generated / Inconclusive**, with a confidence bar. Click a badge to see *why* — a heatmap of suspicious regions (impossible reflections, warped cabinet hardware, furniture that doesn't cast shadows), C2PA/metadata findings, and any provider watermark hits. A listing-level summary tallies "3 of 12 photos likely AI-edited" and lets you export a dated evidence PDF to wave at a broker or attach to a complaint.

## Technical approach
Stack: WebExtension (Chrome/Firefox) + a local Python/ONNX inference service (or WASM for fully client-side). Layered signals, cheap-to-expensive: (1) metadata — read C2PA manifests, XMP, and known virtual-staging vendor tags via exiftool-wasm; (2) provider watermarks — SynthID/where-detectable and vendor overlays; (3) forensics — DCT/JPEG-ghost and error-level analysis to spot recompressed pasted regions, plus a small trained classifier (EfficientNet/ViT) fine-tuned on paired real-vs-virtually-staged interiors. The genuinely hard part is the false-positive tax: MLS pipelines recompress everything, so naive ELA screams on legitimate photos. Mitigate by calibrating against a corpus of known-real MLS images and reporting *relative* anomaly, plus requiring agreement across ≥2 independent signals before a hard "AI-Generated" verdict.

## v1 scope
- One site (StreetEasy)
- Metadata + one forensic signal (JPEG-ghost) + one small classifier
- Three-state badge with confidence, no heatmap
- Manual "scan this page" button, not auto-run

## Out of scope
- Video walkthroughs
- Automated complaint filing to regulators
- Detecting *staging* of real physical furniture (only digital edits)

## Risks & unknowns
- Detector accuracy on modern models is genuinely uncertain; must show calibrated confidence, never false certainty.
- Legal/defamation exposure from labeling a listing "fake" — frame as "likely AI-edited," evidence-based.
- Sites may block scraping/DOM injection.

## Done means
On a real StreetEasy listing containing at least one known virtually-staged photo, Staged badges that photo as AI-edited with its metadata evidence, and does *not* flag a corpus of known-unedited MLS photos above the false-positive threshold.
