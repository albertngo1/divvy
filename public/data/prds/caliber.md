## Overview
Caliber is a mobile field tool for vintage-watch flippers, repair shops, and estate resellers. Open the caseback, photograph the movement, and Caliber matches it against a caliber database to return the maker + caliber number, beat rate (bph), jewel count, known parts, common failure points, and rough service cost/interval. Riffs on the resurgent watch-repair trade (Canada's 80-year watchmaking school) meets on-device field extraction.

## Problem
Identifying an unmarked or partially-marked movement is a manual slog: flippers squint at Ranfft/17jewels, compare bridge shapes and screw positions by eye, and ask forums. Getting the caliber wrong means ordering wrong parts, mispricing a listing, or buying a lemon. Chrono24/eBay volume is huge and growing; the ID step is the bottleneck and it's done from memory.

## How it works
User photographs the movement (guided overlay: 'caseback off, balance at top'). App runs a visual embedding of the movement layout — bridge geometry, balance position, click/ratchet wheel arrangement, engravings — and returns top-5 caliber candidates with confidence and side-by-side reference photos. User confirms; app then surfaces beat rate, jewels, base-caliber lineage, known weak points, and a parts cross-reference. Confirmed IDs feed back as labeled training data (human-in-the-loop). Optional: paste the confirmed caliber into a listing-description generator.

## Technical approach
Stack: React Native app; a CLIP-style image embedding model fine-tuned on movement photos; a vector DB (pgvector) of reference embeddings keyed to a scraped/curated caliber table (Ranfft data + community photo sets, respecting licensing). On-device: run a lightweight embedding model (Core ML / TFLite) for privacy + offline shops; fall back to server for the full match. Data model: `caliber` (specs, lineage, weak points), `reference_photo` (embedding), `identification` (photo, top-k, confirmed). Hard part: robustness to lighting, dust, partial disassembly, and near-identical calibers that differ only by a bridge stamp — needs OCR of engravings fused with the layout embedding.

## v1 scope
- Top-100 most-traded vintage calibers only (ETA, Seiko, Valjoux, AS)
- Photo → top-5 candidate list with reference images
- Specs + weak-points card per caliber
- Manual confirm that logs training data

## Out of scope
- Parts ordering / marketplace transactions
- Authenticity / fake detection
- Modern in-house calibers with no reference corpus
- Valuation estimates

## Risks & unknowns
- Reference photo licensing (Ranfft, forums) — must curate rights-cleared corpus
- Near-duplicate calibers may be visually indistinguishable without the stamp
- Market size for a paid tool vs. hobbyist free-forum culture

## Done means
Given 20 held-out photos of known calibers from the top-100 set, the correct caliber appears in the top-5 for at least 15, and each returns a populated specs + weak-points card.
