## Overview

Data Collapse is a browser puzzle game about the single most satisfying move in experimental physics: taking a graph that looks like spaghetti and, by choosing the right dimensionless axes, watching every curve slide onto one. Each level is a real historical dataset. You don't fit a model, you don't tune parameters — you build a unit-cancelling product of the quantities involved, and the data judges you.

For physics/engineering students, anyone who has met the Reynolds number and never understood where it came from, and people who like Zachtronics-shaped optimization with a beautiful payoff animation.

## Problem

Dimensional analysis is taught as a bookkeeping chore — "check your units" — when it is actually a machine for deriving physics without solving any equations. Buckingham π gets one dry lecture. Meanwhile the *evidence* for it, the data collapse, is a genuinely gorgeous phenomenon that lives buried in monochrome figures in 1933 papers and has never been made interactive.

## How it works

A level opens on a scatter plot: pipe friction factor vs. flow velocity, ten colored series for ten pipe diameters and roughnesses. Total mess. Below it sits a hand of **quantity cards** — velocity [L T⁻¹], diameter [L], density [M L⁻³], viscosity [M L⁻¹ T⁻¹], roughness height [L] — each showing its dimension vector over (M, L, T, Θ).

You drag cards into an exponent rack and dial integer/rational exponents. A live readout shows the running dimension vector; it must reach (0,0,0,0). Build two valid groups — one for each axis — and hit **Collapse**. The plot animates: every point tweens from its raw position to its transformed position. If you found the Reynolds number, ten curves fold into one and the level scores. If you found a valid-but-useless group, the mess just becomes a different mess, and the game tells you *why* ("your group barely varies across this dataset — it isn't measuring anything here").

Scoring: collapse quality (residual spread around a monotone fit), plus par-based bonuses for using the fewest cards.

## Technical approach

- **Stack:** SvelteKit + Canvas2D for the plot (thousands of animated points, no chart lib), no backend — levels are static JSON.
- **Dimensional engine:** each quantity is a 4-vector of rationals. Validity check is exact rational arithmetic, not floats. The hint system solves the nullspace of the dimensional matrix (rank-revealing fraction-free Gaussian elimination) to enumerate the π-group basis — this is exactly what `pint`'s `pi_theorem` does, and porting that logic to TS is the honest shortcut.
- **Collapse score:** transform all points, fit an isotonic/LOESS curve in log–log space, score = 1 − (weighted residual variance / total variance). Anti-degeneracy penalty: multiply by the normalized log-range of the candidate group across the dataset, so a group that's nearly constant (or ignores the quantity that actually varies) scores near zero even though it collapses trivially.
- **Data:** digitized Nikuradse sand-roughness pipe data (the Moody chart's ancestor), the standard sphere drag curve C_d(Re), pendulum period vs. length/amplitude, dam-break Froude scaling, Nusselt–Reynolds–Prandtl heat transfer tables. Stored as CSV with explicit units per column.

**Hard part:** curating datasets that genuinely collapse and are messy *before* collapsing, with trustworthy units — plus writing a scorer that can't be gamed by degenerate groups. That anti-degeneracy term is the whole design problem; get it wrong and every level has a cheese solution.

## v1 scope

- Three levels: pendulum (gentle), sphere drag (the classic), Nikuradse pipes (the showpiece).
- Drag-and-drop rack, exponents restricted to halves and integers in [−2, 2].
- The collapse tween animation. This is the entire reason the game exists — it must feel great.
- One hint button: reveals how many independent π groups exist.

## Out of scope

Level editor. Upload-your-own-data. Leaderboards. Any level requiring more than 6 quantities. Θ-dimension levels beyond the one heat-transfer stretch level.

## Risks & unknowns

Digitizing 1933 log–log figures introduces error that might muddy the collapse — may need to fall back on modern tabulated reproductions. Difficulty cliff: dimensional analysis is unfamiliar enough that level 1 must teach the rack mechanic with a two-card puzzle. And it's possible the payoff, once seen twice, doesn't sustain a third level — the fix is fewer, better levels rather than more.

## Done means

A cold player who has never heard of the Reynolds number finishes the sphere-drag level in under six minutes without reading external material, and the Nikuradse collapse animation runs at 60fps on 4,000 points in Safari.
