## Overview

A cooperative origami relay for 4–6 people sitting around one table with one square of paper. The host TV is a shared progress board; each phone privately holds one fold in a seven-step sequence. There is no score. The prize is the object, which you sign and someone takes home.

## Problem

Party games manufacture scores and screenshots nobody keeps. And "cooperative" usually means everyone staring at the same screen, or one confident person reading the diagram aloud while the rest watch. Craft nights have the opposite failure: a leader and an audience. Nothing splits the *instructions themselves* across the room.

## How it works

The host deals a 7-step traditional model (a paper cup) across the players. Each phone privately shows 1–2 steps, each rendered as: a **before-state** illustration, an **after-state** illustration, and a verb name ("squash," "inside reverse"). Crucially, **no step number**. The paper sits in the middle of the table.

There is no turn order. You take the paper when you believe its current physical state matches your private before-picture. You may say anything out loud — "does anyone have a triangle with the flap on the left?" — but you may not show your screen; the host displays a persistent SCREENS DOWN banner. When you fold, you tap DONE.

If you were wrong, the crease still happened. The paper is now permanently off-model, every later before-picture is approximate, and **nobody is told**. The host screen shows only steps remaining and an anonymous pulse when someone claims the paper. At the end, the host reveals the intended diagram beside the thing you actually made, and prompts everyone to sign the bottom flap.

Private on phone: your fold(s), a "this might be mine" nudge that pulses the TV anonymously. Public on TV: steps remaining, claim pulses, final reveal.

## Technical approach

PartyKit Durable Object per room. Model: `Room { modelId, pointer, assignments: playerId → stepIdx[], claimLog: [{playerId, ts, believedStep}] }`. Steps are pre-authored static SVG pairs; a phone only ever receives its own assigned steps over the socket, so the private state is enforced server-side rather than by client hiding.

Sync is trivially easy here — a dozen messages per game. The genuinely hard part is **legibility**: rendering a before/after pair that a total non-folder can match against a real, slightly crumpled sheet under bad living-room light. Second hard part is a design decision, not an engineering one: the server *could* reject out-of-order claims, and v1 deliberately does not. Wrong folds are accepted and logged, because the mistakes are the artifact.

## v1 scope

- 4 players, one model (paper cup, 7 steps), one round, ~10 minutes
- Hand-authored SVG step art for that single model
- QR join, no accounts, no persistence past the room
- Host reveal screen: intended model, "hold yours up," signature prompt
- Zero scoring code anywhere in the repo

## Out of scope

- Multiple models or difficulty tiers
- Any CV verification that a fold was done correctly
- Photo capture, upload, or remote play
- Undo

## Risks & unknowns

- Origami skill floor: a paper cup may still be too hard cold, with no diagram
- Screens-down is honor-system only
- "It's mine!" collisions could read as frustrating rather than funny at 6 players
- One sheet means one pair of hands at a time; three people spectate for ~40s per step

## Done means

Four people who have never folded anything finish one sheet in under 12 minutes with no printed diagram; at least one wrong claim occurs and the room laughs at the reveal instead of groaning; someone takes the object home.
