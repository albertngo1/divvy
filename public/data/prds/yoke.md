## Overview
A 5-player cooperative real-time chaos game. One player is the **Pilot**, whose phone shows the whole maze and a single shared token. The other four are **Hands** — each phone is a single directional thruster (up / down / left / right) and nothing else. Together the four Hands are one clumsy avatar the Pilot steers by voice.

## Problem
'One phone is the map' pieces usually move themselves. That's fine until it's just fog-of-war. The fresh itch: split control of ONE body across four blind people, so the failure is gloriously human — someone pushes left a half-second late and you smear into a wall.

## How it works
The server simulates a single token with light drift/momentum on a maze grid with walls and an exit.

- **Pilot's phone (the map/board):** full maze, walls, exit, and the live token position. The Pilot cannot push anything — they can only see and talk.
- **Each Hand's phone (private, blind):** a full-screen button labeled with exactly ONE direction (e.g. 'PUSH ↑'). Holding it applies continuous thrust in that direction. Hands see no maze, no token, no other buttons — just their one thruster and a haptic buzz when it's active. Because the four buttons are held by four different people simultaneously, the token can move diagonally only if two Hands cooperate on the Pilot's call.

The loop is pure real-time verbal piloting: 'RIGHT… ease off… DOWN a tap… everyone STOP.' The token drifts if nobody thrusts, so silence is dangerous. Hit a wall and the token bounces/stuns for a second. Reach the exit before the 60-second timer to win. The comedy is entirely in latency between the Pilot's mouth and four thumbs.

## Technical approach
Host browser tab (big-screen spectator view of the maze + token, for the room to laugh at), phone PWA clients, authoritative WebSocket server (PartyKit / Durable Object). **Data model:** `token{x, y, vx, vy}`, `maze{walls[], exit}`, `thrust[playerId] -> bool + dir`. **Sync:** server runs a fixed-timestep physics loop at ~30Hz; each Hand streams button-down/up events; server integrates velocity from the set of currently-held thrusts, resolves wall collisions, and broadcasts token state to the Pilot and host only (Hands receive nothing spatial — just an ack that their thrust registered). **Hard part:** stable 30Hz physics over WebSocket so 'STOP' feels instant — needs input timestamps, server-side buffering of button state, and jitter smoothing so a laggy Hand doesn't ghost-thrust after release.

## v1 scope
- 5 players: 1 Pilot, 4 Hands (one per cardinal direction).
- One hand-built maze, one exit, one 60-second timer.
- Momentum + wall-bounce; win/lose screen only.
- No scoring, no rounds.

## Out of scope
- Scrambled/secret button mappings the Pilot must deduce.
- Multiple tokens, rotating roles, best-of series.
- Fewer-than-4 Hands with doubled controls.

## Risks & unknowns
- Sub-100ms feel over WebSocket; too much lag kills it.
- Does momentum help (funny drift) or just frustrate? Tune friction.
- Four simultaneous held buttons with fair server arbitration.

## Done means
Five phones join; the Pilot sees a maze with one drifting token; each Hand sees exactly one labeled thruster and feels a buzz while held; the room voice-steers the token to the exit inside 60s, and releasing a button visibly halts that thrust within one physics tick on the Pilot's screen.
