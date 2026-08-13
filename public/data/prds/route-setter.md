## Overview

A macOS desktop toy. A small ragdoll climber overlays your screen and climbs the top edges of your actual application windows, treating each title bar as a ledge. The menubar shows the current V-grade of your desktop. Rearranging windows re-sets the route in real time.

## Problem

Desktop pets have been ignoring the desktop for thirty years — they walk on a fake floor drawn over your work. Nothing in the toy actually reads your environment, so it never surprises you. Meanwhile the state of your window layout is real information about your day that you never see reflected back.

## How it works

1. Poll the on-screen window list; extract each window's frame.
2. Convert every window's top edge into a hold segment. The Dock is the ground; the menubar is the top-out.
3. Build a reachability graph: hold A connects to hold B if the horizontal gap is within reach and the vertical rise is within jump height.
4. A* from ground to top-out. The hardest single move on the found path (longest reach, biggest dyno, smallest ledge) sets the grade, mapped to V0–V8.
5. The climber animates the path with 2-limb IK, then sits at the top until the layout changes.
6. Drag a window mid-climb and it becomes a moving hold — the climber rides it, or falls and re-plans.
7. Full-screen one app and there are no holds: unclimbable, grade shows `PROJECT`, climber sits on the Dock.

## Technical approach

Swift + SpriteKit in a borderless `NSWindow` at `.floating` level with `ignoresMouseEvents = true` and `collectionBehavior = [.canJoinAllSpaces, .stationary]`.

Window geometry from `CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID)` at 20 Hz — no Accessibility permission needed for frames, which keeps install friction near zero. Filter by `kCGWindowLayer == 0` and minimum size to drop tooltips and shadows. Diff frames between polls to classify each window as static / being-dragged / resizing.

Physics: don't run a full rigid-body sim against moving static bodies — that's how you get explosions when a window teleports across a Space. Instead the climber is kinematic (path-following, spline-interpolated between holds) with a purely cosmetic ragdoll for limbs, and only the *falls* are simulated.

Grading: normalize each move to reach-distance / climber-height, bin into V-grades with a hand-tuned table. Persist a daily histogram so the menubar can also say "your hardest route this week was Tuesday, V5."

The hard part is discontinuity. Windows appear, vanish, jump Spaces, and get minimized mid-move. The path must be invalidated and re-planned within one frame, and the climber needs a graceful state for "the hold I am currently gripping no longer exists."

## v1 scope

- Transparent overlay, one primary display only
- Window top edges as holds, Dock as ground
- Greedy "climb to the nearest higher hold" — no A*, no grading
- One sprite, four-frame animation, falls when the hold disappears

## Out of scope

Multiple monitors, multiple Spaces, interacting with the climber, sound, Windows/Linux ports, any persistence.

## Risks & unknowns

`CGWindowListCopyWindowInfo` at 20 Hz may cost noticeable CPU; may need 10 Hz plus interpolation. Overlay windows can misbehave with Stage Manager. Delightful for a week, then invisible — the grade readout is the retention bet.

## Done means

Open three windows in a staircase, the climber reaches the top; drag the middle window away mid-climb and it falls and re-routes without a visual glitch.
