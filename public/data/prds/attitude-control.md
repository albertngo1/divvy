## Overview
A browser toy/game where you draw a solar sail as a closed polygon, place a payload mass on a boom, and a real solar-radiation-pressure model flies it. For anyone who has read the words 'solar sail' and pictured a thrust slider. Every run seeds a different departure epoch and target, and the attitude trail it draws is never the same twice.

## Problem
SRP is the most counterintuitive force in the solar system — it's real, it's tiny, it's free forever, and it torques you as hard as it pushes you. Every game that includes sails abstracts it into a magic thrust number, which deletes the only interesting part: a sail is a rigid-body attitude problem wearing a propulsion costume. Nothing teaches that, and 'draw a shape, let physics judge it' is the best teaching loop there is.

## How it works
Draw a closed polygon — that's your film. Drop 1–3 point masses (payload, booms, ballast) anywhere. Draw two small flaps at the edges; those are your control vanes, and they're your only steering. Hit go. Each frame the sim sums force over every triangle of your sail using the standard optical model — specular reflection, diffuse reflection, absorption, with front/back emissivity — then takes moments about the center of mass. If your centroid and your mass don't line up, you tumble, immediately and hilariously. You counter by trimming the vanes and sliding the payload along the boom. Objective: raise apoapsis (or reach a target orbit) before the run clock expires. The quaternion history renders as a saveable SVG spirograph of your flight.

## Technical approach
TypeScript, three.js for render, physics in a Web Worker. Sail mesh: earcut-triangulate the drawn polygon; precompute per-triangle area, centroid, normal. Inertia tensor = sum of triangle inertias (uniform areal density) plus point masses via parallel-axis. Rigid body integrated as quaternion + angular momentum; orbit as two-body plus SRP, RK4 fixed step. Force per triangle: McInnes optical model, scaled by cos(incidence), zeroed for backfacing triangles and in Earth shadow (cylindrical umbra first, conical later). Sun direction from a low-precision solar ephemeris (`astronomy-engine` on npm).

The genuinely hard part is stiffness: a 5-micron film has almost no inertia, so attitude wants sub-millisecond steps while the orbit is happy at seconds. Fix: split integration — attitude sub-stepped at ~1 kHz inside each 1 s orbit step, with a floor on minimum inertia so pathological doodles don't explode the integrator. Second hard part: self-shadowing on a concave polygon. v1 ignores it and prints a cheerful disclaimer.

## v1 scope
- Heliocentric only, no eclipse
- One polygon, one point mass, one slider for boom offset
- Characteristic acceleration readout in mm/s²
- Save the attitude trail as SVG

## Out of scope
Multiplayer, flexible/wrinkling film, real mission planning, solar wind (it's ~1/10,000 of SRP — show that as a fact, not a force).

## Risks & unknowns
Tumbling may read as frustration rather than comedy; needs an assist slider tuned early. Physics fidelity vs. 60fps.

## Done means
A square sail offset from its payload tumbles at the analytically predicted rate within 10%; a centered sail holds attitude for 10 simulated days; both hold 60fps on a laptop.
