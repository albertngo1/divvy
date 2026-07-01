# Changelog Roguelike

## Problem
Procedural roguelikes generate from noise. Noise has no meaning. What if the dungeon meant
something — like the actual history of a piece of software you know?

## What it is
A browser roguelike where each floor is built from one commit of a real repo. Big refactors are
boss floors. Bug-fix commits spawn the bugs you have to kill. The commit message is the floor's
flavor text. Beating the repo = walking its whole history.

## v1
- Point it at one hardcoded public repo via the GitHub commits API.
- Map commit stats (files changed, +/- lines) to floor size and enemy count.
- Minimal tile renderer, WASD movement, one enemy type, stairs down = next commit.

## Done means
You can descend three "floors" generated from three real commits and see the messages as flavor.
