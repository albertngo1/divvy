## Overview
A silent, physical convergence game for 3–5 people in one room with a TV. Everyone holds up their phone as a live camera. The host screen shows a single composite image: the **per-pixel median** of every phone's current frame. When you're all pointing at different things, that composite is featureless gray sludge. As the room converges on one object, the sludge resolves into that object. No talking, no pointing.

## Problem
Most "guess what I mean" party games happen entirely on screens; the room itself is inert set dressing. And most convergence games give you a discrete guess-and-reveal loop. This one makes the room the board and the feedback continuous — you physically walk, tilt, and hunt while a shared image sharpens or dissolves in your peripheral vision. It only works because everyone holds a *different* camera.

## How it works
Host screen: the live median composite (updated ~4fps) plus an **agreement bar** (how tightly the frames match) and a countdown. It never shows any individual player's camera feed.

Each phone privately shows: its own live viewfinder, a small "you are contributing" dot, and one **Forbidden card** — the name of a single object in the room that *you specifically* may not converge on ("the lamp", "the fruit bowl"). Every player's Forbidden card is different and secret. So the room must land on a target that nobody's card forbids, discovered only by feeling one player silently refuse to follow, over and over.

Round: 120 seconds. When the agreement bar holds above threshold for 3 seconds, the round locks. Reveal: all five raw frames are shown side by side alongside each Forbidden card. Room wins if the frames genuinely match and no one shot their own forbidden object.

## Technical approach
Host browser tab + phone PWA (`getUserMedia`, rear camera) + PartyKit / Durable Object over Tailscale Serve (HTTPS is mandatory for camera access).

Each phone draws its video to an offscreen 48×48 canvas, converts to luma, **normalizes per frame** (subtract mean, divide by stddev) to erase exposure and white-balance differences between devices, and ships 2.3KB as a binary WS frame at 4fps. Five phones ≈ 46KB/s — trivial on LAN.

The DO keeps only the latest frame per player (`{playerId, seq, Uint8Array}`), drops anything older than 500ms, and fans the set out to the host. The host computes per-pixel median across the live set, upscales to a canvas, and derives agreement as `1 - mean(MAD across players)`.

The genuinely hard part is that per-frame normalization is not enough: two phones aimed at the same lamp from opposite sides of a room produce very different pixels. v1 accepts this — the game is really "same framing," which is why players naturally cluster physically. Secondary hard part is clock skew; frames must be median'd over a common 250ms bucket or the composite ghosts on any camera motion.

## v1 scope
- One 120s round, 3–5 players, one room, decent lighting assumed
- Fixed 48×48 luma pipeline, 4fps, no resolution negotiation
- Median composite + agreement bar + countdown on host
- One Forbidden card per player, drawn from a hand-written list of ten household objects
- Reveal screen with raw frames side by side

## Out of scope
Multiple rounds, scoring, object recognition / embeddings, color composites, front camera, low-light handling, spectator mode, reconnect mid-round.

## Risks & unknowns
The median may read as mush even on real agreement if players stand far apart — needs a live playtest before anything else is built. iOS Safari may suspend `getUserMedia` when the screen dims. Forbidden cards might make the round unwinnable if two players' cards make the only good target ambiguous; the object list needs slack.

## Done means
Three phones in one room, pointed at three different things, produce visible gray mush on the TV; pointed at the same chair, the chair is unmistakably recognizable within 2 seconds, with no talking and no phone showing another phone's feed.
