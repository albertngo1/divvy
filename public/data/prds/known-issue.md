## Overview
A local web tool for used-car buyers, DIY owners, and independent mechanics. You pick a year/make/model and type a symptom the way you'd say it out loud — "shudders around 40mph only when cold" — and it returns the matching cluster of real owner complaints filed with NHTSA, the component they blame, the odometer distribution at failure, and whether a Technical Service Bulletin, recall, or open investigation already exists for it.

## Problem
NHTSA's Office of Defects Investigation publishes every complaint it receives as free text. It's the single largest corpus of "what actually breaks on this car" in existence, it's free, and it is effectively unsearchable: the official site does keyword matching over ALL-CAPS misspelled prose. A dealer knows the TSB list. You don't. When you're standing in a driveway deciding whether to hand someone $9,000, the question "is this a known issue or is this car unusually bad" has a public answer nobody can retrieve. That's the arbitrage: the data is cheap for us, and inaccessible to the exact people it would save money.

## How it works
1. Nightly ingest of the ODI flat files into SQLite.
2. You select vehicle + optionally mileage.
3. You type a symptom. It embeds the query and does ANN search restricted to that make/model/year ± 2 years.
4. Top-k hits are clustered; each cluster gets an LLM-written one-line label ("low-speed torque converter shudder") and an extracted component code.
5. Each cluster renders: size, a mileage-at-failure histogram with a KDE hazard curve, first/last filing date, verbatim quotes, and linked recalls/TSBs/investigations.
6. A headline verdict: **known issue** (cluster is large relative to sibling model-years) or **just you** (n=3, no pattern).

## Technical approach
- Data: `static.nhtsa.gov/odi/ffdd/cmpl/FLAT_CMPL.zip` (complaints, pipe-delimited: `ODINO`, `MAKETXT`, `MODELTXT`, `YEARTXT`, `CDESCR`, `MILES`, `FAILDATE`, `COMPDESC`), plus `FLAT_RCL.zip` (recalls), `FLAT_INV.zip` (investigations), and the TSB summary file. All free, no key.
- Stack: Python + FastAPI + SQLite with `sqlite-vec`; embeddings from `bge-small-en-v1.5` run locally (2M short docs is an overnight batch on CPU, minutes on any GPU). Frontend: plain HTML + uPlot.
- Clustering: HDBSCAN over the retrieved neighborhood, not the whole corpus — cluster per query so labels reflect the user's phrasing.
- Hazard curve: KDE over `MILES` per cluster, plus a crude survival estimate.
- Hard part: **normalization**. Complaint counts are confounded by fleet size and by publicity — a recall causes a complaint spike about the recalled part. v1 normalizes against total complaints for that model-year (a fleet-size proxy) and flags clusters whose filing dates bunch immediately after a recall date as "publicity-inflated".

## v1 scope
- Complaints file only; one make/model/year at a time.
- Text preprocessing: lowercase, expand the ~200 most common ODI abbreviations.
- Semantic search + cluster labels + mileage histogram.
- Recall/TSB existence check by component code, as a badge.

## Out of scope
- VIN decoding, market pricing, dealer inventory scraping.
- Motorcycles, trailers, child seats, tires.
- Any "should I buy this car" score.

## Risks & unknowns
- Complaint text is self-reported, emotional, and mechanically illiterate; cluster labels will sometimes name the wrong part.
- Base-rate normalization may stay wrong without real sales figures.
- Liability tone: must read as "here's what owners reported," never as a diagnosis.

## Done means
For a 2013 Ford Focus, typing "jerks and hesitates from a stop" surfaces the DPS6 dual-clutch cluster as the #1 result with n in the thousands, a mileage peak in the 20–40k range, and the linked TSB/recall — without the word "transmission" appearing in the query.
