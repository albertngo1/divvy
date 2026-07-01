# Explorable Toy

## Overview
A single interactive "explorable explanation" — a Bret Victor / Nicky Case-style reactive toy that lets you *play* your way to understanding one quietly fascinating system, with no dataset, just live-tunable mechanics. For the curious internet, educators, and the explorables community.

## Problem
Static explanations of dynamic systems fail: you read about a feedback loop, a market, a diffusion process, and it doesn't *stick* because you never touched it. The itch is the one Victor named — "explorable explanations" build real intuition by letting the reader drag the knobs and watch the consequences. The medium is proven; what's missing is a good *topic* and a builder willing to sweat the interaction design.

## How it works
The page is a short piece of prose interleaved with live widgets. Inline "tangle" numbers are draggable — change "birth rate" mid-sentence and the sentence's conclusion and the diagram both update instantly. A central simulation (SVG/canvas) responds continuously to sliders and drags. The reader scrolls through a guided narrative that hands them progressively more control, ending in a free-play sandbox. The whole thing is a self-contained HTML page that can be embedded or reshared.

## Technical approach
Static site — reactive-document tooling: **Idyll** or **Tangle.js** for inline tangled variables, or a hand-rolled **Svelte** version (Svelte's reactivity makes the "drag a number, everything downstream recomputes" trivial). **marimo** and **Iooxa** are alternatives noted in the source if the explainer is math/notebook-flavored. Rendering via SVG for diagrams or canvas/**three.js** for a heavier sim.

- **No external data** — the "dataset" is the simulation's equations. Pick a system that is (a) governed by a few coupled variables, (b) counterintuitive, and (c) quietly fascinating to the builder (the source is explicit: *the angle IS the curiosity, not the framework*).
- **Data model:** a small reactive state object (the tunable parameters) → derived quantities → view bindings. The whole app is `state → derived → render`, recomputed on every input.
- **Key algorithm:** the simulation itself (e.g. an ODE integrator via simple Euler/RK4 stepping, or a discrete agent update loop) plus a reactivity graph so a dragged number propagates through prose *and* diagram without stale views.
- **Hard part:** it's not the tech — it's *choosing the topic and designing the interactions* so the toy teaches rather than just wiggles. Interaction design and pacing are the entire game; the framework is a footnote.

## v1 scope (humiliatingly small)
- One topic, one central simulation, one page.
- Three tunable parameters wired to both prose and diagram.
- A single guided walkthrough ending in free play.
- Runs fully client-side, no build-time data.

## Out of scope (for now)
- A library of explorables or a template system.
- Save/share of specific parameter states (URL-encoded state is a nice-to-have, not v1).
- Multiplayer or user-submitted scenarios.
- Mobile-perfect touch tuning (get desktop right first).

## Risks & unknowns
Prior-art verdict: **Open\*** — with an asterisk. The *form* is thoroughly saturated (explorabl.es, Nicky Case, Victor's originals), so novelty lives *entirely in the unchosen topic*. This idea has no verdict until the topic is picked: a well-worn topic (predator-prey, SIR) is instantly Exists; a genuinely under-explained system is Open. The real risk is choosing a topic that's either already explained beautifully or too niche to reach anyone. Decide the topic *before* building, and gut-check it against explorabl.es first.

## Done means
A deployed single-page explorable on one chosen topic where dragging any of three parameters live-updates both the narrative sentences and the central diagram, and a first-time reader reports they understood the system better after playing than after reading.
