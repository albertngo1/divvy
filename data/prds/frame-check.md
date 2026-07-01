## Overview
Frame Check is a forensic puzzle game that crosses baldurk/renderdoc (a GPU frame debugger) with the competitive-shooter crowd trending on Steam (Rainbow Six Siege, Counter-Strike). You play an anti-cheat analyst who inspects a captured frame's draw calls to prove — or clear — a wallhack accusation.

## Problem
Anti-cheat is a black box; players scream 'hacker!' with no idea how cheats are actually detected at the render level. Frame Check turns the real forensic loop — a suspicious frame, a list of draw calls, a tell hiding in the render state — into a satisfying detective game.

## How it works
Each case hands you a 'capture': an ordered list of draw calls, each with render state (depth test on/off, blend mode, bound shader, textures, target). The frame shows an enemy visible through a wall. You scrub the draw-call timeline, toggle individual calls on/off, and inspect state. The tell might be a draw call with depth-test disabled painting the enemy on top of everything, or a 'chams' shader swapping the wall material to translucent. You tag the offending call, classify the cheat, and get a verdict. Clean frames must be correctly cleared.

## Technical approach
Web app, WebGL2 (regl or raw GL) that actually *replays* a simplified authored capture — each draw call is real geometry with real state, so toggling depth-test visibly changes the rendered image and keeps the forensics honest. Capture format: JSON `[{id, shader, uniforms, depthTest, blend, geometryRef, target}]`. A timeline scrubber replays calls `0..n`. Each level embeds exactly one anomaly plus a classification key. The genuinely hard part is authoring believable capture data and a replay engine faithful enough that flipping depth-test-off produces a convincing wallhack look, while decoy calls stay plausible.

## v1 scope
- 5 authored cases (3 guilty, 2 clean)
- Draw-call timeline scrubber + render-state inspector
- Toggle call visibility to test hypotheses
- 'Accuse' a call + pick cheat type; verdict screen

## Out of scope
- Importing real RenderDoc `.rdc` captures
- Live game integration or real anti-cheat
- Anything beyond wallhack/chams tells

## Risks & unknowns
- WebGL replay authoring is fiddly and time-consuming
- Keeping it a puzzle, not tedious call-by-call clicking
- Forensic model must be correct enough to teach, not mislead

## Done means
A player loads a case, scrubs the timeline, toggles the depth-test-disabled draw call and watches the enemy pop through the wall, accuses that call, and receives 'wallhack confirmed'; a clean case with no anomaly is correctly cleared.
