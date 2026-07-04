## Overview
Cavitation is a short, mean little puzzle game about plant hydraulics, for people who liked SpaceChem but have never thought about how a 100-meter tree drinks. Each level is a cross-section of xylem: a graph of interconnected vessels you must fill from roots to a target leaf.

## Problem
The HN story 'Giant trees have no trouble pumping water to top branches' hides a genuinely weird mechanic: trees don't push water up, they *pull* it under tension (cohesion-tension theory), and that column is metastable — nick it and it flashes into vapor (an embolism) that permanently disables the vessel. Nobody has turned that into a game. It's a perfect puzzle constraint: a resource you move by sucking, not pushing, that can catastrophically fail.

## How it works
You place emitters (root pressure), open/close bordered pits between adjacent vessels, and set transpiration pull at the canopy. Water rises as tension propagates. Raise tension too fast, or pull through a vessel that's already near its cavitation threshold, and it embolizes — a bubble appears, that node goes dead-black, and pressure reroutes. Goal: get a continuous water column to every leaf node before the daily 'noon heat' timer spikes transpiration demand. Par = fewest vessels embolized. Daily seeded puzzle, Wordle-style share string of your embolism map.

## Technical approach
Pure client-side, TypeScript + Canvas/WebGL. Data model: vessels are nodes in a graph with (radius, current_tension, cavitation_threshold, water_fraction); pits are weighted edges. Simulation is a relaxation solver over a Poiseuille-flow resistance network — solve for pressures each tick via iterative Gauss-Seidel on the Laplacian, then apply a cavitation rule: if local tension exceeds threshold, node vaporizes and its edges drop out (graph mutates, resolve). The genuinely hard part is tuning the tension propagation so it feels tactile and telegraphed, not random — players must be able to *see* a vessel about to pop. Date-seeded PRNG for daily levels; precompute par with a small solver search.

## v1 scope
- 10 hand-tuned levels, escalating vessel counts
- One daily seeded puzzle + share string
- Embolism visualization + undo (limited)
- Local-storage streak counter

## Out of scope
- Real 3D tree geometry
- Multiplayer / leaderboard backend
- Accurate species-specific physiology

## Risks & unknowns
- Fun-to-simulate balance: cohesion-tension may read as arbitrary without strong visual tells
- Solver stability on larger graphs (oscillation in Gauss-Seidel)
- Teaching the pull-not-push mental model in <60s of onboarding

## Done means
A stranger loads the page, plays the tutorial and today's puzzle unaided, embolizes at least one vessel, understands *why* it popped, and copies a share string — all with zero backend calls.
