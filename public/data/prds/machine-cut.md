## Overview
A phone web app for estate-sale resellers, small regional auction houses, and thrift flippers. It walks you through a five-photo evidence shot list on any piece of wood furniture and returns a **dated interval with a citation chain** — "1891–1936: wire nails present (post-1890), no Phillips screws (pre-1936), machine-cut dovetails with uniform 1:6 pins" — instead of an opaque price guess.

## Problem
Dating furniture is expensive expert knowledge held by a few hundred people. A formal appraisal runs $100+ and takes a week; a reseller looking at 40 pieces at an estate sale has ninety seconds each. They currently guess from style, which is exactly what reproductions imitate. Construction evidence — joinery, fasteners, saw marks, secondary wood — is far harder to fake and is *visible in a close-up photo*. That is the arbitrage: the signal is cheap to capture and the interpretation is scarce.

## How it works
Guided capture: (1) drawer pulled and turned to show the side joint, (2) drawer bottom / secondary wood, (3) a screw head, (4) case back, (5) an unfinished underside surface. Each photo runs a feature extractor:
- **Dovetails**: hand-cut (irregular pin widths, narrow pins, visible scribe line) vs machine-cut (uniform, equal pin/tail) vs Knapp/pin-and-cove joint (a hard 1871–1900 marker).
- **Saw marks**: straight parallel kerfs (pit/sash saw, pre-1830) vs circular arcs (post-1830) vs band-saw straight-with-drift — detected by FFT/Radon on the surface texture crop.
- **Fasteners**: hand-wrought vs cut nails vs wire nails; slotted vs Phillips (post-1936).
- **Materials**: plywood (post-1900s), particleboard (post-1950), dowel joinery (post-1890).

Each feature is a likelihood function over year. Posterior over decade ∝ ∏ p(feature | year) × era prior. The UI shows the posterior as a band with each feature's contribution listed, so a user can override any single call.

## Technical approach
FastAPI + a React PWA. Feature heads are lightweight classifiers (a linear head on DINOv2 or CLIP embeddings) — enough for 3–5 classes each with hundreds of examples. A VLM (Claude with a structured output schema) runs as the zero-shot bootstrapper and as a fallback describer for photos no head is confident on; its outputs go into a human-correction queue that builds the labeled set.

Training data: Smithsonian Open Access and Met Open Access APIs (dated objects, but mostly beauty shots — few joinery close-ups), supplemented with **synthetic dovetails rendered in Blender** with procedural pin/tail ratios, kerf irregularity, wood grain, and lighting. Store as `pieces → photos → features(type, class, conf) → posterior`.

The hard part is label scarcity: almost no public dataset shows a *dated* drawer side. Synthetic-to-real gap on joinery is the make-or-break.

## v1 scope
- Dovetails only: hand-cut vs machine-cut vs Knapp, 3 classes
- ~300 hand-collected photos from local antique shops
- Output a decade range with one sentence of reasoning
- No accounts, no pricing, no history

## Out of scope
Valuation, wood species ID, regional attribution, maker/label OCR, upholstery.

## Risks & unknowns
Deliberate reproductions mimic hand-cut joinery. Overconfident output could cause a bad resale claim — the interval must always be shown, never a point year. Auction-archive scraping for training data has ToS exposure; stick to museum open-access plus own photos.

## Done means
On a held-out set of 50 drawers with independently known dates, the returned interval contains the true year at least 80% of the time with median interval width under 40 years, and every result lists at least two distinct evidence features.
