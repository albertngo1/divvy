## Overview
An explorable web visualization of *citation contamination*. Enter a DOI; get a reference-ancestry tree, N hops deep, with every node colored by its retraction/correction status and every path weighted by how much of the target paper's evidentiary base flows through it. For researchers, journal editors, journalists, and anyone doing due diligence on a literature.

## Problem
Retraction is a point event; citation is a permanent record. A paper retracted in 2021 keeps accumulating citations for years, and papers built on it stay clean-looking forever — their own reference lists show a normal DOI. Existing tools (scite, Crossref's update-to metadata, the Retraction Watch database) flag *direct* citations of retracted work. Almost nothing shows the second and third hop, which is where contamination actually hides, and nothing shows the *timing*: the multi-year lag between a notice being issued and the field noticing.

## How it works
- Enter a DOI or paper title.
- **The tree view:** the paper at the root, its references fanning out to depth 3. Nodes sized by how many independent paths reach them, colored: clean / corrected / expression of concern / retracted. Retracted nodes stain their ancestor edges upward, so contamination is visible as a colored river rather than a badge.
- **The headline number:** "14% of this paper's reference mass, within 3 hops, passes through retracted work." Reference mass = a PageRank-ish flow where each paper distributes 1.0 uniformly over its outbound references, decayed per hop.
- **The timeline view (the part worth building):** an x-axis of calendar time with a vertical line at the retraction notice date, and every citation of that retracted paper plotted as a dot. The mass of dots to the right of the line is the story. Aggregate it across a whole field and you get a half-life of wrongness.
- Shareable permalink per DOI.

## Technical approach
Stack: a nightly Python ingest into Postgres, served by a small FastAPI + a D3/canvas frontend.

Data sources, all free and real:
- **OpenAlex** (`api.openalex.org/works/doi:...`) for the citation graph — it exposes `referenced_works` directly, which is what makes hop traversal cheap, and it has no key requirement (just a polite mailto).
- **The Retraction Watch database**, now released publicly via Crossref as a downloadable CSV (~60k records) — the ground truth for retraction dates and reasons.
- **Crossref** `update-to` relations for corrections and expressions of concern that never made the RW list.

Data model: `works(id, doi, title, year, pub_date)`, `refs(citing_id, cited_id)`, `flags(work_id, kind, notice_date, reason)`. Ingest the retraction set first, then do a *reverse* BFS from every flagged paper 3 hops up the citing direction and materialize that subgraph — this is far cheaper than crawling on demand, because retracted papers are a tiny fraction of the corpus. Live queries hit the materialized subgraph; a cache miss falls back to on-demand OpenAlex traversal with a depth cap.

Hard parts: (1) DOI matching between Retraction Watch and OpenAlex is messy — retraction *notices* have their own DOIs distinct from the retracted article, and conflating them inverts the meaning; (2) fan-out explodes at hop 3 for review articles, so the traversal needs both a per-node reference cap and flow-based pruning (drop paths below a mass threshold rather than truncating by count, which would bias against well-cited hubs).

## v1 scope
- Depth 2 only, one DOI at a time, no accounts.
- Retraction Watch CSV loaded as a static table; refresh by hand.
- Tree view + the single headline percentage. No timeline yet.
- Show "unknown" honestly for works OpenAlex has no references for — coverage gaps must not read as clean.

## Out of scope
Judging whether a citation is supporting or refuting, preprint servers, any "this paper is fraudulent" language, author-level scoring.

## Risks & unknowns
This defames if it's sloppy: a paper citing a retracted work *in order to criticize it* would show as contaminated, so framing must be strictly descriptive. OpenAlex reference coverage is uneven by field (strong in biomed, weak in humanities and CS conferences), which will make some fields look artificially clean. It may also turn out that hop-2 contamination is universal and boring — that's a real possibility and worth finding out early.

## Done means
Entering the DOI of a known high-profile paper that cited a retracted study renders a depth-2 tree in under 3 seconds, correctly flags that node against the Retraction Watch record, and the headline percentage matches a hand-computed value on a 40-reference test paper.
