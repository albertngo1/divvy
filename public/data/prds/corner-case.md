## Overview
Corner Case is a phone tool for movers, delivery crews, and anyone about to wrestle a large rigid object through a tight turn. You give it the object's bounding box and the geometry of the pinch point (doorway, L-shaped hallway, stairwell landing) and it computes whether the object can pass — and returns the tilt/rotate sequence to get it through. It takes a serious piece of computational geometry (the 'moving sofa' / ladder-around-a-corner problem) and makes it a field-quotable yes/no.

## Problem
Moving-company quotes and delivery attempts hinge on a foreman eyeballing whether a sectional clears the landing. Get it wrong and you've got a damaged wall, a stuck fridge, a re-scheduled delivery, or a refund. The math (can a rigid polygon translate + rotate through a corridor?) is well understood but nobody does it on-site — they guess.

## How it works
You pick a template (straight doorway, 90° hallway turn, switchback stair) and enter measured widths, ceiling height, and the object's length × width × height. The app searches the configuration space for a collision-free path of the object's footprint through the corridor polygon, allowing tilt (using the diagonal cross-section when you rotate into the vertical plane). Output: PASS with an animated 3-step 'tilt 40°, pivot, straighten' sequence, or FAIL with the single tightest clearance and how many inches short you are.

## Technical approach
React Native / Expo, all on-device. Model the object as an oriented bounding box and the corridor as a 2D polygon (with a separate vertical-plane check for stair tilt). Core is a configuration-space search: discretize (x, y, θ) and run A* / BFS over free cells, collision-testing each pose via SAT (separating axis theorem) between the OBB footprint and corridor edges. For stairs, add a third rotation into the vertical plane and test the diagonal. Measurement input v1 is manual; later, ARKit RoomPlan can capture doorway/landing dimensions automatically. The genuinely hard part is the tilt: a couch that fails flat often passes when rotated into the diagonal, so the search must couple planar translation with out-of-plane rotation without exploding the state space — pruning with clearance heuristics keeps it interactive.

## v1 scope
- Three corridor templates (doorway, 90° turn, straight stair)
- Manual numeric input for all dimensions
- OBB vs polygon SAT collision + A* over (x,y,θ)
- PASS/FAIL + tightest-clearance number
- Animated top-down tilt sequence on PASS

## Out of scope
- AR auto-measurement (v2)
- Non-convex objects (recliners with footrests out)
- Multi-object load planning / truck packing
- Crew scheduling or CRM

## Risks & unknowns
Real furniture isn't a rigid box (cushions compress, legs unscrew); the tool must communicate margin, not false precision. Measurement error dominates outcomes — a UI that nudges 'add 2" slack' matters more than solver accuracy. 3-DOF tilt search may be slow on old phones; may need coarse-to-fine.

## Done means
Given a known real-world case (an 84"×38" sofa and a 32" doorway into a 90° hall), the app returns the correct PASS/FAIL matching a physical test, with a tilt sequence a mover can follow, in under 3 seconds on a mid-range phone.
