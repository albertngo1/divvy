## Overview
Backseat is a 3-player cooperative panic game for phones-as-controllers around a shared TV. A marble must reach a goal through a maze, but the three abilities needed to do it — *seeing the walls*, *moving left/right*, and *moving up/down* — are split across three phones that physically cannot be combined. It only works if people talk fast and trust each other.

## Problem
The itch: the classic Etch A Sketch / backseat-driver frustration where the person who knows where to go isn't holding the controls, and the two people holding the controls each only own half a joystick. Passing one phone around defeats it entirely — the split IS the game.

## How it works
Roles are assigned automatically at start:
- **Navigator's phone (PRIVATE):** the full maze — walls, hazards, the goal, and the live marble position. This is the ONLY place the walls exist.
- **X-Hand's phone (PRIVATE):** a single horizontal slider / tilt strip. Moving it drives the marble left-right. Shows nothing about the maze.
- **Y-Hand's phone (PRIVATE):** a single vertical strip driving up-down.
- **Host screen (SHARED):** the marble and the goal floating in FOG — no walls. Everyone watches the marble creep and, on a wall-hit, a red flash + a shrinking 'health' bar.

Because the Hands see no walls and the Navigator holds no controls, the Navigator must narrate continuously ('down slow… STOP… now hard right, wall coming') while the two Hands translate 'right' and 'down' into their private axes in real time. Three wall-hits and the marble resets to the last checkpoint; reach the goal before the timer to win. The comedy is the axis confusion ('MY right or the marble's right?') and the two Hands fighting the same diagonal.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ mazeSeed, marble{x,y,vx,vy}, health, roles{navPhone,xPhone,yPhone}, checkpoint }`. The server owns physics: it integrates marble position at ~30Hz from the two axis inputs, does wall collision against the seed-generated maze, and broadcasts marble state to all clients. Each phone streams only its own axis value (0–1) up; the Navigator's client renders the maze locally from the seed. Genuinely hard part: making split-axis control feel tight despite phone→server→host latency — input smoothing + client-side prediction on the host marble, and a slow base marble speed so ~120ms round-trips feel like 'heavy steering' rather than lag.

## v1 scope
- Exactly 3 players, fixed roles, ONE hand-authored maze.
- One goal, one timer, three-hit reset to a single mid-maze checkpoint.
- Tilt or slider input; no hazards beyond walls.
- Win/lose screen, then stop.

## Out of scope
- 4+ players, role rotation, multiple mazes, moving hazards.
- Procedural maze generation, difficulty tuning, scoring/leaderboard.
- In-app voice — players use their real voices in the room.

## Risks & unknowns
- Latency could make split control feel mushy; base speed tuning is critical.
- 'Your right vs. marble's right' may frustrate more than delight — needs a quick tutorial marble.
- Only-3-players is a strict count; a 4th spectator role may be needed to avoid benching people.

## Done means
Three phones join, the Navigator sees walls the Hands and TV do not, both Hands' axes independently move the shared marble, wall-hits register and reset at the checkpoint, and a real group reaches the goal purely by shouting directions in one playtest.
