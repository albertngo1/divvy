## Overview
A solo browser puzzle game rendering procedurally generated bubble-chamber photographs from real particle physics. Each plate shows spirals, forks, and unexplained gaps in a magnetic field. Your job is the 1960s physicist's job: measure, compute, identify. For anyone who likes Zachtronics games and has ever wanted the actual instrument rather than a quiz about it.

## Problem
Particle physics is taught as a table of names to memorize. The thing that was actually thrilling — that a neutral particle is *invisible* and you infer its existence, mass, and identity purely from the geometry of what its children did — never survives into a game. Existing physics games simulate collisions and then label everything, which removes the entire discipline.

## How it works
A plate loads: hydrogen chamber, uniform B field into the page. A beam track enters, interacts, and produces charged tracks that curve into spirals plus a couple of gaps followed by **vees** — two oppositely curving tracks emerging from nothing, the signature of a neutral decay.

You have instruments, not buttons:
- **Sagitta ruler** — drag a chord across a track, get radius R, and p[GeV/c] = 0.3·B[T]·R[m].
- **Protractor** — opening angles at a vertex.
- **Bubble density gauge** — track darkness is proportional to dE/dx, which separates a slow proton from a fast pion at the same momentum.
- **Mass calculator** — assign a mass hypothesis to each prong of a vee and it computes the invariant mass of the parent.

The trap, and the joy: a Λ → pπ⁻ and a K⁰ₛ → π⁺π⁻ look nearly identical. Assign the wrong hypothesis and you get a plausible wrong mass. The unlock is the **Armenteros–Podolanski plot** — momentum asymmetry α versus transverse momentum qₜ — which separates them cleanly and arrives as a mid-game tool, exactly as it did historically. Later plates add Σ⁰ → Λγ (an invisible photon inferred only from missing momentum) and kinked tracks from π → μν decay in flight.

Scoring is on identification *and* on how close your measured momenta were to truth. Ten hand-tuned plates, then endless procedural ones with a difficulty dial.

## Technical approach
TypeScript + Canvas2D (SVG for instruments). Event generation: sample a primary interaction, decay parents into daughters using real PDG masses and branching fractions, isotropic in the rest frame, then Lorentz-boost into lab frame. Charged daughters are helices projected to circles of radius R = p⊥/(0.3q B); energy loss via a Bethe-Bloch integration shrinks R along the path so slow tracks visibly spiral in and stop. Rendering: track ink density proportional to dE/dx, bubbles drawn as jittered dots along an arc with a fixed nucleation density, plus per-plate emulsion grain, a plate-edge fiducial cross grid, and slight optical distortion so measurement has honest error.

The hard part is *solvability tuning*: procedural events must be ambiguous enough to require the right tool but not underdetermined. Generate, then run an automated solver that attempts identification with only the tools the player currently owns, and reject plates the solver can't resolve above a confidence threshold — a solvability oracle in the generation loop, which is also how you get a difficulty curve for free.

## v1 scope
- One chamber geometry, one B field, hydrogen target
- Two decay modes only: K⁰ₛ → π⁺π⁻ and Λ → pπ⁻
- Sagitta ruler + mass calculator; no Armenteros yet
- 8 fixed plates, no procedural generator

## Out of scope
Detector simulation beyond dE/dx, neutrino events, 3D/stereo views, multiplayer, real CERN data import.

## Risks & unknowns
Measurement UX on a trackpad may be maddening; the ruler needs sub-pixel snapping and a magnifier. Difficulty cliff is steep — players who don't know p = 0.3BR need an in-fiction lab notebook that teaches it without becoming a textbook.

## Done means
A physics-naive playtester, given only the in-game notebook, correctly distinguishes a Λ from a K⁰ₛ on a plate they have never seen, and can explain how they knew.
