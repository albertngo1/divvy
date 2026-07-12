## Overview
Mirror Image is a 3–4 player hidden-role game built on chirality. Every player's phone privately shows the *same* small scene — a numbered arrangement of 5 objects (tree, dog, car, house, well) on a grid. One player, the Mirror, sees the horizontally-flipped version. Players take turns giving one spatial clue about the scene ("the dog is just left of the well"). To the Mirror, left is right and right is left; unless they consciously invert, their clues contradict everyone else's. The Mirror *knows* they're mirrored (it becomes obvious once clues clash) — their skill is real-time mental flipping to blend in. Everyone else is hunting the one giving reversed directions.

## Problem
Most "one player has different info" games hand the imposter a different *fact* to bluff around. Mirror Image hands them a different *coordinate frame* — the deception is spatial and continuous, so every single sentence is a fresh chance to slip. It's a party-scale test of the surprisingly hard skill of mirror-inversion under social pressure, which no existing Jackbox-shaped game does.

## How it works
Host TV (shared): player turn order, the clue log (transcribed or player-read), a 4s per-turn timer, the vote tally, and the reveal (which showed each player which orientation). Crucially the TV never shows the scene.

Each phone (private): the scene diagram in *its* orientation (canonical or mirrored), a "my turn" clue prompt, and at end a ballot. The Mirror's phone quietly notes "your view may differ" — no confirmation, forcing them to infer it from the conversation, which is the tension.

Flow: (1) two clue rounds, each player gives one left/right/above/below clue per turn; (2) 45s open debate; (3) everyone votes for the Mirror; (4) reveal. Innocents win by catching the Mirror; the Mirror wins by surviving — rewarding a clean bluff of inverted clues.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve or PartyKit). Data model: `Room{code, phase, sceneId, mirrorPlayerId, turnOrder[], clues[], votes{}}`; `Scene{objects:[{id,x,y}]}` rendered client-side, x-flipped (`x → gridW-1-x`) only for the Mirror. Sync is trivial (turn-based, no realtime physics) — the hard part is *scene design*: the object layout must be asymmetric enough that a flip produces unambiguous left/right contradictions (a symmetric layout makes the Mirror undetectable and the game pointless). Auto-generate scenes and reject any with a symmetry axis or with objects that don't cleanly separate horizontally.

## v1 scope
- 3 players, one scene, one Mirror.
- 5 objects on a 4×4 grid, one guaranteed-asymmetric layout.
- Two clue rounds, players read clues aloud (no transcription), one vote, reveal.
- Static pre-generated scene, no scoring beyond win/lose.

## Out of scope
- Vertical/rotational mirrors, partial mirrors, multiple imposters.
- Automatic clue parsing/validation, multi-round scoring.
- Reconnect handling, spectators, accessibility for players who can't rapidly reason left/right.

## Risks & unknowns
- Difficulty cliff: skilled inverters may be uncatchable, novices instantly caught — needs a tuned scene where 2 clue rounds is the sweet spot.
- Players might over-rely on non-left/right clues ("the dog is by the well") that a mirror preserves, starving the signal — copy/UI should nudge toward horizontal clues.
- Left/right confusion among honest players adds noise (arguably part of the fun, but could produce false convictions).

## Done means
Three phones each render the same scene with exactly one horizontally flipped; players complete two clue rounds and a vote; the host reveals the Mirror's identity and shows both orientations side by side; across 10 playtests the Mirror is caught when they fail to invert and survives when they invert cleanly, i.e. outcome tracks skill, not luck.
