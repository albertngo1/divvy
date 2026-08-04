## Overview
Serial Number is a searchable index of scientific and industrial instrument *models* — not listings — each carrying a **Liberation Score**: how feasible it is to buy this thing used and actually run it in 2026. It serves university surplus buyers, small biotech and hardware startups, community bio labs, repair shops, and teaching labs in low-budget institutions, plus the refurbishers who resell to them.

## Problem
Universities dump working HPLCs, plate readers, thermocyclers, spectrometers, and oscilloscopes every semester. They sell for cents on the dollar because the *control software* is orphaned: a 2009 vendor app that needs a parallel dongle and XP. Buyers can't tell, from an auction title like `AGILENT 1100 G1312A BIN PUMP AS IS`, whether the instrument speaks plain SCPI over RS-232 (trivially driveable from Python forever) or a proprietary binary protocol behind a dead license server. So they don't bid, and the machine is scrapped. The knowledge exists — scattered across GitHub repos, LabWrench threads, and forum posts — and nobody has joined it to the model numbers.

## How it works
A crawler pulls surplus listings (GovDeals, Public Surplus, university surplus sites, eBay's lab category). An extraction pass resolves each messy title to a canonical `(manufacturer, family, model, module)` tuple. For each canonical model we compute four sub-scores:

- **Driver**: does open-source code exist that names this model or its protocol? Search GitHub code, PyPI, and the driver registries of `pyvisa`/`pyvisa-py`, `python-ivi`, `linux-gpib`, `seabreeze`, `pymodbus`, `pyserial` projects.
- **Interface openness**: GPIB / RS-232 / SCPI / USB-HID scores high; vendor DLL, dongle, or license server scores near zero.
- **Consumables**: are the lamps, columns, seals, and reagent part numbers still purchasable? Check distributor catalogs for the part numbers named in the service manual.
- **Repairability**: count of teardown videos, service manual availability, LabWrench/EEVblog thread volume.

The public site shows the score and evidence links. Paid tiers: watchlist alerts ("a Liberation Score ≥ 70 plate reader just listed within 300mi of you"), and a per-instrument **Liberation Report** — a written driving path with a working code snippet and a parts list.

## Technical approach
Python + Postgres + a small Next.js front end. Scrapers as scheduled jobs; raw listing HTML archived to object storage so extraction can be re-run. Entity resolution is the hard part: auction titles are all-caps, abbreviated, misspelled, and often name a module rather than a system. Approach: candidate generation via trigram similarity (`pg_trgm`) against a model dictionary bootstrapped from manufacturer EOL pages and service-manual archives, then an LLM adjudication pass over the top-k candidates that must output a model ID from the dictionary or `unknown` — never free text. Driver evidence is cached per model, not per listing, so scoring is cheap. Data model: `model` (canonical), `listing` (many-to-one, with resolution confidence), `evidence` (typed rows: repo, thread, catalog SKU, manual), `score_run` (versioned, so scores are reproducible and diffable over time).

## v1 scope
- One instrument category: benchtop UV-Vis and plate readers.
- One source: GovDeals search results.
- Driver sub-score only, computed from a hand-curated seed list of 60 models.
- Static site, no accounts, no alerts.

## Out of scope
Transacting, shipping logistics, escrow, calibration certification, actually writing the drivers.

## Risks & unknowns
Scraper hostility and ToS on auction sites; whether score accuracy survives contact with reality (a model can score high and still be bricked by a firmware key); whether the buyer segment will pay or just free-ride the public index. Mitigation: sell to *sellers* — refurbishers want a credible score badge on their listings.

## Done means
Searching "plate reader" returns ≥40 canonical models with scores and clickable evidence, and for three of them a lab tech following the report drives the instrument from a Python REPL without vendor software.
