## Overview
Line Item grafts Papers, Please's document-inspection loop onto cloud/SaaS billing. You're a FinOps gatekeeper: each 'traveler' is an invoice line-item that must be checked against a growing rulebook and cross-referenced against a resource manifest. Stamp APPROVE or DENY. Sparked by the HN headline about AWS's $1.7B inaccurate estimated billing — the fantasy of catching the errors before they cost you.

## Problem
Real cloud bills are inscrutable and full of phantom charges (idle NAT gateways, zombie snapshots, cross-AZ transfer, double-counted estimates). Nobody enjoys reconciliation, and there's no way to *practice* the detective skill it takes. Line Item makes contradiction-hunting a tense, satisfying game.

## How it works
Each shift you get a stack of line-items with fields: service, SKU, quantity, unit rate, region, tags. Beside it sits a manifest (provisioned resources) and today's rulebook ('cross-AZ egress only valid if two AZs are tagged'; 'estimated charges must reconcile to metered within 5%'). You inspect, spot mismatches by dragging a discrepancy loupe between conflicting fields, and stamp. Approving a fraudulent charge burns real budget; denying a legit charge angers the vendor and stalls your queue. Rules pile up daily, tempo rises, and periodic 'estimation glitch' events flood the queue with plausibly-wrong numbers (the AWS nod). Score = money saved − wrongful denials.

## Technical approach
Stack: React + TypeScript, fully offline/static. Data model: LineItem, Manifest, Rule (a predicate over item+manifest), Contradiction (which two fields clash). Content generation is the core: a procedural generator emits an invoice + manifest, then deterministically injects 0–N seeded contradictions from a rule taxonomy, guaranteeing each is *findable* from the visible fields alone (no guessing). Verifier double-checks solvability before serving. Optional: import a real anonymized AWS Cost and Usage Report CSV to seed line-item shapes and rates for authenticity. Hard part: generating contradictions that are fair but non-obvious, and a difficulty curve via rule-count + red-herring density.

## v1 scope
- 5-shift campaign, ~10 items/shift
- 8 rules, 6 contradiction types, discrepancy loupe interaction
- Budget + reputation meters, end-of-shift ledger

## Out of scope
- Live cloud API integration / real account reconciliation
- Multi-vendor rulebooks beyond a generic cloud
- Narrative/story mode

## Risks & unknowns
- Procedurally fair contradictions are the whole game; a weak generator makes it trivial or unfair
- Risks feeling like homework rather than play — needs Papers-Please tempo/tension pacing
- Real CUR import is fiddly; keep it optional flavor

## Done means
A player finishes a shift where every injected fake charge was catchable from on-screen fields, the loupe surfaces the clashing pair, and the end ledger correctly tallies money saved vs. wrongful denials — with difficulty rising via added rules across shifts.
