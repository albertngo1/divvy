## Overview
A phone web app for anyone who just removed a tick. You place it dorsal-side up next to a credit card and shoot one photo. It returns an estimated attachment duration in hours, with an honest interval, plus the one sentence a clinician actually needs. For hikers, parents, dog owners, and camp nurses in Lyme country.

## Problem
Every tick tool on the internet answers the easy question — what species is this — and dodges the one that changes decisions. Transmission of *Borrelia burgdorferi* is near zero under 24 hours and climbs steeply after 36-48. "Was it on you long enough?" is the entire question, and the standard answer is a person squinting at a bug and guessing. Expert photo services exist but take one to three days to reply, which is longer than the prophylaxis window.

## How it works
1. Remove the tick, drop it on any credit-card-sized card (85.60 mm long edge is the fiducial).
2. Shoot one overhead photo, dorsal side up, in the app.
3. The app finds the card corners, rectifies the image to millimeters, and segments the tick.
4. It measures two numbers: total body length and scutum width — the *scutal index*. The scutum is a fixed plate; the body swells around it, so their ratio is an odometer for feeding time.
5. It reports a range ("roughly 26-40 hours, likely past the low-risk window"), the stage and species it thinks it saw, a confidence flag if the view is ventral or the tick is damaged, and a copyable summary line plus the saved photo for the doctor's visit.

## Technical approach
Browser-based, no upload required: ONNX Runtime Web with WebGPU fallback to WASM. Card detection via OpenCV.js contour finding plus perspective warp; if the card isn't found the app refuses rather than guessing scale. Segmentation: a small U-Net or MobileSAM distilled on tick photos, then ellipse fitting on the body mask and a second head for the scutum boundary. Species/stage classifier: fine-tuned MobileViT trained on research-grade *Ixodes scapularis* images from iNaturalist and GBIF, plus the public TickBase/Tick App image sets. Duration estimate: published scutal-index-to-hours regressions (Falco/Fish and follow-ups for nymphs and adult females), applied per stage, output as a prediction interval rather than a point. Data model is one local record per encounter — photo blob, mm measurements, stage, interval, timestamp, optional coarse location — all in IndexedDB. The genuinely hard part is ground truth: almost no public images carry a known attachment time, so v1 must lean on measurement accuracy against the published regression instead of learning duration end to end, and the measurement error bars have to be propagated honestly into the hour range.

## v1 scope
- Adult female and nymph *I. scapularis*, dorsal view only
- Manual measurement: user taps four points (body ends, scutum edges); no segmentation model at all
- Card-based scale rectification
- One published regression per stage, output as a range
- Local history list

## Out of scope
- Pathogen testing, actual diagnosis, or dosing advice
- Other genera (*Amblyomma*, *Dermacentor*) and non-US species
- Cloud accounts, submission pipelines, maps

## Risks & unknowns
Regression coefficients vary by study and host; the interval may be too wide to be actionable for nymphs. Engorged ticks are shiny and round, which wrecks naive segmentation. Medical framing must stay decision-support, never diagnostic, with an explicit "see a clinician" path. Ventral photos hide the scutum entirely and must be detected and rejected.

## Done means
Given ten photographed ticks of known removal time from a volunteer trial, the reported interval contains the true attachment duration in at least eight cases, and the whole flow from camera to answer takes under 45 seconds on a mid-range phone offline.
