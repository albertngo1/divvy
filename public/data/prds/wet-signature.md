## Overview
Wet Signature is a browser microgame that weaponizes soft-body UI physics: you must complete an absurd government-style form before it wobbles into chaos. Each level is a procedurally cranked-up form — jiggling inputs, checkboxes that repel your cursor, a Submit button with a self-preservation instinct. A silly, shareable 3-minute rage toy, great as a party-round on one shared screen.

## Problem
The itch is pure catharsis and mischief: everyone hates real bureaucratic forms, and "soft-body physics for HTML form controls" is a delightful gimmick begging to be turned from novelty into obstacle. Nobody has made the joke *fight back*.

## How it works
A form appears with N fields to complete correctly (type the captcha word, tick the right boxes, sign in the box) before a timer expires. Difficulty modifiers escalate: fields sway on springs, tab order shuffles, the required-field asterisks migrate, and the Submit button flees the pointer within a radius, only becoming clickable once every field validates. Signing means dragging to draw a squiggle inside a jittering box. Score = accuracy × time bonus × chaos multiplier; you share a seed so friends attempt the exact same cursed form. Party mode: pass one laptop, lowest completion time wins the round.

## Technical approach
Stack: vanilla TS + Vite, `matter.js` (or Rapier via WASM) for 2D soft bodies; each control is a DOM element pinned to a physics body via a per-frame transform sync (position + rotation from body → CSS `translate`/`rotate`). Springs/constraints give the jelly wobble; the fleeing Submit button is a steering-away force applied when the cursor enters its influence radius, gated by a `formValid()` check. Levels are seeded procedural: a mulberry32 PRNG picks field count, modifier set, and validation targets, so a seed string reproduces an identical form for head-to-head play. Signature capture is pointer-event polyline scored on bounding-box coverage. Hard part: keeping the physics *annoying but fair* — a difficulty curve where dodging never becomes literally unclickable, plus stable DOM↔physics sync at 60fps without input lag.

## v1 scope
- One form template, 5 hand-tuned modifiers, single timer
- Jelly text inputs + dodging Submit + draw-to-sign
- Seeded generation with a shareable seed URL
- Local score + "try this seed" share card

## Out of scope
- Online leaderboards / accounts
- Mobile touch tuning (desktop pointer first)
- Real form-builder / user-authored levels

## Risks & unknowns
- Physics-driven controls can read as broken rather than funny — needs playtesting on the fair/frustrating line.
- Accessibility is inherently poor (that's the joke) — ship a boring "just the form" fallback link.
- Joke may be one-and-done; seeded head-to-head is the retention bet.

## Done means
A stranger loads a shared seed, laughs, completes the wobbling form under the timer at least once, and sends the same seed to a friend to beat their time — all with no dropped frames on a mid laptop.
