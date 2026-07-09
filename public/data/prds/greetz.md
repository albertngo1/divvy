## Overview
A celebratory build artifact for developers with a soft spot for the crack scene. When CI goes green or a PR merges, Greetz renders a browser-based cracktro: scrolling greetz, a bouncing logo, plasma/copper-bar effects, and a procedurally generated chiptune — presenting your commit as if it were a freshly cracked release from `TEAM $REPO`.

## Problem
Everything in modern dev tooling is about subtraction and shame: clawsweeper closes your issues, linters nag, dashboards go red. The small joy of *shipping* gets a gray checkmark. Keygen Church proved people still love scene aesthetics; nothing channels that toward the moment work actually succeeds.

## How it works
A GitHub Action (or local git `post-merge` hook) posts commit metadata to a tiny endpoint that returns a shareable cracktro URL. Open it and a canvas demo plays: the commit message becomes the scroller, author becomes the "cracked by," repo becomes the group name, and the commit SHA seeds both the visual palette and a chiptune. Optional `--tv` mode loops on a spare monitor as an ambient "ship board."

## Technical approach
Static front-end: WebGL2 (or 2D canvas) for plasma/copper/starfield, bitmap font for the sine-scroller. Chiptune generated in the Web Audio API via a minimal 4-channel tracker: SHA bytes seed key, scale (major/dorian/phrygian), and an arpeggio/bassline pattern from a handful of hand-authored chord progressions, so every commit sounds distinct but musical. Metadata passed as URL-encoded params (no DB needed for v1); GitHub Action is ~30 lines calling the deploy URL. The hard part is making generative chiptunes that are *pleasant* not random — constrain to seeded selection over curated progressions rather than free note generation.

## v1 scope
- Canvas cracktro: scroller + logo + one plasma effect
- SHA-seeded chiptune from ~6 curated progressions
- URL takes `msg`, `author`, `repo`, `sha`
- Copy-paste GitHub Action snippet in README

## Out of scope
- Multiple selectable effect themes / scene packs
- Persisted history / "release board" archive
- Slack/Discord embeds

## Risks & unknowns
- Autoplay audio is blocked until user gesture — TV mode needs a one-click start.
- Charm may wear off fast; needs enough visual variance per seed to stay fun.

## Done means
Merging a PR triggers the Action, which produces a URL that opens a looping cracktro whose scroller shows the commit message and whose chiptune is deterministically reproducible from the SHA.
