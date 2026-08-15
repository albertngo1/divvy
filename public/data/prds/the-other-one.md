## Overview
A solo web tool + CLI that profiles how a language model has *fused* multiple real people who share a name into one hallucinated composite, then generates the minimal disambiguating context that separates you from your namesakes. For anyone with a common-ish name who is now being googled through a chatbot: job candidates, authors, consultants, people cleaning up after a namesake's bad press.

## Problem
Models don't store people; they store attribute clouds keyed loosely by name. Ask about "Sean Byrne" and you get a violinist's conservatory, a founder's exit, and a hometown belonging to neither, delivered in one fluent paragraph. Existing "AI reputation" tools just show you the bad paragraph. Nobody tells you *which real person leaked into yours*, or what one clause you should put in your bio so the model stops merging you.

## How it works
1. Enter a name (optionally one grounding fact: city, field, employer).
2. The tool samples N≈200 short biographical generations at temperature 1.0, each forced through a structured-output schema of atomic claims: `{predicate, object, span}` — born_in, works_as, affiliated_with, authored, known_for.
3. Claims are embedded and clustered (HDBSCAN over normalized claim strings) into candidate *personas*. A persona is a co-occurrence community, not just a topic: we build a claim–claim graph weighted by how often two claims appear in the same sample, then run Leiden on it. Genuine distinct people show up as dense components; chimeric facts show up as high-betweenness bridge nodes.
4. Each persona is grounded against real sources — Wikidata SPARQL (`?p wdt:P31 wd:Q5; rdfs:label "Name"@en`), ORCID search API, Crossref author query, GitHub user search — to label it *real other person*, *you*, or *unsupported invention*.
5. Output: a fusion diagram (you in the center, bridge-claims drawn as edges to the namesakes that donated them) plus a ranked list of disambiguating prefixes. Each candidate prefix is scored by running the model with logprobs and measuring the drop in mean logprob of the foreign persona's claims versus yours; greedy forward selection over attribute candidates picks the shortest phrase that maximizes separation.

## Technical approach
Python + FastAPI, a local Qwen-class model via vLLM for the logprob-dependent half (hosted APIs won't give per-token logprobs reliably), plus adapters for one hosted model for comparison. Storage: SQLite with a `claims(sample_id, predicate, object, embedding)` table and sqlite-vec for the clustering step. The genuinely hard part is grounding without ground truth: for a private individual, absence from Wikidata means nothing, so the tool must label confidently only what it can corroborate and mark the rest *unverifiable* rather than *invented* — a tool that calls your real job a hallucination is worse than useless.

## v1 scope
- One local model, one hosted model
- English names only, people only
- Fusion graph rendered as static SVG
- Wikidata grounding only
- Top-3 disambiguating prefixes with separation scores

## Out of scope
- Fixing anything (no outreach, no SEO, no "submit a correction")
- Non-person entities, companies, products
- Longitudinal tracking across model releases

## Risks & unknowns
- Ethically loaded: it profiles third parties who happen to share a name. Ship with namesakes shown only as anonymized personas ("a musician in Dublin") unless already public figures.
- Separation gains may not transfer between models or survive retrieval-augmented answers.
- Rare names produce too few coherent samples to cluster.

## Done means
For a seeded test name with two documented Wikidata people, the tool recovers both personas as separate clusters, correctly flags at least one cross-assigned attribute as a bridge claim, and its top prefix raises the target persona's mean claim logprob by ≥0.5 nats over the no-prefix baseline.
