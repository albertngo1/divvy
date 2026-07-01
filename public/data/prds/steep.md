## Overview
Steep is a slow idle/tycoon game about being the last practitioner of a vanishing craft — roasted barley tea (mugicha), sparked by the news that only two makers remain in Tokyo. It's for players who love Kittens Game and cozy crafters, and for anyone who's watched a skill quietly die out.

## Problem
Tacit craft knowledge evaporates when the last person who holds it retires. Games model money, tech trees, and combat, but almost never model *knowledge itself decaying across generations*. That's the itch: make the loss of a craft a mechanic you can feel and fight.

## How it works
You run a one-person roastery. The core loop is roast → steep → sell → keep the lights on. Roasting is a short timing/temperature minigame that traces a curve. The twist is that you age: every few in-game years you must take an apprentice and pass on your recipe. Inheritance is **lossy** — the apprentice receives a noised copy of your parameters (roast curve, grind, blend ratio) unless you spent time *writing it down*. Documentation freezes parameters against decay. Undocumented craft drifts toward mediocrity over generations; documented craft compounds. Optionally you can publish your in-game notebook to a real GitHub repo as a permanent artifact.

## Technical approach
TypeScript, plain reducer state, saved to IndexedDB — no backend. The roast curve is a Bézier over time/temperature; flavor score = distance from a hidden ideal curve plus a blend-entropy term. Generational decay = Gaussian noise added to each stored parameter at each succession, scaled by `(1 - documentationCoverage)`, where coverage is the fraction of parameters you've paid in-game time to record. The genuinely hard part is tuning the entropy so drift is a real threat yet recoverable, and making lossy inheritance *legible* — the player must see why quality slid. Optional GitHub publish mirrors obsidian-enveloppe: a create/update-file API call writing a markdown recipe.

## v1 scope
- One craft (barley tea), one roast minigame
- 5 generations with succession
- Lossy inheritance + documentation-freezes-decay
- Local save, CSS-only art

## Out of scope
- Multiple crafts, real recipes
- Multiplayer, mobile
- The GitHub publish (flag-gated stretch)

## Risks & unknowns
Decay could feel punishing rather than poignant. Idle pacing is notoriously hard to tune. The documentation mechanic must feel like insurance, not homework.

## Done means
You can play through 5 generations, and a run where you document your recipe measurably beats an otherwise-identical run where you don't, on final flavor score.
