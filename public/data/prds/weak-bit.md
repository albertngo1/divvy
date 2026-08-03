## Overview
A single-player management roguelike spanning 1978–1994. Each run you are the protection engineer at a floppy-era software publisher. Every title you ship gets a protection scheme you assemble from real historical primitives, and then the game simulates a living cracking scene racing you — while your own protection generates returns, support calls, and reviewer contempt. It is Zachtronics-adjacent in that the systems are real, but the fun is economic, not spatial.

## Problem
Every piracy game is a stealth or morality game. Nobody has modeled the actual, deliciously perverse incentive structure the industry lived through: the best protections were the ones that failed *gracefully*, over-protection cost more in RMAs than piracy ever did, and a fast crack was free distribution that measurably sold sequels. That tension is a great game and it has never been built.

## How it works
Per title (one run ≈ 12–16 titles):
1. **Design phase.** Spend a budget across primitives, each with real trade-offs: weak bits (cheap, needs a custom duplicator run), spiral tracking, half-tracks, fat tracks, extra sector, checksum-in-self-modifying-code, code wheel, manual lookup (dark-red-on-red), key disk, dongle, nag screen. Each primitive has a *mastering cost per disk*, a *false-positive rate* against the drive-alignment population, and a *frustration* value.
2. **Ship.** A sales curve runs day by day.
3. **Crack sim.** A population of scene agents — a kid with a nibble copier, a group with a logic analyzer and a disassembler, an insider at the duplication house — each has a tool set. Every primitive has a per-tool time-to-crack distribution; combined schemes multiply, but a single unprotected weakness short-circuits the whole stack (the real historical failure mode).
4. **Diffusion.** Once cracked, the release spreads through a BBS graph; each cracked install has a probability of becoming a *sequel buyer*, so a crack is partly demand.
5. **Fallout.** False positives on legit drives → returns and support hours, both billed against you. Reviewers dock points for code wheels. Your board only sees the quarterly number.

Meta-progression: a protection R&D tree carried across titles, plus per-year escalation — colour photocopiers arrive, parameter-copier databases arrive, the scene gets organized.

## Technical approach
Godot 4 or plain TypeScript + canvas; simulation is the product, art is CGA-palette UI chrome. Core model: a scheme is a DAG of primitives; time-to-crack per agent is a shortest-path over that DAG using per-(primitive, tool) log-normal parameters. Sales = a Bass diffusion model with an unprotected-substitute term. Returns = Poisson draw against the false-positive rate × installed drive-condition distribution, which itself drifts (older drives fall out of alignment yearly). Determinism from a seeded PRNG so runs are shareable by seed. Hard part is **legibility**: the player must be able to see *why* they lost 40% of the quarter — needs a post-mortem screen that decomposes revenue delta into piracy, returns, support, and review penalty, or the whole thing reads as noise.

## v1 scope
- Six primitives, three cracker agents, five years.
- One sales curve, one chart, one post-mortem screen.
- No art beyond text and rectangles.

## Out of scope
Actual disk-format emulation. Story. Multiplayer. Anything after 1994.

## Risks & unknowns
Balance is brutal: the dominant strategy may collapse to "ship one cheap primitive forever." Fix by making the false-positive population drift and by letting agents share tools. Also: is the fantasy legible to players who never touched a floppy?

## Done means
A seeded 5-year run where an over-protected title outsells nothing and *loses* money to returns, the post-mortem names it, and a second run with a cheaper scheme wins — with no rule change.
