## Overview
Doctored is a hidden-role deduction game for 4-6 players: a shared host screen plus private phones. Everyone privately holds a detailed illustrated scene and takes turns describing one detail aloud. All copies are identical — except the imposter's, which carries three tiny edits. The table listens for whose descriptions don't line up, while the imposter gambles on which of their details are safe.

## Problem
Spot-the-difference is a solitaire, passive puzzle. Social deduction imposters usually get caught by behavior, not content. Fuse them: make the *difference* be which picture you were dealt, and force the imposter to reason about a doctored view they can't fully identify. Every sentence they speak is a bet.

## How it works
The TV shows an empty framed "gallery" canvas, a numbered speaker log, and a turn indicator. Each phone PRIVATELY shows a rich illustrated scene (a diner, a beach). Honest players all see one image; the imposter's phone shows the same scene with three subtle swaps (a red book instead of blue, a cat instead of a dog, an extra window).

On your turn, you tap a spot on YOUR image. This drops a numbered pin — mirrored to the TV only as an empty spotlight circle on the blank canvas, revealing no content — and you say one true sentence about what's there ("the man on the bench is reading a red book"). Others hear it; if it clashes with their copy, they privately register the dissonance. Table norm/rule: describe only, never announce "mine differs."

After each player places two pins, every phone PRIVATELY votes for the imposter. The imposter is told: "one copy is doctored and it may be yours — blend in" — but never which details differ, so each described detail is a live gamble. Honest players win by majority-voting the imposter; the imposter wins by surviving.

Private on phone: your full image, your pins, your vote. Shared on TV: the blank framed canvas with accumulating spotlight circles, the numbered speaker log, and the final tally.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object / Socket.IO over Tailscale Serve). Data model: `Room { sceneId, variants: {honest, doctored, diffRegions[]}, assignment, pins[]: {player,x,y,order}, votes }`. A pin tap sends normalized coordinates; the server broadcasts a content-free spotlight to the TV. Turn-based, so timing is loose — the hard part is the *content pipeline*: authoring a base illustration plus a doctored layer whose edits survive a careless glance but crack under scrutiny, and rendering the TV as spotlights-only so it never leaks which image is canonical.

## v1 scope
- 4 players, one round
- One hand-drawn scene + one doctored variant (3 diffs)
- Tap-to-pin + spoken description; two pins each
- One private vote per phone; reveal overlays both images with diffs circled
- QR join, no accounts

## Out of scope
- Image generation, multi-round play, scoring persistence
- Hint systems, difficulty tiers, more/fewer diffs
- In-app voice chat

## Risks & unknowns
- Art asset cost; diffs calibrated too subtle (no signal) or too obvious (instant)
- Players may break the bluff by blurting "mine's different" — needs an enforced describe-only norm
- Imposter may get unlucky and never pin a diff → no signal (mitigate by clustering diffs in describable hotspots)

## Done means
Four phones join; each shows a scene (exactly one doctored); players place spotlight pins and speak; every phone votes privately; the TV reveals both images with the three diffs circled and whether the imposter was caught — no phone ever sees another's image or the canonical designation before reveal.
