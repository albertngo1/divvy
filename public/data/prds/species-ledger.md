## Overview

The IUCN Red List rendered as a time-axis Sankey flowing left-to-right through the decades. Each ribbon is a taxon migrating between conservation statuses — Least Concern → Near Threatened → Vulnerable → Endangered → Critically Endangered → Extinct in the Wild → Extinct. Scrub to any year to freeze the standing population per status. A ledger of loss, drawn as flow.

## Problem

The IUCN Red List is one of the most-cited conservation datasets, but the public sees it as static category tables or single-species trend lines. What's missing is the *movement*: which taxa slid from safe to threatened, how fast, and whether any climbed back after recovery efforts. A time-axis Sankey makes the direction and volume of status change the primary reading — you watch the mass of life drain rightward toward extinction, with the occasional hopeful ribbon flowing left. No such time-axis taxa Sankey exists.

## How it works

Columns are time (assessment epochs / decades); node bands within each column are the seven IUCN statuses stacked worst-at-bottom. Ribbons connect a taxon's status at one epoch to its status at the next; ribbon thickness aggregates taxa moving the same way. Downgrades (toward extinction) render warm, recoveries cool. A scrubber selects a year and the layout collapses to that year's standing counts per status — a snapshot census. Hover a ribbon to see representative species that made that transition; click a band to list its current members.

## Technical approach — specific

Stack: static site, Vite + TypeScript, D3 (`d3-sankey`, customized for a repeating time-column layout rather than the default free graph). Data source: IUCN Red List — historical assessments via the Red List API (token-gated but free for non-commercial use) or the published assessment exports; each species carries a category and an assessment date, and re-assessments give the transitions. Data model: prebaked `{taxon_id, name, [{epoch, category}]}` reduced to aggregated flows `{epoch_from, epoch_to, cat_from, cat_to, count, sample_taxa[]}`. Key algorithms: bucket assessments into epochs, carry-forward a taxon's last known status into gap epochs (so ribbons stay continuous), aggregate identical transitions into ribbons, and lay out repeating Sankey columns with stable node ordering so ribbons don't crisscross chaotically. The hard part is the assessment-history join: IUCN status *definitions changed* across Red List versions (pre-2001 categories don't map cleanly onto the modern scale), so a defensible historical crosswalk between old and new category systems is required before any "migration" is real and not an artifact of reclassification.

## v1 scope (humiliatingly small) — bullets

- One well-covered taxonomic group (e.g. mammals or birds), not all life
- Decade epochs, not per-assessment resolution
- Modern category scale only; earliest epochs start where the scale stabilizes
- Sankey + year scrubber; hover shows sample taxa
- Prebaked aggregated JSON, no live API

## Out of scope (for now)

- All taxonomic kingdoms at once
- Pre-2001 category crosswalk (start after the scale stabilized)
- Per-region / per-country breakdowns
- Population-count (not status) trends

## Risks & unknowns — prior-art verdict: Partial

The audit says IUCN trend lines and category tables exist, but no time-axis taxa Sankey — the artifact is un-built. Risks: category-definition changes make cross-version "migrations" partly artifactual (mitigate by starting post-2001 and documenting the crosswalk); many taxa are assessed only once, so most ribbons are carry-forwards not real transitions — the viz could imply more movement than the data supports; API access is token-gated and rate-limited, so bake everything offline.

## Done means — concrete, testable

- Sankey renders one taxonomic group across decade epochs with correct status bands.
- Ribbon thickness matches aggregated transition counts; downgrades vs recoveries color-coded.
- Year scrubber freezes standing per-status counts matching IUCN published totals for that group/year.
- Hover surfaces real sample species for a transition.
- Category crosswalk and carry-forward logic documented in-page; runs from prebaked JSON.
