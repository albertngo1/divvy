## Overview
Red Tape is a browser skill/rage game that takes Jelly UI's soft-body physics for HTML controls and does the mischievous opposite: instead of making forms delightful and easy, it makes filling one out a physical *struggle*. You are a clerk racing to refile a land deed before the registry office closes. For players who enjoy QWOP, Getting Over It, and Papers Please, and anyone who has ever fought a government portal.

## Problem
Soft-body UI is a cute demo with nowhere to go. Meanwhile the funniest recent news — a hacker wiping Romania's entire land registry — is begging for a comedic outlet. There's a joke here about how the *tool designed to reduce friction* becomes the source of maximum friction. Red Tape harvests that laugh.

## How it works
Each level is a bureaucratic form (Land Deed, Passport Renewal, Permit 27-B). Fields aren't typed — they are jiggling jelly blobs (a name stamp, a date wheel, a signature glob) scattered on a wobbling desk. You drag each blob and hold it steady over its slot; when alignment error stays under threshold for 0.6s it *snaps and stamps*. But the desk has soft-body physics too: dropping a blob too hard bounces the others off, a ceiling fan applies wind, and a countdown 'office closes' timer ticks. Knock a blob off the desk edge → it's lost, refile. Complete all slots before the timer → APPROVED, with a wax-seal flourish and a shareable time. Fail → a red REJECTED stamp thwacks across the screen and you restart the form. Escalating levels add more blobs, slipperier physics, and 'amendment' blobs that must be stamped in a specific order.

## Technical approach
Pure client-side. Rapier2D (WASM) or matter.js for the soft-body composites — each blob is a small mesh of particles linked by distance constraints, rendered on a `<canvas>` with a metaball/marching-squares shader so they read as gooey. Pointer drag applies a spring force to the grabbed particle. Alignment scoring = centroid distance + angular error vs. the slot's target transform. Levels are JSON (slot layout, blob roster, wind schedule, time limit). No backend; scores hashed into a share URL. The genuinely hard part is *game feel*: soft-body grabbing must feel weighty but not maddening — tuning spring stiffness, damping, and the stamp-tolerance window so it's hard-funny, not hard-annoying.

## v1 scope
- One level: the Land Deed (4 blobs, one fan, 45s timer)
- Metaball rendering + drag-to-stamp + snap detection
- APPROVED / REJECTED end states with a shareable completion time

## Out of scope
- Real text entry, mobile touch tuning, level editor, leaderboards, sound design beyond stock thwacks

## Risks & unknowns
- Soft-body drag might feel bad; needs a play-test tuning pass
- Metaball shader perf on integrated GPUs
- Comedy could wear thin without level variety

## Done means
A stranger loads the page, fumbles the jelly deed, gets it stamped in under 45s on the third try, laughs, and shares their time — with zero explanation needed.
