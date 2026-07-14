## Overview
About Face is a 3-6 player hidden-role game about spatial reference under a hidden distortion. The host TV shows a shared board of distinct colored markers; players take turns guiding others to a private target by talking. One player's board is silently mirrored, so their left is everyone's right. For groups who enjoy the slow-burn 'why do YOUR directions never work' argument.

## Problem
'Subtly different view' deduction games usually swap a fact or a rule the imposter can consciously hide. About Face distorts *spatial intuition itself* — something you can't easily fake around, because you'll reflexively say 'left of the blue dot' and mean the wrong side every single time. The distortion is sustained and involuntary, which produces a full round of divergence (not a one-line tell) and genuine mutual accusation, since the imposter is certain the *others* are the confused ones.

## How it works
The host TV displays a 5×5 grid of ~8 distinct colored markers on empty cells — the public reference everyone can point at by naming colors. **Each phone privately** renders that same board AND privately highlights one target cell for its owner. On your turn, you keep your target secret and give spoken clues ("two right of the blue dot, one down") so the others tap where they think your target is on their own phones; a hit scores the table a point (cooperative shell). The **imposter's private board is horizontally mirrored** — self-consistent, but a flip of everyone else's. Their clues point the group to the wrong side; when they follow others' clues, they land wrong too. Nobody's board looks 'flipped' because there's no text — just a self-consistent field of dots.

Over the round the table notices whose guidance is reliably reversed near landmarks. The imposter, unaware, argues and accuses. Everyone then votes on-phone for 'who is reading a flipped board.' Innocents win by outing the imposter; the imposter survives by deflection.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object; or Socket.IO over Tailscale Serve). Data model: `Board{cells[25], markers[]}` (one canonical layout), `Player{id, role, targetCell, mirrored:bool}`, `Guess{playerId, turnId, tappedCell}`, `Votes`. Sync: server holds one canonical board, sends each phone a render transform (`identity` for innocents, `mirrorX` for the imposter) plus that phone's private target. Taps are resolved server-side against each phone's *own* transform so scoring is consistent. **Genuinely hard part:** guaranteeing the mirror is undetectable-as-a-flip yet reliably divergent — requires a marker layout with no global left/right symmetry (so the mirrored board is a distinct-but-plausible arrangement) and enough landmark density that every clue crosses the flip. Also: turn/lock ordering so late guessers can't copy earlier taps.

## v1 scope
- One canonical 5×5 layout, hand-tuned for asymmetry
- 3-4 players, one round, one mirrored imposter
- 3-4 clue-giving turns, then a single on-phone vote + reveal
- Cooperative hit-scoring is cosmetic; the vote is the game

## Out of scope
- Rotation/transpose distortions, multiple imposters, difficulty tiers
- 'Imposter aware' variant (knows it's off, must self-correct silently)
- Procedural board generation, animations, cross-round scoring

## Risks & unknowns
- Players may spot the flip too fast, or blame ordinary confusion too long
- Verbal clue clarity varies wildly by player — could swamp the signal
- Mirror might be noticeable if any marker/layout reads as asymmetric text

## Done means
Three phones join a room; each renders the shared board, one provably mirrored; players give clues and tap on their own phones with server-consistent scoring; the table votes on-phone and the host reveals the mirrored player — with a tuned layout where playtesters feel the 'your directions are always backwards' friction before they can name who's flipped.
