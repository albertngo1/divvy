## Overview
A 4-player cooperative drawing game, about four minutes, for a room that likes flailing in public. One Curator holds the canvas on their phone. Three Pens hold blank black rectangles and have no idea where their own line is going.

## Problem
Blind-drawing games are turn-based and back-loaded: the funny part is the reveal, and the doing is dead air. Meanwhile, most "one player has the map" games make the other players passive — they receive orders and press a button. Here the Pieces are continuous actuators, and each of them holds a private sense the map-holder does not have.

## How it works
The TV shows the target subject as a plain line drawing (a duck, a house, a key) and a 90-second clock. That's all — the room knows the goal but never sees progress.

The Curator's phone shows the live canvas: the faint target path, the accumulated ink, and three unlabeled pen cursors moving in real time.

Each Pen's phone shows a black square. Drag a finger and your pen moves. Press-and-hold to lay ink. Your only feedback is a soft tone that rises in pitch as your pen tip nears an un-drawn segment of the target — a private hot/cold sense the Curator cannot see or hear.

The catch: your finger-to-pen mapping is secretly transformed. One Pen is rotated 90 degrees, one is mirrored horizontally, one has 3x gain. Nobody is told their own transform, including the Curator. So each Pen is doing private system-identification by ear while the Curator, who can see everything and feel nothing, tries to talk three simultaneously moving hands through a duck. Ink is capped at six seconds per Pen, so exploring is free and committing is scarce.

At time-up the TV animates the finished drawing over the target, scores coverage, and offers the PNG as a keepsake.

## Technical approach
Host tab + phone PWAs + PartyKit Durable Object. Pens stream pointer deltas at 30Hz (batched, ~20 bytes/message). The server is authoritative for pen position and **applies the transform server-side**, so a Pen's client literally cannot read its own mapping from network traffic. The server clamps to canvas bounds, decrements ink while pen-down, and evaluates distance-to-target against a precomputed 512x512 signed-distance field of the target path.

Each Pen receives only a scalar heat value; the Curator receives full pen positions plus the accumulated stroke bitmap, both at 20Hz.

The genuinely hard part is latency. At 60–100ms RTT the tone lags the finger enough to feel broken, and client-side prediction of pen position is impossible because the transform is secret. Fix: ship heat *plus its 2D gradient* so the phone can extrapolate heat locally from raw finger motion for ~100ms without ever learning the mapping.

## v1 scope
- Exactly 4 players, one target shape, 90 seconds, one round
- Three hardcoded transforms (rot90 / mirror-X / 3x gain)
- Coverage percentage and a downloadable PNG
- No reconnect, no avatars, no lobby

## Out of scope
Uploading your own target; a post-round "guess your transform" minigame; competitive mode; erasers or undo; more than three Pens.

## Risks & unknowns
This could be pure frustration rather than comedy — mitigate with a fat brush and a generous 12px tolerance. iOS Safari has no `navigator.vibrate`, so the WebAudio tone must be the primary channel, not a fallback. Three people talking over the Curator may make instructions unhearable; that is probably the fun, but it needs a playtest to confirm rather than assume.

## Done means
A Curator and three Pens reach at least 60% coverage of the duck within 90 seconds in at least half of six playtests; a packet capture confirms no Pen's client receives anything but a scalar and a gradient; the reveal PNG saves successfully on an iPhone.
