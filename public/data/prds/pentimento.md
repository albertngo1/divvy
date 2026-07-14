## Overview
Pentimento is a hidden-role party drawing game for 4–6 players, riffing on **A Fake Artist Goes to New York**. Everyone contributes a single brushstroke to one shared picture — but the strokes are drawn **blind and simultaneously**, and one player was never told what they're drawing.

## Problem
A Fake Artist is wonderful but its turn-based single-pad drawing hands the faker a crutch: they simply copy the placement and style of earlier strokes and coast. Pen-passing is also slow and leaks who's stalling. Blind, simultaneous strokes remove the copy crutch entirely, and only per-phone delivery can give one player a different secret than everyone else.

## How it works
The server privately assigns roles: every real artist's phone shows the same secret word (e.g. `LIGHTHOUSE`); one **Faker's** phone shows only `?`. The host TV shows a blank canvas with a faint grid; each phone shows a small private drawing surface assigned a region/color. On a synchronized 15-second timer, **all players draw exactly one stroke at once, blind** — you see only your own stroke, never anyone else's. When the timer ends, every stroke composites onto the TV simultaneously. Real artists were trying to render the word coherently; the Faker was bluffing plausibly. Then each phone privately shows a one-tap vote for who the Faker is. Reveal: the Faker scores if uncaught (or, if caught, gets a steal by guessing the word).

Private per phone: your word-or-`?`, your own hidden stroke canvas, your vote. Shared TV: the blank grid during drawing, the all-at-once composite at reveal, the vote tally.

Load-bearing: blind + simultaneous means the game literally cannot run on one passed phone (everyone draws at the same moment, unseen), and the asymmetric secret role must be delivered per-device. Both are essential.

## Technical approach
Host tab + phone PWA + authoritative WS server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room { word, fakerId, players:{id, role, strokePath:[{x,y}], vote} }`. Phase machine: assign → draw(15s) → composite → vote → reveal. Strokes are captured locally as normalized pointer-event point arrays and sent only when the window closes — never streamed to peers. The host renders all paths into one shared SVG/canvas. The genuinely hard part is mapping each phone's local canvas coordinates into its assigned region of the shared canvas (differing aspect ratios) and keeping the draw window truly blind and fair: an authoritative server timer that rejects late strokes and releases the composite atomically.

## v1 scope
- 4 players: 3 real artists + 1 Faker
- One secret word from a hardcoded list
- Single 15s blind, simultaneous one-stroke draw
- One composite reveal, one private vote, role reveal

## Out of scope
- Multiple strokes/rounds, Faker word-steal bonus, stroke-order replay animation, brush/color pickers, spectators, scoring across games.

## Risks & unknowns
- One stroke each may make even the honest picture incoherent — region hints need tuning so real art is legible enough to expose the Faker.
- Coordinate normalization across devices.
- With a single stroke the Faker may be too easy or too hard to spot; may need to show the Faker the region layout. Vote ties need a rule.

## Done means
Four phones join; three see `LIGHTHOUSE` and one sees `?`; all draw simultaneously and blind; the TV composites four strokes at once; phones cast private votes; the Faker is revealed with a tally — reproducibly in one round.
