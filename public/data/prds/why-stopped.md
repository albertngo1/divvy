## Overview
A public explorable of drug-program death. ClinicalTrials.gov has a free-text field literally named `whyStopped`, filled in for tens of thousands of terminated and withdrawn studies. Nobody reads it. This turns that field into a graveyard you can walk: per-program headstones, cause-of-death taxonomy, survival curves by drug target, and a "this grave has four occupants" alert. For small biotechs, disease-advocacy foundations, science journalists, and patients — the people who cannot buy a Citeline or Evaluate Pharma seat.

## Problem
Commercial pipeline-intelligence is $50k–$250k/year. The underlying registry is free and public but functionally unusable: 500k+ studies, inconsistent intervention naming, no target annotation, and failure reasons buried in one-line free text like "Business decision, not related to safety" or "slow accrual." So the same mechanism gets attempted, fails for the same reason, and the failure is rediscovered privately by each sponsor. That's the arbitrage: cheap for me to assemble, expensive for the niche that needs it.

## How it works
Three views over one dataset.
1. **The graveyard** — infinite-scroll headstones: drug name, target, sponsor, born (first posted) – died (termination), highest phase reached, enrollment achieved vs anticipated, and the quoted cause of death verbatim. Deadpan, no charts.
2. **Cause of death** — every stoppage classified into a taxonomy (futility/efficacy, toxicity, slow accrual, funding/business, sponsor reorg, drug supply, PI departure, COVID, unstated) and cross-cut by phase and target class.
3. **Repeat offenders** — the payload. Targets where ≥3 independent sponsors terminated for the same reason, with Kaplan–Meier-style curves of program survival by mechanism of action.

## Technical approach
Ingest via ClinicalTrials.gov API v2 (`/api/v2/studies`, paged, `filter.overallStatus=TERMINATED,WITHDRAWN,SUSPENDED`), pulling `statusModule.whyStopped`, `designModule.phases`, `enrollmentInfo` (actual vs estimated), `armsInterventionsModule`, `sponsorCollaboratorsModule`, and date fields. Land raw JSON in Postgres (JSONB) + a normalized `program` table.

Entity resolution is the hard part: intervention strings mix code names ("BMS-986165"), INNs ("deucrativacitinib"), salts, and comparators. Pipeline: strip placebo/comparator arms, normalize via RxNorm RxNav approximate-match plus ChEMBL molecule synonyms, then join ChEMBL's `drug_mechanism` table to get target UniProt accessions and action type. Unresolved strings stay unresolved and are shown as such — no silent guessing.

Cause-of-death classification: a regex/keyword prior for the obvious 60%, an LLM few-shot classifier (cached by hash of the text, so it runs once) for the rest, with every label carrying `stated` vs `inferred` provenance. Inference for blank `whyStopped` uses actual/anticipated enrollment ratio and time-to-last-update as a weak accrual-failure signal, and is visually distinct.

Frontend: SvelteKit, server-rendered, D3 for the survival curves; the graveyard is plain HTML so it's indexable and every headstone has a permanent URL — SEO is the distribution strategy.

## v1 scope
- Phase 2 and 3 terminations only, oncology only, last 15 years
- Regex-only cause taxonomy with six buckets
- Graveyard scroll + one target-level page
- Nightly refresh cron, no accounts, no API

## Out of scope
- EU CTR / WHO ICTRP registries, publication linkage, patent data, price/market sizing, paid tier

## Risks & unknowns
`whyStopped` is self-reported and euphemistic — "business decision" often means the drug didn't work; the taxonomy must not overclaim. Entity resolution recall on code names may be poor. Reputational care needed: a headstone is a claim about a real company's program.

## Done means
One target page where three or more independent terminated programs are correctly grouped, each with a verbatim stated reason, and a domain expert reads it and says "yes, that's what happened to that target."
