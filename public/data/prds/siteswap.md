## Overview
Siteswap is a client-side puzzle game that teaches the combinatorics of juggling. You author patterns in siteswap notation on a timeline; a 2D physics sim juggles them with two animated hands; puzzles ask you to satisfy constraints, scored on validity, difficulty, and elegance. For people who saw the HN homemade-juggling-beanbag guide and want a sandbox for the *math* of juggling, not just the beanbags.

## Problem
Siteswap is a genuinely beautiful, tiny piece of applied combinatorics that almost nobody meets, because the entry points are dense text and real balls you'll drop. There's no fun, forgiving place to *play* with valid patterns and see them move.

## How it works
You drop digits onto a period timeline (e.g. `531`). The game validates using the siteswap theorems: the average of the digits must equal the ball count, and `(i + s_i) mod period` must be a permutation (no two throws land in the same slot). Valid patterns animate — each digit is a throw whose height scales with its value, alternating hands. Puzzle mode hands you constraints ('exactly 4 balls, period 5, must include a `0` gap') and you hunt for a valid pattern; a daily challenge ships with a computed par.

## Technical approach
TypeScript + Canvas/WebGL. Core is a siteswap validator (permutation/collision test + average theorem) and a state-graph for legal transitions between patterns. Ballistic sim maps throw value → apex height and airtime so timing reads correctly across two hands. A generator/solver enumerates constraint-satisfying patterns to build solvable daily puzzles and compute par. The hard part is turning abstract notation into *readable* two-handed throw timing, and guaranteeing every generated puzzle has a known minimal solution.

## v1 scope
- 3-ball and 4-ball vanilla siteswaps only.
- Manual entry → validate → animate.
- One hand-authored puzzle set of 10 with pars.

## Out of scope
- Multiplex and synchronous siteswaps.
- 3D rendering, multiplayer, leaderboards.
- Mobile-tuned controls.

## Risks & unknowns
- Physics readability — juggling that looks like juggling is fiddly.
- Niche appeal; may land as a teaching toy more than a game.
- Validation edge cases once multiplex/sync sneak in.

## Done means
Enter `531` and it validates as a legal 3-ball pattern and animates correctly; enter `532` and it's rejected with the specific reason (two throws collide at landing slot X).
