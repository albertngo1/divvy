## Overview
Spot Meter is a 60-second cooperative round for three people, a TV, and three phones. One photograph. Everyone drags a small circle of light over it. The TV shows the photo blacked out, lit only where your circles agree. Win by silently converging all three spotlights onto the same detail. For groups who want a convergence game with no reading, no typing, and a genuinely tense live feedback loop.

## Problem
Most "secretly match me" games are one-shot: you submit a guess, you find out, it's over. There's no steering, no warmth, no live hunt. And the ones that are live collapse into "we all put it in the middle" — the screen becomes the shared coordinate system and the puzzle evaporates.

## How it works
- **Host TV (public):** the canonical photo rendered fully black. Regions covered by exactly two spotlights glow dim amber. Regions covered by all three glow full-brightness photo. That's the *only* feedback — never a cursor, never a count, never whose. A lock meter fills while the triple-overlap holds.
- **Phone (private):** the same photo, but under a per-player affine transform — a random rotation, an optional mirror, and a 1.4–2.2× zoom onto a different sub-crop. A thumb-draggable disc covering ~8% of the image area. You see your own disc live; you never see anyone else's.
- The private warp is the whole game. "Center of my screen" is a different pixel for each player, so the room can only converge on *image content* — the red mug, the left shoelace. When a dim amber patch appears on the TV, you must recognise which part of the photo that is, then find it again in your own rotated, mirrored frame. Two players agreeing produces a light the third has to chase.
- **Win:** triple-overlap area ≥ 60% of one disc, held continuously for 2.0 seconds. TV then un-blacks the photo and circles what the room agreed on. Score = seconds elapsed.
- Talking is banned. The amber patch is the only channel.

## Technical approach
Host browser tab + phone PWAs + PartyKit Durable Object (or Socket.IO behind Tailscale Serve). Room state: `{photoId, players: {id, transform:{rot,mirror,scale,offset}, disc:{x,y} in canonical coords}, phase, lockMs}`. Phones stream disc position at 20 Hz in *local* coordinates; the server applies the inverse transform so a phone never learns anyone else's frame.

The hard part is the shared visual field. The server rasterises a 96×96 coverage-count grid each 100 ms tick, packs the ≥2 and ≥3 masks as two 1-bit planes (~1.2 KB), and broadcasts only that to the TV — never raw positions. The TV upsamples with a blur and interpolates between ticks so the light feels analogue rather than steppy. Lock detection is server-authoritative on the same grid.

## v1 scope
- Exactly 3 players, 1 photo, 1 round, 60-second clock.
- Three hardcoded transforms (0°/+90°+mirror/+210°+1.8× zoom).
- Fixed disc radius; drag only, no zoom or resize on the phone.
- Win/lose screen with the converged detail circled. No scoreboard persistence.
- Join by 4-letter room code, no accounts.

## Out of scope
- More than 3 players, multiple rounds, photo packs, difficulty tiers.
- Competitive/traitor variants; per-player scoring.
- Reconnect handling beyond "refresh and rejoin the same seat."

## Risks & unknowns
- **Brute-force sweeping** — three players scanning randomly might stumble into a triple. An 8% disc makes random triple-overlap rare, but needs playtesting; a shrinking disc is the fallback.
- **Photo quality is load-bearing.** Needs one strongly salient detail plus three plausible decoys. A bad photo makes the game either instant or hopeless.
- **Latency.** Above ~200 ms round-trip the steering loop feels dead. LAN/Tailscale should be fine; WAN is unproven.
- Rotation-induced motion sickness for some players; mirroring may be too cruel.

## Done means
Three phones join a code, each renders the photo under a visibly different transform, and dragging moves a disc at 20 Hz. The TV is black, shows amber where any two discs overlap, shows the photo where all three do, and after 2.0 s of ≥60% triple-overlap freezes with the detail circled and the elapsed time. Three strangers, not allowed to speak, win at least once in three attempts.
