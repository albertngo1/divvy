## Overview
Vacancy is the inversion of every city-builder: growth is the failure state you cannot avoid, only manage. Population falls year over year; your job is to keep a shrinking city solvent, livable, and dignified — right-sizing infrastructure, consolidating neighborhoods, and greening the blocks you let go. For players tired of infinite-growth Cities: Skylines fantasies, and quietly a sandbox for the real discipline of "managed decline" that planners in Detroit, Youngstown, and the German Ruhr actually practice.

## Problem
City sims model only expansion; the hardest real urban problem of the century — shrinking cities — has no popular playable model. Demolishing homes, abandoning water mains, and shifting bus routes off dying streets are agonizing tradeoffs no game lets you rehearse. And the intuition ("just cut services where nobody lives") is dangerously wrong in ways only a simulation makes felt.

## How it works
You inherit a mid-size town on a real street grid at its historical peak, then time advances one year per turn as population bleeds out per a decline curve. Each block has occupancy, upkeep, and a decay clock. You spend a shrinking budget to: demolish (removes upkeep, hurts morale, frees land), consolidate (merge two half-empty schools/fire stations — saves money, lengthens response times), or convert vacant land to urban prairie/solar/community garden (cheap upkeep, slow morale recovery). Per-mile infrastructure cost is the enemy: a street with one occupied house still needs plowing, water, and a sewer. Lose solvency and the state takes over (game over); keep density high enough per serviced mile and morale stable and you reach a stable "right-sized" equilibrium — the win.

## Technical approach
Browser game, TypeScript + a lightweight canvas/WebGL grid renderer over a real OSM street network (Overpass API export → simplified graph, baked offline into level packs). Data model: a graph of blocks (nodes) and street segments (edges) each with occupancy, upkeep, decay, and service-coverage attributes; services are point facilities with a coverage radius computed by graph distance. The core loop each turn: apply decline to occupancy, recompute per-segment service cost, run a coverage/response-time pass (multi-source BFS from facilities), tally budget, update morale as a function of served fraction + demolition shock. The hard part is the economic model — making per-mile infrastructure cost and the morale response *feel* true without a spreadsheet-of-doom, so that naive austerity visibly backfires and thoughtful consolidation visibly wins.

## v1 scope
- One baked real town (~2,000 blocks) with a historical decline curve
- Three actions: demolish, consolidate service, convert-to-green
- Budget + morale + serviced-population-per-mile meters; win/lose states
- Year-by-year map recolor showing the town physically contracting

## Out of scope
- Traffic/agent simulation, zoning, individual citizens
- Multiple cities, campaign, mods
- Any real fiscal accuracy claims (it's a model, not advice)

## Risks & unknowns
- Economic balance is the whole game and easy to get flat or punishing.
- "Downer" premise may repel players; tone must find dignity, not despair.
- OSM-to-playable-grid pipeline could be fiddly for one town, worse for many.

## Done means
A full playthrough of the one town is completable in under 30 minutes, ends in a clearly-communicated win or state-takeover, and a naive "slash everything" strategy demonstrably loses faster than a measured consolidation strategy in side-by-side runs.
