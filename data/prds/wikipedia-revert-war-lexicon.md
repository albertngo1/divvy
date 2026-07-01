## Overview

Wikipedia Revert-War Lexicon is a sociolinguistic map of how Wikipedians fight. It mines the edit summaries (the terse comments left on every revision) of the most-reverted articles and clusters them by *rhetorical move*: citing policy ("per WP:RS"), asserting vandalism ("rv vandalism"), deferring to process ("see talk"), reverting silently, appealing to consensus. The output is a 2D cluster map plus a tactic-frequency strip — a portrait of community gatekeeping expressed in four-word phrases. It renders the *grammar of conflict*, not just its intensity.

## Problem

Edit-war research measures conflict *intensity* (revert counts, mutual-revert graphs) but treats the edit summaries themselves as noise. The rhetorical *moves* embedded in those summaries — the recurring four-word incantations that Wikipedians use to win disputes — have never been clustered or mapped. There's no artifact that shows what community gatekeeping actually *sounds like*.

## How it works

The viewer sees a 2D scatter where each point is an edit summary, positioned by embedding similarity and colored by cluster (policy-citation, vandalism-claim, process-deferral, revert-plain, consensus-appeal, personal). Alongside it, a tactic-frequency strip ranks the moves by volume and shows their most-reverted articles. Clicking a cluster surfaces canonical example summaries and the WP: shortcuts they invoke. Share artifact: the labeled cluster map PNG with the tactic-frequency strip.

## Technical approach — specific

Stack: Python for ingest + embeddings + clustering, static JSON, D3/Observable Plot scatter in a Vite site. Data sources: **Wikipedia dumps** (the `stub-meta-history` dump gives every revision's `comment` field, timestamp, and editor without downloading full article text) and the **MediaWiki revision API** (`action=query&prop=revisions&rvprop=comment|timestamp`) for targeted top-up on the specific articles. Identify the most-reverted articles via the dump's revision metadata (count reverts by detecting identical prior SHA1 restorations, or use the published edit-war/controversy lists as a seed).

Data model: `summary {article, rev_id, timestamp, editor, comment_raw, comment_norm, wp_shortcuts[], cluster_id}`. Key NLP algorithms: normalize summaries (expand WP: shortcuts, strip auto-generated tool prefixes like "Undid revision…"); extract WP: policy shortcuts with regex; embed each summary with a sentence-transformer (`all-MiniLM-L6-v2`); reduce with UMAP to 2D; cluster with HDBSCAN; label clusters by their top TF-IDF terms + most-frequent WP: shortcut. The hard part: edit summaries are extremely short, full of jargon and auto-generated boilerplate (Twinkle/Huggle rollback text dominates and would swamp the signal), so the pipeline lives or dies on aggressive normalization and filtering out tool-generated comments before embedding — otherwise every cluster is just "automated rollback."

## v1 scope (humiliatingly small)

- Top 200 most-reverted English Wikipedia articles as the corpus
- Edit-summary comments only (never article text)
- 5-6 clusters via MiniLM + UMAP + HDBSCAN
- Static 2D cluster map + tactic-frequency strip + PNG export

## Out of scope (for now)

- Talk-page discourse (much longer, different pipeline)
- Non-English Wikipedias
- Temporal animation of tactic evolution
- Editor-level or admin-vs-editor analysis

## Risks & unknowns

Prior-art verdict: **Open** — edit-war research measures intensity, not rhetorical clustering of edit summaries; the move is un-built as described. Risks: (1) tool-generated boilerplate (Twinkle, Huggle, rollback) may dominate and produce meaningless clusters — the single biggest threat, mitigated by a boilerplate filter validated on a sample; (2) summaries are so short that embeddings may cluster on surface tokens rather than rhetorical intent, blurring the "move" categories; (3) reach is the lowest in the round — this is a niche-fascinating artifact, likely to land with Wikipedians and computational-social-science folks rather than go broadly viral. Mitigate scope creep by locking to 200 articles and validating cluster interpretability by hand before building the front end.

## Done means

- Ingested edit summaries for top 200 reverted articles from dumps + API
- Boilerplate/tool comments filtered; ≥90% of remaining summaries are human-written (hand-checked sample)
- Clustering yields 5-6 human-interpretable, hand-labeled clusters
- Cluster map + tactic-frequency strip render with click-to-example
- Static site deployed with PNG export
