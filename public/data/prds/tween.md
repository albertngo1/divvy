## Overview

Four players, one 90-second round, one output: a four-frame looping GIF that everyone keeps. Each player draws exactly one frame, but their phone continuously shows a faint live onion-skin of the frame *before* theirs — being drawn at the same moment, by someone else. Frames are arranged in a ring, so player 1's reference is player 4's frame: everyone is chasing a moving target, and the loop has to close on itself. For anyone who's played exquisite corpse and wanted it to move.

## Problem

Collaborative drawing games are turn-based and therefore dead air — three people wait while one draws. And the result is a static picture nobody keeps. The itch: a genuinely simultaneous drawing game whose artifact is *motion*, where the difficulty comes from coordinating with people you can only half-see.

## How it works

Host TV shows a shared subject prompt ("a cat leaping over a fence") and each player's ring position. Then 90 seconds, everyone drawing at once.

**Each phone privately shows:** your own blank canvas at full strength, plus your predecessor's strokes rendered live at ~15% grey opacity — streaming in as they're made. This ghost feed is unique to you. You never see your successor, and you never see the other two frames at all. You are drawing frame N knowing only what N−1 is becoming.

**The host TV shows:** the four frames playing as a 4fps loop, continuously, from second zero. The room watches a smear of scribbles resolve — or fail to resolve — into an animation in real time. That live loop is the whole spectacle, and it's the only view of the complete work.

At the buzzer the host encodes the GIF and shows a QR code. No scoring, no voting, no winner. The loop either moves or it hilariously doesn't, and either way everyone downloads it.

## Technical approach

Host tab + phone PWAs + a Durable Object / PartyKit room (or Socket.IO over Tailscale Serve).

**Data model:** `Room{code, ring[4], prompt, deadline}`, `Stroke{playerId, seq, brush, points[]}`. Canvas is 512×512, strokes are quantized to uint8 coordinate deltas.

**Sync:** each client batches points and publishes stroke deltas at 20Hz. The server fans each player's stream to exactly **two** subscribers — the host, and the one successor phone — never to the room broadcast. Late joiners replay the stroke log.

**The hard part:** the ghost is a live derivative of work in progress, so the reference under your pen keeps changing shape, and undo must propagate as a retraction (`{playerId, undoSeq}`) that the ghost renderer honors without repainting the whole canvas. Worse is the systemic risk: A chases B chases C chases A is a closed feedback loop, and closed loops love to converge on a single grey blob. Damping the ghost (fade older strokes, cap opacity, freeze the ghost for the final 15 seconds so everyone can commit) is the actual design work. Budget ≤150ms end-to-end or the ghost feels like a rumor.

## v1 scope

- Exactly 4 players, one 90-second round, one hardcoded prompt
- One brush, one color, one size, one-level undo
- Live ghost feed at fixed opacity; ghost freezes for the last 15s
- Host loop plays continuously at 4fps
- `gif.js` encode on the host, QR to download

## Out of scope

Color, layers, variable frame counts, prompt packs, replay scrubbing, saving to a gallery, more than 4 players.

## Risks & unknowns

Blob convergence is the big one. Ninety seconds may be too short for anything legible — needs playtest at 60/90/120. Phone canvases vary wildly in stylus fidelity. The ring may feel arbitrary until the first successful loop lands, so the demo GIF matters. Also unclear whether people can mentally hold "draw the *next* moment" while their reference is still forming.

## Done means

Four phones draw simultaneously; each sees a ghost that is provably its predecessor's live strokes and nobody else's; the TV loop updates within 200ms of a stroke; at the buzzer a 4-frame GIF downloads from a QR code on all four phones; and at least one playtest group produces a loop where a recognizable thing visibly moves.
