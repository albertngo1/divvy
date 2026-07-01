## Overview
Backseat is a companion web app you open while watching a live esports match (CS, Rocket League, Warframe showcases, etc.). Every 30–60 seconds it prompts a fast micro-prediction — "Who wins this round?", "Next goal in under a minute?", "Does the push succeed?" — and scores you live against everyone else in the room. It turns passive spectating into a shared, low-effort competition.

## Problem
Watching esports is passive backseating — you *think* you'd have made the play, but there's no way to test it or compete with fellow viewers in the moment. Second-screen engagement is a shrug (a Discord chat), not a game.

## How it works
You join a 'room' tied to a match. The host (or an automated feed) pushes prediction prompts with short timers; you tap an answer before it locks. When the real outcome happens, correct predictors get points scaled by how contrarian-but-right they were. A live sidebar leaderboard ranks the room; a season ladder aggregates across matches. Rooms are social — invite friends, or join a big public room for a marquee match. The whole loop is glanceable so you can still actually watch.

## Technical approach
Stack: a lightweight web app (SvelteKit/React) + a WebSocket server (a small Node/`ws` or a managed room service) for real-time prompt broadcast and answer collection. Prompts are the crux: v1 uses a *human operator* (a 'caster') firing pre-templated prompts from a control panel and marking outcomes — no fragile game-telemetry integration. Data model: `rooms`, `rounds {prompt, opensAt, locksAt, outcome}`, `predictions {user, round, choice, ts}`, `scores`. Scoring uses a Brier-style rule so calibrated confidence beats coin-flips. The genuinely hard part is latency fairness: prompts must reach all clients within a tight window and lock server-side to prevent late answers after outcomes leak in chat/stream delay.

## v1 scope
- Manual 'caster' control panel to fire prompts + mark outcomes
- Real-time room via WebSocket, join by code
- Live leaderboard + Brier-style scoring
- One game type (e.g. Rocket League goals)

## Out of scope
- Automated prompts from game telemetry
- Real-money stakes
- Native/mobile app
- Cross-match season ladder (v2)

## Risks & unknowns
Stream delay/desync means outcomes can leak before a prompt locks — the fairness problem is real. Depends on a live human operator in v1, which doesn't scale. Retention hinges on marquee matches to fill rooms.

## Done means
Two people in a room see the same prompt appear simultaneously, submit before lock, and after the caster marks the outcome both scores update live and the leaderboard reorders — with late answers rejected server-side.
