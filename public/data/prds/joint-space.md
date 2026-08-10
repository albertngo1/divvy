## Overview
An explorable explanation of configuration space for anyone who has ever wondered why a robot arm can see a gap and still refuse to go through it. You sketch a 2D room, place obstacles, and place a planar 2-link arm. Beside the room, a second panel shows the same world as the robot experiences it: a 360°×360° torus where every pixel is a joint pair (θ1, θ2), black if that pose collides. Drag a table two centimeters and a whole continent in the torus splits in half.

## Problem
Motion planning is taught with static textbook figures. The single idea that makes it click — that free space in the room and free space in joint space have completely different topology — is almost never shown live. Meanwhile every hobbyist with a 3D-printed arm hits it and concludes the planner is broken.

## How it works
Three linked panels, all live at 60fps while you drag:
1. **Workspace**: polygon room, draggable obstacles, arm with two draggable joint handles.
2. **C-space**: 512×512 torus map, free = pale, colliding = ink. The current pose is a cursor; dragging the cursor drives the arm, dragging the arm drives the cursor.
3. **Connectivity**: flood-fill colors each connected free component. Click any free pixel to set a goal — BFS on the wrapped grid returns a joint path and the arm animates it, tracing a curve in both panels at once.

A "sensor noise" toggle replaces exact polygons with a sampled point cloud, dilates obstacles by ε, and you watch the narrow passage pinch shut — the reason real robots refuse gaps that look fine on the CAD drawing.

## Technical approach
Vite + TypeScript + React for chrome; the C-space map is computed on the GPU. Obstacles are rasterized into a signed distance field texture (jump-flood algorithm, one pass on change). Then a single fragment shader over a 512×512 target treats gl_FragCoord as (θ1, θ2), reconstructs both link segments analytically, samples the SDF at ~12 points per link plus the link half-width, and writes collide/free. That is ~6M SDF taps per frame — trivial for WebGL2. Connectivity comes back to the CPU via readPixels into a Uint8Array, then union-find over the grid with wrap-around neighbors on both axes (the torus identification is the part that is easy to get subtly wrong). Paths are BFS with the same wrapped adjacency, then Chaikin-smoothed and re-collision-checked.

Hard part: making the torus legible. A flat 360×360 square lies about adjacency at the seams, so the panel offers a 3×3 wrapped tiling and a shaded donut mode (Three.js, C-space bitmap as the texture) so you can see a path that leaves the right edge and re-enters the left.

## v1 scope
- One 2-link arm, fixed link lengths, fixed base.
- Rectangles-only obstacles, drag and resize.
- GPU C-space map + connected-component coloring.
- Click-to-goal BFS path with animation in both panels.
- Share button that encodes the whole scene in the URL hash.

## Out of scope
- 3+ DOF (C-space becomes a volume; needs a whole different renderer).
- Real robot import (URDF), dynamics, torque limits.
- RRT/PRM sampling planners — grid BFS is honest and complete here.

## Risks & unknowns
readPixels every frame may stall the pipeline; may need to compute connectivity only on drag-end. Donut mode risks being pretty and useless. Audience may be small — robotics students plus curious devs.

## Done means
Drag one obstacle into a doorway and the C-space panel visibly splits into two colored components within 100ms, and clicking a goal in the far component reports "unreachable" instead of animating a path through the wall.
