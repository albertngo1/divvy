## Overview
Round-Trip is a browser-based explorable explanation of vendor and circular financing in the AI infrastructure buildout — the chip-maker who invests in the cloud who buys the chips. It's for finance-curious readers who keep seeing 'AI companies hiding debt' headlines and want to actually see the shape of the money.

## Problem
The HN story 'AI Companies Are Trying to Hide a Staggering Amount of Debt' points at off-balance-sheet vehicles and reciprocal deals, but coverage is prose and disconnected press releases. Nobody has drawn the graph. 'Round-tripping' — where A's investment in B returns to A as B's purchases — is the exact pattern that inflated the dot-com and Enron eras, and it's legible only when you can trace cycles. Text can't show a cycle; a picture can.

## How it works
A curated directed graph: nodes are companies (Nvidia, OpenAI, Oracle, CoreWeave, AMD, Microsoft, SoftBank…), edges are public deals tagged as equity, prepay/commitment, compute purchase, or debt. The layout is a radial diagram with hierarchically edge-bundled arcs (per the arXiv trail-bundling taxonomy) so hundreds of flows stay readable. The killer view: a 'circularity' toggle runs cycle detection and highlights every closed loop where money leaves a company and comes back through ≤N hops, animating dollars traveling the ring. A per-node 'circularity index' scores how much of its inbound funding it effectively self-sourced. Click any edge for the citation, amount, date, and instrument.

## Technical approach
Data is a hand-maintained JSON/CSV of deals scraped from filings and reporting, each with a source URL — accuracy over completeness. D3 for the radial hierarchical edge bundling; cycle detection via Johnson's algorithm (elementary circuits) on the deal graph, precomputed. Dollar attribution along a cycle is the genuinely hard part: deals are heterogeneous (equity vs. multi-year compute commitment), so we normalize to an annualized-commitment estimate with explicit assumption flags, and never assert a number the source doesn't support. Static site (Vite + D3), no backend; data versioned in git so updates are PRs.

## v1 scope
- ~25 companies, ~60 sourced edges
- Radial edge-bundled layout
- Cycle highlight + animated flow on one toggle
- Edge tooltip with citation

## Out of scope
- Live data feeds / auto-scraping
- Full financial modeling or valuation claims
- Private/rumored deals without a public source
- Time-scrubbing animation across years

## Risks & unknowns
- Deal terms are opaque; dollar figures may be commitments, not cash — mislabeling invites 'this is wrong' pushback.
- Curation is subjective; needs a clear methodology page.
- Edge bundling can hide direction; must keep arrows/gradients legible.

## Done means
A visitor loads the page, sees the deal web, flips 'circularity,' and watches at least one real closed loop (e.g., chip-vendor → cloud → chip-purchase) light up with a defensible, cited annual figure and a per-node circularity index — with every edge traceable to a public source.
