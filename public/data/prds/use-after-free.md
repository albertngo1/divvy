## Overview
Use After Free is a 2–4 player co-op deduction horror game for programmers. It grafts Phasmophobia's evidence-gathering loop onto the Lobsters memory-safety zeitgeist (pgrust, Cpp2Rust, borrow-checker discourse): you're a cleanup crew entering a haunted C++ codebase to identify which *class* of undefined behavior is haunting it, then banish it — before the heap fully corrupts.

## Problem
Memory-safety bugs are the perfect horror antagonist: invisible, non-deterministic, corrupting things far from where they live. There's no fun social game that captures the paranoia of chasing a use-after-free at 2am. Programmers want a party game that speaks their language and isn't a dry quiz.

## How it works
Each round the engine picks a hidden 'entity' (use-after-free, double-free, data race, buffer overflow, uninitialized read) with a distinct evidence signature — like Phasmophobia's ghost types. Players explore a stylized memory-map 'house' (stack rooms, the heap basement) and deploy 'tools': a sanitizer flashlight (ASan reveals red-zone flicker), a thread-timeline EMF that spikes on races, a valgrind camera. Each tool yields one evidence type; three evidences narrow to one entity via a shared journal. Guess right and craft the fix (pick the right Rust-ish primitive: `Arc`, `Mutex`, lifetime) to banish it. Guess wrong or dawdle and the heap-corruption meter fills, spawning jump-scares (dangling-pointer wraiths).

## Technical approach
Browser-based co-op: TypeScript + a lightweight canvas/WebGL renderer, WebRTC or a tiny Node relay for state sync. The 'house' is a 2D tile memory map. Core data: an `Entity` table mapping each UB class → 3 of ~7 evidence signals + a set of red-herring behaviors; deterministic per-round seed drives which rooms flicker. No real code execution — evidence is a designed simulation, which keeps it a *game* not a linter. Hardest part is tuning the evidence/red-herring matrix so entities feel distinguishable but not trivially so (borrow Phasmophobia's exact 3-of-N structure) and pacing the corruption meter for tension. Shared journal is CRDT-lite (last-write-wins per checkbox).

## v1 scope
- One room/house layout, hotseat or 2-player WebRTC
- 4 entities, 6 evidence types, 3 tools
- Shared evidence journal + deduction UI
- Corruption meter + one lose condition, one banish minigame
- Local seed-based rounds, no accounts

## Out of scope
- 3D graphics / VR
- Voice proximity chat
- Procedural house generation
- Matchmaking, leaderboards, progression unlocks

## Risks & unknowns
- Fun hinges entirely on the evidence-matrix tuning; could feel like a lookup table.
- Niche audience (programmers who also want horror co-op).
- WebRTC sync jank in a 4-player session.
- Horror atmosphere is hard to nail in-browser without heavy assets.

## Done means
Two players over WebRTC complete a full round: gather 3 evidences with tools, correctly deduce the hidden UB class from the journal, perform the banish minigame, and the round resolves win/lose — with at least one playtester saying they felt actual tension from the corruption meter.
