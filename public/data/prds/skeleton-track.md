## Overview
Skeleton Track is a solo, session-length (20–30 min) puzzle-tycoon about a geared steam locomotive working a timber valley in 1912. You have one Shay, a finite pile of rail, and a contract with a deadline. "Skeleton track" is the real term for the flimsy temporary line loggers laid, used, and pulled up — and that pull-up-and-relay loop is the entire game.

## Problem
Railroad builders are all about permanence: lay the best line, optimize it, watch it earn forever. That makes the map a monotonically growing blob and removes every interesting decision after hour one. Nothing models the actual historical logic of logging railroads, which were deliberately terrible, disposable, and mobile — the rail was the scarce asset, not the land.

## How it works
A procedurally generated valley with timber stands scattered on ridges and benches. You drag track onto a heightfield. Because a Shay is geared, it laughs at things a rod engine can't touch: 8% grades and 60-foot-radius curves are legal. What it costs you is *time* — speed is a function of grade, curvature, and tonnage, and a switchback stack up a headwall might be cheap in rail but eat half a day per trip. Reach a stand, harvest it, and it's exhausted permanently. Now the spur is dead weight: salvage it to recover ~90% of the rail, but each relay increments that rail's wear counter, and worn rail on a tight curve rolls a derailment check (lost day, damaged log car). Rain turns cheap fills into washouts. The contract clock is the pressure: clear enough board feet and get your iron back out before the season ends.

## Technical approach
TypeScript + Canvas2D (or Godot 4 if the terrain wants real 3D; v1 is a clean top-down with hillshade). Terrain: simplex noise plus a hydraulic erosion pass (~200 droplet iterations) so creeks, benches, and headwalls are geologically plausible rather than lumpy — the erosion is what makes route-finding feel like reading real ground. Track is a graph over a hex or square grid; each edge stores grade (Δz / run), curvature (turn angle between adjacent edges), and cut/fill volume, priced from the heightfield delta. Train sim is a simple 1D dynamics model along the polyline: tractive effort vs. grade resistance (Davis equation, simplified) + curve resistance ≈ 0.8 lb/ton per degree of curvature. Rail is a real inventory object with `{length, wearCount}`; salvage returns segments to the pile. Derailment probability = f(wear, curvature, speed). The genuinely hard part is the track-laying UX — the joy lives entirely in drawing a switchback and seeing whether it clears the grade, so the tool needs live grade/curve feedback under the cursor and forgiving snapping.

## v1 scope
- One hand-tuned valley, three timber stands, one Shay
- Lay track, drive a loaded trip, salvage track
- Rail inventory with a wear counter; grade + curvature speed penalty
- Season clock and an end-of-run summary

## Out of scope
- Multiple locomotives, hiring/payroll, log markets and price cycles
- Weather, washouts, derailments (wear counter is v1's only decay)
- Save/load, campaign, meta-progression

## Risks & unknowns
If rail is generous, salvage never happens and the whole premise evaporates — the scarcity has to bind hard from minute two. Speed penalties may read as pure annoyance instead of a tradeoff; needs a visible per-trip time estimate so routing choices are legible before you commit.

## Done means
A fresh player finishes a valley in under 30 minutes, cannot possibly finish without salvaging and relaying at least one spur, and the summary screen reports rail-feet laid versus rail-feet salvaged as the headline stat.
