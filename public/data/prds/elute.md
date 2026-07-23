## Overview
Elute is a solo browser puzzle-sim about separating rare-earth elements — the lanthanides — by column chromatography. You load a mixed sample, tune the chemistry, and try to pull each element off in a pure band. It's for the Zachtronics/Opus-Magnum crowd and the chemistry-curious who saw the 'atomic channel for separating rare earths' story and wondered why it's such a big deal.

## Problem
Separating rare earths is one of the ugliest problems in industrial chemistry — the lanthanides are chemically near-identical, so purification means hundreds of tiny separation steps. That difficulty is invisible to the public and completely un-gamified. The HN post about a cleaner separation route is celebrated precisely because the incumbent process is miserable. There's a great puzzle hiding in that misery: many near-identical things, one narrow lever to tease them apart.

## How it works
Each level gives a mixture (say Nd + Pr + Sm) and a purity target. You configure a run: eluent pH, a complexing agent (e.g., citrate vs. EDTA-like), and a gradient schedule. Press run; the sim animates colored bands migrating down a 1D column, each ion moving at a speed set by its retention factor under your current chemistry. Bands that overlap come off mixed and fail purity; you collect fractions by opening the outlet at the right moments. Score on purity, yield, reagent cost, and number of runs. Later levels add ions with almost-identical separation factors (the real lanthanide-contraction squeeze), forcing recycling of impure 'middle' fractions across multiple passes.

## Technical approach
Canvas/WebGL front end; the model is a 1D advection-with-retention simulation: each ion has a partition coefficient K that depends on pH and complexant, driving a retention time; band spreading modeled as Gaussian broadening (plate theory, HETP). Retention values are tuned from real separation-factor trends so ordering feels authentic without pretending to be a research tool. Deterministic seeds for daily puzzles. The genuinely hard part is tuning the difficulty curve — separation factors near 1.0 must feel maddeningly tight yet fair, and the fraction-collection timing UI must feel like skill, not luck. Pure client-side, state in localStorage.

## v1 scope
- 8 hand-built levels, 2–3 ions each
- pH slider + one complexing agent + simple gradient
- Animated bands, manual fraction collection
- Purity/yield/cost scoring + par

## Out of scope
- Full thermodynamic accuracy / real Kd databases
- More than one column type
- Recycling automation (manual only at first)
- Accounts, leaderboards

## Risks & unknowns
- Chromatography timing may feel fiddly rather than fun — needs generous collection windows early.
- Real separation factors might make good levels too hard or too easy; balancing is empirical.
- Educational framing vs. game feel is a tension; too much realism kills flow.

## Done means
A player loads a 3-ion level, adjusts pH/complexant, runs the column, watches three colored bands separate, collects two of them above the purity threshold, and can immediately see how a chemistry tweak changed band order — with a par score to beat.
