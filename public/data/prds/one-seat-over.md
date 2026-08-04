## Overview

A 4-player hidden-role game for a living room with a TV and four phones. Everyone watches the same 45-second silent animation of six cartoon suspects seated around a dinner table, each doing something incriminating. Every phone privately holds the *name key* — which seat is Ines, which is Bo. Three keys are identical. One is rotated by exactly one seat, and its holder is not told. The room then testifies aloud and votes on who is reading the wrong key.

## Problem

Traitor games run on lying, which means they run on acting talent. The quiet, honest player is always the worst at it. Here nobody lies: the traitor is the most confident, most detailed, most *sincere* witness in the room, and their testimony is wrong in a way that feels like everyone else is gaslighting them. That's a fundamentally different social texture — paranoia aimed inward, not outward.

## How it works

1. **Watch (45s).** Host TV plays the scene. Suspects are drawn as anonymous silhouettes with seat numbers only — no names on the TV, ever. Six discrete beats occur (seat 3 pockets a spoon, seat 5 swaps glasses, seat 1 slips out).
2. **Key.** Each phone privately shows a ring diagram: six seats, six names. Player D's ring is rotated one seat clockwise.
3. **Testimony (3 min).** The TV issues six prompts in turn order — "Name someone who touched the wine." Players answer aloud *by name*. Everyone's answers are honest; three sets agree, one is offset.
4. **Doubt button.** Any phone may privately press *"I think it's me"* at any time, once. If the odd player presses it and then correctly states the true key rotation, they steal the round outright. If a normal player presses it, they lose their vote. This is the engine: every player spends the round quietly auditing themselves.
5. **Vote.** Simultaneous private accusation on each phone. TV reveals all four keys side by side.

**Private per phone:** your name key, your doubt-button state. **Public on TV:** seat numbers, prompts, turn order, timer, the final key reveal.

## Technical approach

Host browser tab plus phone PWAs over a PartyKit / Durable Object room; the DO is authoritative. Room state: `{sceneId, beats[], keyAssignments: {playerId: rotation}, phase, turnIndex, doubts, votes}`. Keys are dealt server-side and never broadcast — each phone receives only its own `rotation` integer, so a leaked socket frame can't reveal the odd one out.

Sync is loose everywhere except two moments: scene playback start (TV is the clock; phones show a blank "watch the TV" card so there's nothing to desync) and the simultaneous vote (server collects, reveals only when all four land). The genuinely hard part is not networking — it's **content calibration.** The six beats must be individually memorable and involve enough distinct seats that a one-seat rotation produces visible contradiction within the first two prompts, but not the first sentence. That's an authoring loop, tuned by playtest, not a code problem.

## v1 scope

- Exactly 4 players, one round, one hardcoded scene.
- Six suspects, six pre-authored beats, no procedural generation.
- Rotation is always +1 clockwise.
- Doubt button, one press per player.
- Room code join, no accounts, no persistence.

## Out of scope

- Multiple rounds, scoring across rounds, more than 4 players.
- Rotations other than +1; swapped-pair or mirrored keys.
- Any TV text that names a suspect.
- Audio, animation polish, spectator mode.

## Risks & unknowns

- The offset may be exposed by the very first answer, ending the round in 20 seconds. Mitigation: make prompt 1 target a seat where rotation is ambiguous.
- A player who forgets their own key just looks like the traitor — noise, not signal.
- Real risk that the odd player figures it out instantly and the doubt button trivializes the game. Needs a cost tuned by playtest.

## Done means

Four phones join a room code, watch one scene, testify through six prompts, and vote — and in a blind playtest with three separate groups, the odd player is correctly identified more than 40% but less than 80% of the time, with at least one group reporting a genuine "wait, is it *me*?" moment.
