## Overview
Shoal is a 4-player cooperative panic game. One player (the Cartographer) holds their phone as the *only* view of a hidden depth-map grid; the other three are blind fish, each phone a featureless dark controller showing a single dot — their own position — and a swipe pad. The tide rises in real time. The Cartographer must talk three blind bodies onto high ground before every low cell floods.

## Problem
"One phone is the board" games usually degrade into turn-taking, at which point you could just pass one phone around. Shoal refuses that: three fish swim *simultaneously* and continuously, so the Cartographer is always behind, juggling three verbal threads at once. That overload is the fun.

## How it works
The host TV shows the grid but only reveals cells *as they flood* — the past, safe to display. Upcoming safe elevations live exclusively on the Cartographer's phone as a shaded contour map with three moving fish-dots. Each fish's phone shows a black screen, its own dot, and a directional swipe pad; swiping nudges the dot one step, integrated by the server at ~15Hz. Fish cannot see terrain, other fish, or the shoal — only the Cartographer can, and only speech connects them.

Every ~5s the tide rises one elevation band; any fish on a now-submerged cell starts drowning (3s grace to escape). The safe shoal shrinks each band. In the default round the shoal peaks just large enough for all three — barely — so the Cartographer is herding three blind dots through a closing maze in 60 seconds. Win: all three fish on dry cells at peak tide. On the hard variant the shoal holds only two, turning the Cartographer into a triage judge and the reveal into an argument.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object), 15Hz tick. Data model: `grid[H][W].elevation`, `tideLevel` rising on a timer, `fish[]{id,x,y,drowningSince}`, `cartographerId`. Phones send debounced swipe-intent vectors; server integrates movement, resolves drowning, and broadcasts **role-scoped views**: full contour+all-dots to the Cartographer, own-dot-only to each fish, flooded-mask+dots to TV. The genuinely hard part is channel separation under latency — a single leaked field (upcoming elevation reaching a fish or the TV) breaks the whole game — plus smoothing continuous multi-phone movement so three simultaneous swipers don't feel laggy or rubber-band.

## v1 scope
- 1 Cartographer + 3 fish, fixed 8×8 grid, one 60s tide cycle
- Swipe-to-nudge movement, 5s tide bands, 3s drown grace
- Three role-scoped WS views + TV flood reveal
- Win/lose banner; re-run same grid

## Out of scope
- Multiple rounds, rotating Cartographer, scoring across games
- Currents, obstacles, animated water, sound
- The shrinking-shoal triage variant (post-v1 dial)

## Risks & unknowns
- Verbal bandwidth: can one person really steer three blind dots? Tune grid size and tide speed.
- Map leak via TV glances — fish players must be trusted not to peek; framing/seating matters.
- Swipe latency feeling unfair when a fish drowns.

## Done means
Four phones join; three fish see only their own dot; the Cartographer sees the contour; tide rises; a fish left on a flooded cell drowns; all-three-safe shows a win — and no fish phone or the TV ever renders unflooded elevation.
