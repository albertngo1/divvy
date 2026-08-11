## Overview
A browser sim of the McKibben pneumatic artificial muscle — a rubber bladder inside a braided sleeve that contracts when you inflate it — aimed at hobbyists, soft-robotics-curious makers, and anyone who likes a physical system with a sharp, surprising fixed point. It ends by exporting a printable braid-angle template and a shopping list, so the sim closes the loop with an actual object on your desk.

## Problem
Soft actuators are cheap ($6 of balloon, PET expandable sleeving, and zip ties) and behave in ways that are genuinely non-obvious: contraction force collapses to zero as it shortens, and there is a critical initial braid angle — 54.7°, the same arccos(1/√3) that shows up in NMR magic-angle spinning — where the muscle neither contracts nor extends. Cross it and the device inverts. Nothing lets you feel this before you spend an evening building one at the wrong angle.

## How it works
A cutaway 3D view of one muscle: bladder, helical braid strands drawn as actual helices, end fittings. Four sliders: initial braid angle θ₀, resting length, bladder diameter, gauge pressure. One load knob hanging a mass off the end.

Drag pressure and the sleeve visibly fattens as the braid angle opens toward 90°, the strands shortening the muscle. A live force-vs-contraction plot shows the classic hyperbola-ish curve hitting zero at the free-contraction limit. Sweep θ₀ upward and watch the whole force curve flip sign through 54.7° — the neutral angle gets a hard marker on the slider.

Second mode: antagonistic pair across a pin joint. Two muscles, two pressure sliders, live joint angle and torque — the actual way you'd build a robot elbow, and immediately obvious why you need both.

## Technical approach
Three.js + a tiny plain-TS physics core. Ideal force from Gaylord's model: F = (πD₀²P/4)·(3cos²θ − 1)/sin²θ, with θ(L) = arccos(L/b) where b is the strand length, D₀ = b·sinθ₀/(nπ). Ideal models overpredict real force by 20–40%, so apply an empirical correction: subtract a bladder-elasticity term (thin-wall hoop stress, Mooney–Rivlin two-parameter) plus a Coulomb friction term proportional to contact pressure, both exposed as "realism" toggles so the gap between textbook and reality is the point rather than a bug. Braid rendering: n strands as parametric helices with pitch derived from θ(L), instanced tubes.

Export: an SVG protractor strip you wrap around the sleeve to set θ₀ during assembly, plus a BOM with real part specs (18mm PET expandable sleeving, #12 latex tubing, bicycle pump with gauge).

Hard part: keeping the braid geometry consistent as the sleeve fattens — strands are inextensible, so length, diameter, and angle are coupled by one constraint that must hold every frame or the animation lies.

## v1 scope
- Single muscle, 2D cutaway (no 3D), 4 sliders
- Ideal Gaylord force only, no friction/elasticity terms
- Force-vs-contraction plot with the neutral-angle marker
- Static printable protractor PDF

## Out of scope
Antagonistic pairs, 3D rendering, hysteresis loops, rotary (counter-wound) actuators, control-loop simulation, FEM anything.

## Risks & unknowns
Gaylord's model is coarse; if the empirical correction is wrong, the export tempts people to build something that underperforms the sim and feels like a lie. Braid-angle measurement on a real sleeve is fiddly — the protractor may not survive contact with reality. Audience may be small.

## Done means
Setting θ₀ = 20° and P = 300 kPa produces a contraction within 15% of a published McKibben datasheet curve, and dragging θ₀ past 54.7° visibly reverses the animation and flips the plotted force sign.
