## Overview
Hour Meter is a paid service for the secondhand GPU market: sellers run a 20-minute diagnostic, get a signed, publicly verifiable condition report with a short ID they paste into their eBay/Reddit/Facebook listing, and buyers look it up before paying. Think Carfax, but the odometer is inferred from physics because GPUs don't have one.

## Problem
Used GPUs are a multi-billion-dollar market running on vibes. "Never mined, light gaming" is unfalsifiable. Cards come back with pumped-out thermal paste, dying fan bearings, memory that's marginal at stock clocks, shunt mods, reflowed BGA, or aftermarket VRAM upgrades (the 22GB 2080 Ti mod) that are perfectly real but stability-unknown. Buyers price in that risk, which means *honest sellers get paid less than they should*. That gap is the business.

## How it works
1. Seller pays $9, downloads a signed single-file binary, runs it. No install, no account until payment.
2. The tool runs a battery of wear proxies, each producing a number with a confidence band:
   - **VRAM retention margin**: memory stress at stock and at −100 MHz undervolt/+100 MHz, counting corrected/uncorrected errors and computing the clock headroom before first error. Wear and marginal aftermarket modules show up as a shrunken margin.
   - **Fan bearing coast-down**: spin fans to 100%, cut PWM to zero, log tachometer decay. Healthy sleeve/FDB bearings coast an exponential-ish curve; worn ones stop abruptly. This is a genuinely good, hard-to-fake mechanical wear signal.
   - **Thermal interface health**: 10-minute fixed-power soak, tracking edge-to-hotspot delta over time. Pump-out shows as a delta that grows during soak rather than plateauing.
   - **Persistent counters**: NVML/ADL aggregate ECC error counts, total energy consumption counters, VBIOS version/hash vs. a database of stock and known-modded images, straps that reveal a VRAM swap.
   - **Power delivery sag**: sustained max-load clock stability vs. the card's own reported power limit.
3. Results, plus a hardware fingerprint (PCI device ID + VBIOS hash + board serial where exposed), are signed server-side and published at `hourmeter.report/<id>` with a plain-English grade and, importantly, an explicit list of checks that *could not run* on this card.

## Technical approach
Rust CLI, statically linked, Windows + Linux. NVML (NVIDIA) and ADLX/sysfs (AMD) for telemetry; the memory stress kernel is CUDA/HIP with an OpenCL fallback — a march-style pattern over allocated VRAM with checksum verification, deliberately timed to catch retention (write, dwell, read) rather than just logic errors. Fan tach sampling at 10 Hz through NVML; coast-down fit to a two-parameter exponential, compared against a per-model reference distribution.

Data model: `report(id, gpu_fingerprint, model_sku, metric[], grade, signed_at, sig)`. The reference distributions are the moat — bootstrap them by paying for reports on cards of known provenance (retail-new, known-mined lots from resellers) and improve percentile calibration as volume grows.

Hard part: **anti-fraud.** A seller can run the tool on a good card and list a bad one. Mitigations: the report is bound to a board fingerprint that buyers can check with a free read-only verifier, listings must include a photo of the card, and reports expire in 30 days. It won't be airtight; it needs to be better than nothing, which is the current baseline.

## v1 scope
- NVIDIA only, Turing through Ada
- Three metrics: VRAM retention margin, fan coast-down, hotspot delta drift
- Stripe checkout, static report page, free verifier command
- Hand-curated reference data for the 15 most-traded SKUs

## Out of scope
- AMD/Intel cards, laptops, eBay API integration, escrow, disputes/insurance

## Risks & unknowns
- Do these proxies actually correlate with remaining life? Needs validation against a lot of known-mined cards.
- Stress tests on a dying card may kill it mid-run — needs a loud consent screen.
- Marketplace policy: eBay may object to third-party badges in listings.

## Done means
Given ten cards of known history (five retail-new, five ex-mining), the grade correctly separates the two groups in at least eight cases, and a buyer with only the report ID and a listing photo can independently confirm the report matches the pictured card.
