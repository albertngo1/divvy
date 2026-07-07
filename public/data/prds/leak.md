## Overview
Leak is a 3-4 player party game that steals the "sends" mechanic from lane tower-defense (Warcraft 3 TD, Line Wars): you don't just defend, you spend to shove monsters down someone else's road. Each player has a private lane; the shared TV is the arena where everyone's hidden plans collide at once. For groups who like a little backstabbing with their reflex-free strategy.

## Problem
Tower defense is a lonely solo genre and its multiplayer "send" mode lives on PCs with hotkeys. The delicious part — secretly overbuilding one turn to counter a send you saw coming, or gambling your economy on an attack — never survives being read off a passed phone. It needs simultaneous, hidden, per-player planning.

## How it works
One round = one Build phase then one resolve. PRIVATELY, each phone shows only YOUR lane: a short 5-node path, your gold, and two menus — place towers (Slow / Splash / Sniper) on node slots, and buy an attack wave (a bundle of creeps: Fast / Tanky / Swarm) tagged with a target rival. Everything is hidden; nobody sees your board or your send. When all lock (or a 45s timer fires), the server resolves. The shared TV then animates every lane simultaneously side-by-side: your towers fire on the creeps others sent at you. Creeps that reach the end "leak" and cost you life. Big reveal moments: you dumped gold on Splash towers while the swarm that hit you was Tanky — wrong call, live on screen.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object holding one room). Data model: Room{players[], phase, tick}; Player{gold, life, lane:[node slots], towers:[{node,type}], pendingSend:{creeps[],targetId}}. During Build, phones send incremental patch ops (place/sell/queue), server validates gold and echoes only that player's own state back. On lock, server runs a deterministic combat sim (fixed 0.1s ticks: spawn creeps into target lanes, towers acquire+damage, tally leaks) and streams the resulting event log to the host, which plays it back with tweened sprites. Hard part: the sim must be authoritative and reproducible so the TV animation and the life-loss math never disagree — all randomness seeded server-side, host is a dumb renderer of the log.

## v1 scope
- 3 players, exactly one Build+resolve round, then show standings.
- 3 tower types, 3 creep types, one 5-node lane shape.
- Fixed starting gold; no economy carryover.
- Host renders the resolve as simple colored dots marching; no art.

## Out of scope
- Multiple rounds / economy growth across rounds.
- Tower upgrades, creep abilities, lane branching.
- Reconnect mid-round, spectators, mobile-vs-desktop host.

## Risks & unknowns
- Balance: sends may dominate defense or vice versa; needs playtest tuning of gold costs.
- Build phase could feel fiddly on a small screen — node/tower UI must be tap-simple.
- 45s planning with no feedback risks dead air; may need a live "gold spent" nudge.

## Done means
Three phones join a room code, each privately builds and queues a send, all lock, and the TV plays one synchronized resolve where at least one player visibly loses life to leaked creeps — with each phone's private board never having appeared on the shared screen.
