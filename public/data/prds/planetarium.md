## Overview
Planetarium is a cooperative concurrent-room game for 3-6 players. The host TV is a dark planetarium dome; every phone is a private telescope. The physical room — front wall, back wall, side walls, ceiling, floor — is carved into sky sectors, and players must physically turn and tilt to scan for stars that live in those directions. The catch: no single telescope can see the whole sky, so the room has to divide the labor and, at key moments, aim in perfect concert.

## Problem
Sensor party games mostly reduce a phone to a button. Meanwhile the humble deviceorientation stack (compass heading + pitch) can turn a phone into a true pointing instrument, and a living room already has six 'directions' begging to be a board. The itch: a shared-secret spatial game where where you physically face genuinely changes what you privately see, and cooperation is literally 'you cover the ceiling, I'll cover the back wall.'

## How it works
Each phone shows a small private viewport: a live 'telescope' circle rendering only the stars that fall inside its current aim cone (heading ± ~20°, pitch ± ~20°). Swing your phone and the view pans like a real scope. Stars are scattered across sky sectors, so player A physically faces the couch while player B faces the ceiling — each sees different stars.

The shared host screen shows the target constellation as a faint ghost (e.g. a 3-star triangle) plus a live roster of which players currently have a star 'framed' (a dot, not which star). To draw a constellation LINE, the two stars at its endpoints must be framed by two different phones AT THE SAME TIME and both players tap 'lock' within a 1.5s window. Because endpoints sit in different sectors, one phone physically cannot hold both — so every line is a two-person simultaneous aim. Complete all lines before the 3-minute meteor timer and the sky lights up.

Calibration: everyone points at the TV and taps 'zero' to align the shared heading frame.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object, one object per room). Data model: `players[id] = {heading, pitch, framedStarId, lastLockTs}`; `constellation = {stars[], lines[{a,b,drawn}]}`. Phones sample `deviceorientationabsolute` at ~20Hz, compute framedStarId locally, and send only `{heading,pitch,framedStarId}` deltas (throttled to ~10Hz). The server owns line-drawing: on a `lock` it checks whether the partner star is currently framed by another phone within the time window. The genuinely hard part is heading reliability — iOS `webkitCompassHeading` vs Android absolute alpha differ, magnetometer drifts near TVs/speakers, and simultaneity tolerance must feel fair without being gameable. Mitigation: TV-zeroing to a relative frame, generous cones in v1, server-timestamped lock windows.

## v1 scope
- 3 players, one round, one 3-star triangle (3 lines).
- Fixed star layout, ~2 min timer.
- TV-zero calibration; framed/lock only, no scoring beyond win/lose.
- Host: ghost triangle + framed-dot roster + timer.

## Out of scope
- Multiple constellations, difficulty curves, star catalogs.
- Pretty 3D dome rendering; reconnect/rejoin polish.
- Android/iOS heading auto-detection beyond a manual zero.

## Risks & unknowns
- Compass drift/interference could make aiming feel unfair.
- Simultaneity window tuning: too tight = frustrating, too loose = trivial.
- Permission friction (iOS requires a tap to grant motion access over HTTPS).

## Done means
Three phones on one WS room, each showing a distinct private telescope view; two players can frame the two endpoints of a line and co-lock within the window to draw it; drawing all 3 lines before the timer flips the host to a win screen — and a single passed-around phone provably cannot complete a line alone.
