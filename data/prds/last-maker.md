## Overview
Last Maker is a short, turn-based narrative management game about being the sole surviving practitioner of a real endangered craft — sieve-making, coracle-building, gold-beating, or (nodding at the HN mugicha piece) roasted-barley-tea making. Your job over a handful of turns is to keep the craft breathing long enough to hand it to someone else. For people who read "Tokyo has only two mugicha makers left" and felt the clock ticking.

## Problem
Crafts go extinct quietly, one retirement at a time, and there's no felt sense of that loss — just an obituary years later. The itch: to *inhabit* the endling of a skill, to feel how thin the margin is between a living tradition and a museum plaque.

## How it works
Pick a craft from a curated list of real critically-endangered ones. Each turn you allocate scarce time and energy across: taking paid orders (income, but exhausting), sourcing increasingly rare materials, and training an apprentice whose skill creeps up only with patient teaching. Meanwhile your own health and stamina decline with age. Events fire from a deck ("the only supplier of your reed retires," "a documentary crew wants a demo"). Win condition: an apprentice reaches mastery before you retire. Lose: you retire first and the craft goes dark. The "one more turn" tension is the whole hook — you're always one good season from securing the line, and one bad event from losing it. Real facts about the craft surface as flavor between turns.

## Technical approach
Static web app (Svelte or vanilla + Vite), deployable to GitHub Pages. Data curated into JSON from the Heritage Crafts Association Red List of Endangered Crafts (craft name, status, practitioner count, why it's at risk, key materials) — scraped once and hand-checked for respectfulness/accuracy. Core is a deterministic sim: state `{money, health, apprenticeSkill, materialStock, turn}`, an event deck with weighted draws (seeded RNG for reproducible runs), and per-action deltas. UI is turn → allocate → resolve → narrate. The genuinely hard part is emotional design: making a resource spreadsheet feel poignant rather than clinical — pacing the decline, writing flavor that respects real living makers, and landing an ending that hits. A shareable end-card PNG ("You saved swill-basket making. It survives — barely — with 3 makers.") is the primary artifact.

## v1 scope
- Exactly one craft, fully written (e.g. Sussex trug or swill-basket making).
- A fixed 10-turn arc with three actions per turn.
- One win screen and one loss screen, each generating a shareable card.

## Out of scope
- Multiple crafts, tech trees, save/load, difficulty modes.
- Any live API; data is a baked JSON snapshot for v1.
- Localization, sound, animation beyond simple transitions.

## Risks & unknowns
Getting the tone wrong — trivializing real people's threatened livelihoods — is the biggest risk; flavor text must be checked. Balance may be too swingy or too grindy in a 10-turn window. "Management sim" can read as dry if the writing doesn't carry it.

## Done means
A player can complete a full 10-turn run of the one shipped craft, make meaningful turn-by-turn allocation choices, and reach either the survival or extinction ending — with the ending producing a downloadable share-card stating the craft's fate.
