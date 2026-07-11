## Overview
Sitter is a 3-5 player concurrent-room drawing game: the room collaboratively paints a single portrait, but each player draws only one facial region — blind to the others — under a private emotional brief. The finished, surreal face is the shared keepsake; there's no score.

## Problem
The classic parlor game 'picture consequences' (fold the paper, draw the next bit unseen) is pure warm chaos, but it dies on a single passed sheet — one person draws while everyone waits. The itch: keep the blind-reveal magic but let everyone draw AT ONCE, privately, and walk away with the artifact.

## How it works
The host TV shows an empty portrait frame divided into regions: hair, eyes, nose, mouth, jaw/background. Each region is assigned to one player.

Each PHONE is a private canvas showing ONLY your region's slot plus a faint neutral silhouette guide — you cannot see any neighbor's strokes, and you never see the assembled face until the reveal. Your phone also privately shows a secret BRIEF for your region: an emotion the others don't get, e.g. eyes = 'just heard wonderful news', mouth = 'trying not to sneeze', jaw = 'utterly bored'. Because every region is emotionally at odds, the assembled face is delightfully incoherent — that's the joke, and it's only possible because the briefs are private.

Everyone draws simultaneously over 2 minutes. On lock-in the host animates the regions sliding into one frame — the reveal. The composite portrait is exported as an image: the keepsake, sharable to the group chat. As a light coda, each phone privately guesses which secret emotion drove each region; matches are shown for laughs, but winning is simply that the portrait exists and everyone has it. Artifact over points.

## Technical approach
Host browser tab + phone PWA canvases + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `{ portraitId, regions: [{id, ownerId, briefId, strokes:[], committed:bool}] }`. Phones stream compact stroke deltas (or just POST a final PNG/SVG of their region on commit — simplest for v1) scoped to their own region; the server rejects writes to regions you don't own and, crucially, only broadcasts a region's art to the host at reveal, never to other phones — that server-side visibility gate is what enforces 'blind'. The host composites regions by fixed frame coordinates. Sync is easy (a handful of commits); the genuinely fiddly part is region geometry that lines up into a face-ish result across wildly different drawings, and phone canvas scaling across screen sizes.

## v1 scope
- 3 players, one round, one fixed 3-region face (eyes / nose / mouth).
- One hardcoded brief per region; commit sends a final region PNG.
- Host composites + exports one portrait PNG.

## Out of scope
- Stroke-level live streaming, undo, color/brush options, region library, the guess-the-emotion coda, spectators.

## Risks & unknowns
- Does 3-region output read as a face or as mush? Needs tight frame guides.
- Canvas UX on small phones; touch-drawing quality.
- Is a private brief enough tension, or is this just a warm toy? (That may be fine.)

## Done means
Three phones each draw one blind region with its own hidden brief, none can see another's canvas before reveal, and the host composites and exports a single saveable portrait PNG.
