## Overview
Tangent is a search box that does the opposite of a search engine. Where Sonic and friends race to return the single most relevant result, Tangent deliberately suppresses the top matches and serves you the *ring of adjacency* just outside them — the tangentially related, the oblique, the "huh, I didn't know these connected." It's a research-and-daydreaming tool for writers, designers, and anyone stuck in a rut who wants to be knocked sideways.

## Problem
Modern search is an optimization toward the expected answer, which is death for ideation. When you're brainstorming you don't want the canonical result — you already can guess it. You want the interesting neighbor you'd never have typed. There's no tool that treats "relevant but not too relevant" as the objective.

## How it works
You type a query. Tangent embeds it, retrieves candidates from a corpus, then re-ranks not by cosine similarity but by a *band-pass* over it: reject the top slice (too obvious) and the bottom slice (noise), keep the mid-band, and boost results that are semantically distant from each other so the page feels diverse rather than redundant. Results come with a one-line "why this is adjacent" gloss. A slider controls how far off-topic you want to wander.

## Technical approach
Stack: a small Python/FastAPI service; sentence-transformer embeddings (e.g. `all-MiniLM`) over a bounded corpus — Wikipedia abstracts or a Hacker News/arXiv dump — stored in a local vector index (FAISS or sqlite-vss). The core algorithm is the band-pass re-ranker: take top-K by similarity, drop the top ε as "too obvious," then run Maximal Marginal Relevance with a *negative* relevance weight so it maximizes diversity and mid-band distance rather than pure closeness. The genuinely hard part is calibrating the reject band so results feel serendipitous-but-connected rather than either boring or random — that threshold is corpus-dependent and needs a human eval loop. The "why adjacent" gloss can be a cheap templated diff of shared vs. divergent terms.

## v1 scope
- One corpus (Wikipedia abstracts) indexed with FAISS
- Band-pass MMR re-ranker with a hardcoded reject band
- A search box + results with the wander slider
- No accounts, no persistence

## Out of scope
- Web-scale crawling, live indexing
- LLM-generated explanations
- Personalization / history

## Risks & unknowns
The whole thing lives or dies on the reject-band calibration — too aggressive and it's noise, too gentle and it's just a worse Google. Embedding quality caps how "interesting" adjacency can be. Small corpora may not have enough mid-band density for good queries.

## Done means
For a set of test queries, Tangent returns results that a human judges as "related but not something I'd have searched for" more often than a plain cosine top-K baseline, with the obvious canonical hits demonstrably suppressed.
