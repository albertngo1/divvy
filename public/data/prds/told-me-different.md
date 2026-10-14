## Overview
Told Me Different is a 4-5 player bluffing game. One player is the Guide and holds the maze on their phone. The others are Walkers who can't see it. The Guide's secret job is to get every Walker out except one secret Mark, who must end up in the pit. The Walkers want everyone out, and they want to name the Mark. It's for groups who enjoy Werewolf-style accusations but want them grounded in geometry instead of vibes.

## Problem
In map-holder games the map-holder's words are taken as truth because nobody can check them. A spoken lie reaches the whole room at once, so it has to be the same lie for everyone. Private per-phone channels change that: the Guide can tell each Walker something different. What's left is the question of whether a liar can stay consistent across four private stories when every listener holds a small piece of ground truth.

## How it works
- **Guide phone (private):** a 7x7 maze, every Walker's position, the exit, the pit, and the secret Mark's name. It also has a composer for sending each Walker up to 3 arrows per turn, privately.
- **Walker phones (private):** your received arrows, your own step log, and **your four surrounding walls only**, shown as a tiny cross. You can follow, ignore, or edit the arrows before committing.
- **Host TV (shared):** a turn counter, which Walkers have committed, a 60s discussion timer, and an "escaped" tally. No map.
- Each turn: the Guide sends arrows, Walkers talk out loud (reading their arrows and walls truthfully or not), then commit moves at the same time.
- Walkers can say anything. The Guide can't speak during the discussion and may only send arrows.
- After 8 turns, Walkers vote on who the Mark was. The Guide wins if the Mark is in the pit and the vote misses. Walkers win if they name the Mark, or if all of them escape.
- The catch: if the Guide steers the Mark toward the pit, the Mark's wall readings will contradict a story where they're headed for the exit. The Guide has to cover for that by bending the other Walkers' arrows too.

## Technical approach
Socket.IO room over Tailscale Serve. State: `{maze, walkers[id]→{cell,log[]}, mark, pit, exit, turn, inbox[id]→arrows[]}`. The server sends each Walker only their own inbox and their wall bitmask, computed from the maze. Moves commit as one simultaneous batch, and any move into a wall is a no-op that gets reported only to that Walker. **Hard part:** not the networking, which is turn-based and small, but leaking just enough. The wall cross is the only ground truth, and its information density decides whether lies get caught in 2 turns or never. Ship a server flag that switches between 4 walls and 2 walls so it can be tuned at the table.

## v1 scope (humiliatingly small)
- One round, 1 Guide + 3 Walkers, 8 turns
- One hand-made maze, a fixed pit, a random Mark
- Arrows only; no free-text messages
- End screen replays the whole game on the TV: real paths, every private message, who the Mark was

## Out of scope (for now)
Multiple Marks, Walkers lying for their own scoring, procedural mazes, a Guide who has to keep a public log consistent.

## Risks & unknowns
- Walkers may just ignore the Guide and solve the maze themselves from pooled wall readings. Cap pooling by limiting talk to 60s, and use a maze big enough that dead reckoning alone fails.
- The Mark might not realize they're being targeted until too late. That could be good tension or could feel bad.
- The end replay may turn out to be the real payoff. That's fine.

## Done means
Four phones join. Each Walker sees only their own arrows and wall cross. The Guide sends different arrows to different Walkers in the same turn. Simultaneous commits resolve correctly. The replay shows every private message side by side, and a playtest produces at least one accusation backed by a wall reading.
