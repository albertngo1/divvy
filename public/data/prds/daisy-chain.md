## Overview
Daisy Chain is a browser deduction puzzle for finance-curious players and anyone who read the "circular financing of the GPU boom" story and thought *wait, is that allowed?*. Each case is a network of companies passing money and "revenue" to each other; you're the short-seller who must find the round-trip loop that's inflating a target company's books, then publish your thesis before its IPO clock runs out.

## Problem
Round-tripping, wash revenue, and vendor-financing loops (A funds B, B buys A's product, A books it as revenue) are how paper empires look real — and they're almost invisible to a casual reader, buried in related-party footnotes. Financial-statement analysis is taught with dry textbooks, not play. There's no toy that makes *spotting the loop* a satisfying, replayable mechanic.

## How it works
A case presents an interactive graph: nodes are companies, edges are dated transactions (investment, loan, purchase, service contract) with amounts. The target company reports rising revenue; your job is to identify which edges form a **circular flow** that nets to little real economic value but shows up as top-line growth. You interrogate: click an edge to spend one of your limited "subpoena" actions and reveal its counterparty terms; flag suspicious edges; then submit your loop and a one-line thesis. Scoring rewards finding the true minimal cycle with the fewest subpoenas and before the IPO countdown. Later cases add decoys (legitimate related-party deals), reflexive loops through shell subsidiaries, and time-shifted round-trips that only close across two quarters.

## Technical approach
Stack: TypeScript + React, graph rendered with a force layout (d3-force or Cytoscape.js), fully client-side. Data model: companies, dated directed money edges tagged with type and a hidden `isWashComponent` flag; the "truth" is a designated cycle in the multigraph. Generation is the interesting part: a procedural case builder plants a target inflated-revenue cycle (random walk that returns to origin with a revenue-recognition edge), then layers plausible noise edges via a simple economic model, ensuring exactly one minimal wash-cycle satisfies the win condition (verified by running Johnson's simple-cycles algorithm and checking uniqueness of the flagged loop). Player submissions are graded by comparing the submitted edge set to the planted cycle. Optional teaching layer: an LLM turns each case into a deadpan 10-K-style press release so players practice reading prose, not just the graph.

## v1 scope
- 8 hand-tuned cases + one procedural generator
- Interactive graph with subpoena-to-reveal and edge-flagging
- Submit-cycle grading against the planted loop
- IPO countdown (action budget) and a per-case score

## Out of scope
- Real company data / SEC EDGAR ingestion (v1 is synthetic)
- Multiplayer or campaign meta-progression
- Full double-entry accounting simulation

## Risks & unknowns
- Procedural generator guaranteeing a *unique* minimal wash-cycle is fiddly; may need heavy constraint checks
- Risk of being too dry — the graph must read as intrigue, not homework
- Teaching real detection could invite "is this financial advice" confusion (it's a game)

## Done means
A player opens a case, spends subpoenas to reveal deal terms, correctly submits the circular revenue loop before the IPO clock hits zero, and sees a score that penalizes wasted subpoenas — and the generator can produce a fresh case with exactly one valid answer.
