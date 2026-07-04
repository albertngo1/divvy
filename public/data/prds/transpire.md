## Overview
A single-page interactive explainer/toy of plant water transport, built around the counterintuitive result in the Exeter "giant trees have no trouble pumping water" HN story. For the curious, teachers, and anyone who assumed trees must have a pump.

## Problem
Everyone "knows" trees move water up, but almost nobody can explain how a redwood beats gravity across 100+ meters with zero moving parts. The real mechanism — cohesion-tension: evaporation at the leaves pulls a continuous water column under negative pressure — is deeply unintuitive and essentially never shown as something you can *poke*. The recent research finding (that even the tallest trees have comfortable safety margins) begs for a hands-on demo.

## How it works
A cross-section of a tree trunk and canopy. Sliders: temperature, humidity, stomatal opening, leaf area, xylem vessel radius, and tree height. As you increase transpiration, you watch negative-pressure tension (in MPa) climb the trunk and the water column rise. Push transpiration too hard in dry, hot air and an embolism event fires — an air bubble nucleates, snaps a vessel, and flow through that segment drops, letting you *feel* the safety margin. The payoff: dial height to 115m and, at realistic numbers, it still works fine.

## Technical approach
One self-contained HTML file: SVG for the tree, `requestAnimationFrame` loop. Model cohesion-tension using Hagen–Poiseuille flow through vessel segments, water potential Ψ = Ψp + Ψs, and transpiration driven by vapor-pressure deficit (VPD computed from temperature + relative humidity). Tension gradient = ρgh + viscous flow resistance. An embolism triggers probabilistically when a segment's Ψ drops below its cavitation threshold. Data structure: an array of vessel segments, each `{radius, tension, embolized}`. The hard part is a numerically stable steady-state pressure solve that stays visually legible while mapping onto real MPa values matching the literature (leaf Ψ around −1 to −2 MPa).

## v1 scope
- One tree, four sliders (temp+humidity→VPD, leaf area, height, vessel radius)
- Live tension readout up the trunk
- One visible embolism event with flow drop

## Out of scope
- Root-uptake chemistry, phloem/sugar transport
- Multiple species, seasons, mobile layout
- Any backend or persistence

## Risks & unknowns
- Physics fidelity vs. legibility — too accurate becomes unreadable.
- Embolism randomness could feel unfair rather than instructive.
- Getting MPa numbers that match published tree physiology.

## Done means
Sweeping height from 10m to 115m keeps water flowing with a realistic, correctly-scaled tension readout shown, and cranking VPD past a clear threshold reliably triggers a visible embolism plus a measurable flow drop in the affected segment.
