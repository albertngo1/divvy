## Overview
A tiny always-there gauge that tracks live disputes between measurements of the same physical quantity. The menubar shows one number — the current tension in sigma for whichever dispute you've pinned — and a click opens the full history of that number: every published determination, with error bars, in time order. For physicists, metrology nerds, science journalists, and anyone who likes watching consensus wobble.

## Problem
Some of the most interesting things in science are *two numbers that refuse to agree*: the beam vs. bottle neutron lifetime, early- vs. late-universe H₀, lattice vs. data-driven hadronic vacuum polarization in muon g−2. These tensions move — a new result lands and 4.2σ becomes 1.8σ, or the reference value shifts and old results silently stop adding up. Following this means reading arXiv daily. There is no ambient way to feel it, and no easy way to see the drift pathology (each new measurement quietly hugging the previous one) that error-bar-over-time plots expose so brutally.

## How it works
A registry of "tensions," each a set of determinations: `{quantity, value, stat_unc, sys_unc, method_family, date, ref}`. Tension between two families is computed as |a−b| / √(σa² + σb² − 2ρσaσb), with ρ hand-set for shared systematics. The menubar renders a gauge (green under 2σ, amber to 3σ, red beyond) plus a one-week sparkline. The popover is the payoff: a timeline scatter with error bars, colored by method family, so you can see the bandwagon effect — Millikan's oil drop, the neutron lifetime, the proton radius puzzle — all in the same view. A daily digest line says things like "H₀ tension 5.1σ, unchanged; 2 new SH0ES-adjacent preprints queued."

## Technical approach
- Base data: NIST CODATA fundamental constants (`physics.nist.gov/cuu/Constants/Table/allascii.txt`) and the PDG REST API (`pdgapi.lbl.gov`) for particle properties and their historical value lists — PDG genuinely publishes the per-measurement history, which is the whole timeline view for free.
- Ingest: daily arXiv API query over `hep-ex`, `nucl-ex`, `astro-ph.CO` filtered by quantity aliases. Abstracts go through a Claude extraction pass that emits candidate `{value, ±stat, ±sys, method}` records — with a hard rule that nothing is auto-published. Candidates land in a review queue; one keystroke accepts.
- App: Tauri (Rust + a small web view) for a cross-platform menubar; SQLite for the registry; a nightly background fetch.
- Hard part is not the software, it's the epistemics: correlated systematics mean naive quadrature overstates tension, and "which measurements belong to the same family" is a judgment call. v1 makes ρ an explicit, visible, editable number rather than pretending it's zero.

## v1 scope
- Three hardcoded tensions (neutron lifetime, H₀, muon g−2), values hand-entered from PDG/CODATA.
- Menubar gauge for one pinned tension.
- Popover timeline with error bars.

## Out of scope
Auto-ingest, LLM extraction, notifications, non-physics domains, any editing UI.

## Risks & unknowns
Tensions update on a timescale of months, so the "live" framing may oversell it; abstract extraction will be noisy enough that curation is a real ongoing chore.

## Done means
The app independently reproduces the PDG-quoted tension for the beam-vs-bottle neutron lifetime to within 0.1σ, and its timeline view matches PDG's published historical plot for the same quantity.
