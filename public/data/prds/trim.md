## Overview
Trim is a cooperative physical-tilt maze for 2-4 players. The shared TV shows a top-down maze with a ball rolling toward a goal — a single virtual table that everyone tilts at once. Each phone is a private tilt paddle wired to just one direction, decided by where that player physically stands relative to the TV. It's Marble Madness for a whole room, where the felt coupling of many hands on one table is the point.

## Problem
Tilt-maze games are lonely: one player, one device, one wrist. Passing a phone around is dead time. Group physical games rarely use the phone's motion sensors at all. The itch is the sensation of a table that four people are tipping together — nobody in full control, everyone leaning to compensate for everyone else.

## How it works
The TV (public) shows the maze, the ball, the goal, and the *resultant* tilt of the shared table. The table's tilt is the sum of every player's phone tilt — but each player's contribution is gated to a single axis/edge determined by their standing position. You calibrate by facing the TV, laying the phone flat, and tapping ZERO. If you stand to the table's south edge, tipping your phone forward pushes the ball north; the west player pushes east; and so on. Your phone shows PRIVATELY only your own edge, a live push-strength meter, and a 'too hard / steady' hint — never anyone else's input. So to thread a corner you must physically feel out who else is pushing and re-position or ease off. In the full version, the TV also hides wall segments and each phone privately reveals only the walls in its own quadrant, forcing 'wall on my side!' callouts.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Phones read DeviceOrientation beta/gamma (iOS requestPermission), low-pass filtered, streamed as deltas at ~20Hz. The server runs the authoritative physics loop at 30Hz: combined tilt vector → ball acceleration → wall collision → broadcast ball state to the TV, which interpolates for smoothness. Data model: `room{maze, ball{x,y,vx,vy}, players[{id, edge, tiltX, tiltY, calibZero, gain}]}`. The genuinely hard part is fairness and feel: per-device rest orientations differ (per-player zero + gain normalization), and network latency makes the ball float (dead-zone, server-side smoothing, cap any single player's authority so one wrist can't dominate).

## v1 scope
- 2 players only; P1 owns the horizontal axis, P2 the vertical.
- One small hand-authored maze, one ball, one goal.
- Face-TV calibration + tap-to-zero.
- Win = ball rests in goal for 1s.
- Each phone shows only its own axis meter; TV shows the shared ball.

## Out of scope
- 4-player cardinal edges and fog-of-war wall quadrants.
- Multiple levels, moving obstacles, enemies, timers.
- Reconnection polish, spectator mode.

## Risks & unknowns
- Latency-induced floatiness may kill precision.
- Calibration drift across devices.
- One player overpowering the table.
- Is bare 2-axis coupling fun enough to justify the build? iOS motion-permission friction.

## Done means
On two phones and a laptop, both players calibrate, and by tilting (P1 left-right, P2 up-down) they cooperatively roll the ball through the maze into the goal within a minute — each phone showing only its own axis meter, the TV showing only the shared ball.
