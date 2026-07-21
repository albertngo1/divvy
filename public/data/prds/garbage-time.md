## Overview
Garbage Time is a competitive bullet-hell party game for 3-6 players. Each player's phone is a private dodging field — a screenful of drifting bullets you avoid by dragging your dot. Survive, build a clean streak, and the bullets you 'clear' get dumped as garbage onto an opponent's field (Tetris-attack, reimagined as danmaku). Last phone alive wins. The shared TV is the drama board, not the game field.

## Problem
Bullet-hell and competitive falling-block games (Puyo Puyo, Tetris 99) are electric because your screen is *yours* and the pressure is spatial and personal. Party games almost never touch real-time action because coordinating live twitch play across devices feels impossible. But if each phone owns its own local field, the hard part evaporates — and the private-field-per-player is exactly what makes 'sending garbage to someone specific' land.

## How it works
Everyone starts a 90-second round simultaneously. **Privately on each phone:** a vertically-scrolling field of bullets, your draggable dot, a clean-streak meter, and a small target selector (who your next burst hits). You dodge by dragging. Hold a clean streak (no near-misses) for 5 seconds and you 'clear a wave' — a burst of bullets is injected into your chosen opponent's field ~400ms later, telegraphed on their screen by a red warning stripe so it's dodgeable, not a cheap kill. Get hit and you're out.

**On the shared TV (public):** no live bullets — instead a tense scoreboard: each player's avatar, a health/near-miss pulse, ALIVE/OUT status, and big animated arrows whenever someone sends a burst ('Alex → Sam'), plus KO flashes. The TV is where the room reads the war; the phones are where it's fought. Last player alive (or most-recently-alive at timeout) wins.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). The elegant trick: **each phone runs its own local bullet simulation** from a seeded PRNG, so there is no per-frame cross-device sync. The server is authoritative only for discrete events: `sendBurst(fromId, toId, size)`, `hit(playerId, ts)`, and `roundEnd`. Data model: `Room{code, players[], phase, tLeft}`; `Player{id, alive, streakMs, incomingQueue[]}`. Garbage routes server-side; the receiving phone dequeues bursts into its local sim at the next spawn tick. The genuinely hard part is *fairness of ordering* — two near-simultaneous KOs must resolve deterministically — solved by stamping every `hit` with a server-received timestamp and letting the server pick the survivor. TV subscribes to event stream only (cheap), never bullet positions.

## v1 scope
- 3 players, one 90-second round
- Single bullet pattern (steady downward drift, mild spread)
- Drag-to-dodge one dot; auto-target = player on your left
- 5-second clean streak → one fixed-size burst, 400ms telegraph
- TV shows alive/out + send-arrows + winner banner

## Out of scope
- Multiple bullet patterns, boss waves, power-ups
- Manual target picking, teams, best-of-N matches
- Live bullet mirroring on the TV

## Risks & unknowns
- Phone perf: 60fps bullet sim on mid-range Android — cap bullet count, test early.
- Drag ergonomics: finger occludes the dot; use an offset control point.
- Balance: garbage bursts must threaten without feeling unfair (telegraph tuning).

## Done means
Three phones each render an independent, playable dodging field; a clean streak on one phone injects a telegraphed burst into another within 500ms; deaths register in server-authoritative order; the TV declares a correct single winner within one round.
