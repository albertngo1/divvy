## Overview
Dazzle is a physical party game for 3–8 people and one phone. The phone, propped at the far end of a room, is 'the drone': it runs live on-device person detection and calls out anyone it sees. Players must cross from wall to wall without being recognized as a human — by freezing, hugging cover, or breaking their body's silhouette (the 'dazzle' of the title). Sparked by the Economist's 'how to hide from killer drones' piece, crossed with Dead by Daylight's asymmetric stealth.

## Problem
Party games are stale, and everyone's phone has a neural net idle in its pocket. There's no physical game that pits your body against a real computer-vision model — where the fun is discovering, viscerally, what does and doesn't fool it.

## How it works
The drone runs rounds. In 'Sweep' mode it scans left-to-right; a player caught fully upright and moving in the detection cone is 'painted' and out. Detection isn't binary confidence-1 — the game surfaces the model's confidence as a rising alarm tone, so players learn to duck under the threshold: crouch to break the person-shape, drape a blanket, split behind furniture, move only during the scanline's off-beat. First to touch the drone's wall wins the round. A chaotic 'Hunter' variant lets one player hold the phone and sweep it manually. The whole joy is the emergent folk-knowledge of what breaks a silhouette.

## Technical approach
Stack: a single mobile web app (no install) using MediaPipe Tasks (Pose/Object Detector) or a WASM YOLO-nano via `onnxruntime-web`, running on the device camera at ~15fps. All inference on-device; no video leaves the phone (privacy is the pitch). Game logic in vanilla TS: per-frame it reads bounding boxes + keypoint confidence, maps the horizontal scanline position to a detection cone, and when a person box overlaps the cone above a tuned confidence it fires an audio 'paint' + logs the eliminated player by box position. Web Audio API for the escalating alarm. Hard part: tuning thresholds so the model is beatable-but-tense — crouching/occlusion must reliably drop confidence below the line, which means picking a model whose failure modes are *learnable and fair*, not random.

## v1 scope
- One phone, Sweep mode only, single automated scanline
- Person-detection with an audible confidence alarm and a 'painted' buzz
- Manual round reset; no score persistence

## Out of scope
- Hunter mode, multi-phone triangulation, thermal/IR gimmicks, accounts

## Risks & unknowns
- On-device model may be too easy (never fooled) or too jittery to feel fair
- Low light / small rooms wreck detection
- Safety: people sprinting/crawling in a living room

## Done means
On a mid-range phone, a standing player walking through the cone is reliably 'painted' within a second, while a crouched or blanket-draped player crossing the same path clears it — and a room of first-timers figures out at least two working evasion tricks in one session.
