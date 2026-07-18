## Overview
Allen Key is a hidden-role deduction game for 3–5 players — shared TV plus one phone each. Everyone 'builds' the same flat-pack furniture from a private ordered step sheet; the imposter's sheet has two steps quietly swapped, so they confidently argue for the wrong build order. For anyone who has ever fought a family member over IKEA instructions.

## Problem
Same core itch as every good imposter game: a faker who *stalls* is boring. The fresh angle is the universally maddening experience of assembly instructions — a domain where being confidently, sincerely wrong feels completely natural, which is exactly what makes the sabotaged imposter blend in.

## How it works
The TV shows a public exploded diagram of a piece (a nightstand): numbered parts A–H, cam locks, dowels. Each phone privately shows an ordered STEP SHEET ('Step 3: fix shelf C into sides B & D *before* the back panel'). Everyone's sheet is identical — except the imposter's, where two adjacent steps are transposed and one dependency altered (back panel before shelf).

Build phase: the server calls 'Step 3,' and every player simultaneously taps which part-pair they'd join next on their private diagram. Taps reveal together on the TV as the 'consensus next move'; a clean consensus locks onto the shared build. On the sabotaged steps the imposter taps a different pair → a visible split. Players then argue aloud ('no — the shelf HAS to go in first!'), and the imposter defends their (poisoned) sheet in good faith. After the build, each phone privately votes for who was working off a bad sheet.

Per-phone is load-bearing: private, differing step sheets plus simultaneous secret taps are the entire tell. Passing one phone around exposes the swap and ends the game.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Model: `room{pieceId, baseSteps[], imposterSteps[], imposterId, depGraph}`. Server issues each client its step sheet, sequences step-calls, gathers simultaneous `{playerId, partPair}` in a 4s window, releases to the host. The hard part is *authoring assemblies*: each piece needs a small dependency graph so a 2-step swap produces **exactly one** detectable conflict (both orders look defensible until a dependency bites), not total chaos — otherwise the imposter is either instantly obvious or never wrong.

## v1 scope
- 3–4 players, one nightstand (6 parts, 5 steps, 1 swapped pair), one imposter.
- 3 step-calls with simultaneous tap reveals, then one vote.
- Host renders the diagram, the consensus/split animation, and the reveal. No accounts.

## Out of scope
- Multiple furniture pieces, freehand part-dragging, cross-game scoring, 3D models, difficulty tiers.

## Risks & unknowns
- The swap may read as too obvious or too subtle — depends entirely on the dependency graph tuning.
- A bold liar could flip an innocent during the argument phase; may need a lightweight evidence/log on the TV to anchor claims.

## Done means
On 3 phones + a laptop: the imposter's swapped sheet produces a visible split on the sabotaged step, an argument ensues, and a majority correctly votes out the imposter in a single live playtest.
