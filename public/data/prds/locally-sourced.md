## Overview
Locally Sourced measures the *shoe-leather density* of a news article: the share of its content that depends on being physically present in a specific place. For readers who can't tell a real paper from a content farm, for media researchers tracking local-news collapse, and for the small outlets who want to prove they're the real thing.

## Problem
Local news is being replaced by two things that look identical in a browser tab: syndicated wire copy with a local dateline, and "pink slime" networks that mass-produce one template and swap the town name. Existing credibility tools rate *outlets*, slowly and by hand. Nothing rates the article in front of you, and nothing measures the thing that actually costs money to produce — someone walking around.

## How it works
1. Paste a URL. The extractor pulls body text and the outlet's declared home coordinate (masthead, `og:` tags, or manual).
2. NER lifts places, orgs, and people. Each entity is resolved against a gazetteer and gets two numbers: **radius** (km from the outlet's home point) and **ubiquity** (how many other US counties contain a place with that name — "Main Street" and "Lincoln High" are near-worthless; "the Bressler Road culvert" is gold).
3. Local-entity score = Σ inverse-ubiquity × distance decay. Sentences carrying the score get highlighted in the reader; the article's entity cloud plots as a centroid plus a spread radius on a small map. A wire story about the same town has a huge spread and a ubiquity-flat entity set.
4. Second signal: first-hand markers — quoted speech attributed to a named non-official, plus time-and-place deixis ("Tuesday night at the corner of…").
5. Third, the fun one: fetch the same slug pattern across sibling domains in the outlet's network and template-diff. If four sites publish byte-identical bodies with only the toponym varying, print the template with the swapped slots highlighted.

## Technical approach
Python + FastAPI, trafilatura for extraction, spaCy `en_core_web_trf` for NER with a small LLM pass only for the ambiguous residue. Gazetteer built offline per county: Overpass (`highway` names, `amenity=school`, `leisure=park`, `place=suburb`) + a Wikidata SPARQL pull filtered by P131, plus GeoNames for the ubiquity counts — stored in SQLite with FTS5 and an R-tree for radius queries. Template diffing uses MinHash/LSH over shingles across the sibling-domain corpus, then a longest-common-subsequence alignment to expose the variable slots. The hard part is gazetteer recall: the entities that prove locality are exactly the ones too small to be in Wikidata, so OSM name coverage is the ceiling.

## v1 scope
- One county's gazetteer, built by a script
- Paste a URL, get one score 0–100 plus highlighted local entities
- Entity centroid on a static map
- No template diffing yet

## Out of scope
Truth or bias assessment. Non-English. Outlet-level ratings. Paywalled sites.

## Risks & unknowns
Columns and analysis pieces legitimately score low — the score measures reporting cost, not value, and must say so. Labeling an outlet as pink slime invites a letter, so ship evidence (the template diff) rather than verdicts.

## Done means
On a hand-labeled set of 30 articles — 15 from a real county paper, 15 from a known Metric Media–style site covering the same county — the score separates the two groups with no overlap.
