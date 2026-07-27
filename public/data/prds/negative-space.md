## Overview

A small daily desktop tool that inverts the recommender. Every feed you use finds your nearest neighbors and serves more of them. This one builds a map of what you read, overlays it on a map of what exists, and looks for the *voids* — pockets that are well-populated in the reference corpus and conspicuously empty in yours. Then it serves you exactly one item from the biggest void, with an honest explanation of why it thinks that's a hole rather than a desert.

For people who read a lot in a narrow-ish technical field and suspect their intake has quietly become a loop.

## Problem

You cannot search for what you don't know exists, and every tool you use is optimized to deepen the rut. "Explore" buttons in recommenders are just noise injection — random distance, not *structured* distance. The interesting thing isn't a random unrelated item; it's the specific subfield sitting between two clusters you already love, that you have somehow never touched.

## How it works

One-time import: Zotero library, browser history filtered to a few domains, HN favorites, arXiv listing subscriptions, a folder of PDFs — whatever you have. It embeds titles+abstracts into a local vector store. Separately it embeds a reference corpus (arXiv metadata dump, or Wikipedia article leads for non-research users).

Each morning it computes, for a sample of reference points, a **density ratio**: kNN distance to your library versus kNN distance to the reference corpus. Points where the reference is dense and you are far away are candidate voids. It clusters those candidates, labels each cluster with an LLM given the ten most central titles, and picks one. The morning card reads: *"You have 412 items within radius 0.22 of 'distributed consensus.' You have 380 within 0.22 of 'formal verification.' Between them sits session-type systems — 1,900 papers, your nearest is 0.51 away. Here's the most-cited one."*

A second view is the map: a 2D projection where your library is drawn as filled contours and the reference corpus as faint dots, so the holes are literally visible as unlit patches. Marking an item read or "not for me" reshapes tomorrow's ratio.

## Technical approach

Python + SQLite (sqlite-vec for storage, so the whole thing is one file) + a tiny local web UI. Embeddings from a local `bge-small` or `gte-base` via sentence-transformers — no API needed, ~1.5 GB of arXiv abstracts embeds overnight on a laptop. kNN over the reference corpus with an HNSW index (hnswlib). The genuinely hard part: density estimation in 384 dimensions is meaningless — distances concentrate and everything looks equidistant. So the ratio is computed on *ranks* rather than raw distances (kth-neighbor-distance ratio, which is scale-free), and cluster labeling happens in the original space while only the display projection uses UMAP. Second hard part: distinguishing a *hole* (you avoid it, but it's real and adjacent) from a *desert* (nothing there worth reading) — handled by requiring void clusters to exceed a minimum reference density and a minimum citation floor, and by an explicit "this was a desert" feedback button that blacklists the region.

## v1 scope

- One importer: a Zotero SQLite file
- One reference corpus: arXiv cs.* metadata via the bulk OAI dump
- Terminal output only — one card a day, no map, no web UI
- No feedback loop; you just read the card

## Out of scope

Browser extension, non-English corpora, social/shared maps, anything that phones home, mobile.

## Risks & unknowns

The honest failure mode is that most voids are voids for excellent reasons and the daily card becomes noise you dismiss — the desert filter is doing all the work and may not be strong enough. Embedding-space adjacency also may not track intellectual adjacency well enough to produce the "oh, *huh*" reaction the whole thing is selling. Test cheaply: run it once against a library you know well and see whether the top five voids are things you'd be embarrassed to have missed.

## Done means

Run against a 500+ item Zotero library, the tool's top five void clusters are shown to the library's owner blind, and they rate at least two as "I should have read this and never did."
