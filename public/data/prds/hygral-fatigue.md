## Overview
A single-player, run-based salon sim for people who like systems games. Clients sit down, you choose a protocol, and a real strand simulation — not a lookup table — decides whether the style holds through the week. Sparked by "Curly Hair Simulation using Curly Finite Elements": the graphics world has spent a decade making hair *look* right and nobody has made hair *behave* as a game resource.

## Problem
Sim games almost always simulate money. Very few simulate a *material*. Meanwhile hair care is genuinely a hidden-state resource-management problem — porosity, protein/moisture balance, curl pattern, cumulative damage — dressed up as folk science and argued about endlessly online. It is a great game hiding inside a YouTube comment section, and dress-up games render hair without ever modeling it.

## How it works
Each client arrives with a **hidden** strand state: helix rest curvature and pitch, cuticle damage D, porosity, hydration H. You see only a request ("wedding Saturday, must hold") and whatever you measure: a loupe view of six strands, a stretch-to-break test, a wet/dry length ratio. You pick a protocol — cleanse strength (sulfate vs co-wash), protein vs humectant, heat temperature, tension, set time. The sim then runs the strand forward through five in-game days under a humidity curve, and you watch it hold, frizz, or snap back to curl in a time-lapse.

The hook is the ratchet: every wet/dry cycle adds **hygral fatigue**. The cuticle lifts, porosity rises, hydration responds faster, and the protocol that worked in week 1 destroys the same head in week 12. Clients return across a ~30-day run; the run ends when your regulars' hair is too damaged to style. Meta-progression is a persistent lab notebook — you keep *knowledge*, not stats.

## Technical approach
TypeScript + WebGL2 (or Rust + wgpu). A strand is a discrete Cosserat rod / mass-spring chain of ~60 segments with rest curvature κ₀ and torsion τ₀ producing a helix. Hydration H scales bending stiffness EI and pulls κ₀ toward straight — that is literally what a blowout is. Ambient humidity drives H through a first-order lag whose time constant is set by porosity. Damage D increases with heat (Arrhenius-style knee above ~175 °C), mechanical tension, and each swelling cycle; D raises porosity, which shortens the lag, which shortens hold. Render ~200 instanced strand quads with Kajiya-Kay shading. Humidity curves pulled from Open-Meteo for flavor and run seeding.

The hard part is not the rod solver — it is tuning the coupled H↔κ₀↔D loop so a player can form and falsify a theory in three clients instead of thirty.

## v1 scope
- One curl type (3B), one client, five simulated days
- Three treatments: heat, protein, humectant
- 2D strands, ~40 of them, no shading tricks
- One measurement tool (the loupe) and a hold/fail score
- No money, no salon, no staff

## Out of scope
3D hair, color chemistry, multiple chairs, character creator, mobile.

## Risks & unknowns
Real-time rod simulation may need baked strand animations instead. Hair science is genuinely contested — the sim must read as plausible, not authoritative. Biggest risk: it reads as a dress-up game and systems players never open it.

## Done means
A playtester who has never heard the word "porosity" can, after one 20-minute run, state a correct causal rule — "high porosity plus humectant on a humid day equals frizz" — without ever having been told it.
