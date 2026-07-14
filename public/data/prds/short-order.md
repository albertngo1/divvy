## Overview
Short Order steals the co-op time-management genre (Overcooked, Cook Serve Delicious) and squeezes it into three phones on one cramped kitchen line. The TV is "the pass" where the dish assembles and burns; each phone is a single station whose operator sees only their own micro-game and only their own fragment of the recipe. For 3 players who like to yell.

## Problem
Couch co-op kitchen games are chaotic fun but everyone stares at the same screen, so the "communication" is really just watching. The itch: force real verbal coordination by making the kitchen genuinely un-seeable — nobody can glance at the whole board, and nobody even knows the full recipe.

## How it works
Three stations: **Prep** (chop/portion), **Cook** (pan/timer), **Plate** (assemble/send). The host TV shows the incoming ticket card, the dish slowly assembling, and a burn meter — but no station controls. Each phone privately shows ONLY its own station: Prep's phone shows a chop mini-action and its ingredient bins; Cook's shows a pan with a live doneness gauge (undercook/perfect/burn); Plate's shows assembly slots. Crucially, each phone holds only the **recipe steps that touch its station** — Prep sees "chop 2 onions," Cook sees "sear until gauge hits green," Plate sees "3 components then send" — so no single player knows the full dish. Ingredients move by a handoff tap that lands in the next station's inbox, but the receiver's phone doesn't say what's coming, so you must call it: "two onions coming to Cook!" Miss a handoff or overcook and the burn meter climbs; fill it and the dish flames out on the TV.

Per-phone is load-bearing twice over: stations act *simultaneously* (you each need your own device in real time) and each holds *private partial knowledge*, so a single passed-around phone is physically impossible to play.

## Technical approach
Authoritative WebSocket server (PartyKit / Socket.IO over Tailscale Serve), one Durable Object per room as the single clock. Data model: `ticket` (ordered steps tagged by station), per-station `inbox[]`, `items` with `{id, state, doneness, owner}`, `burnMeter`, `elapsed`. Server ticks doneness/burn at ~10Hz and is the sole authority. Phones send `{action, itemId}`; server validates ownership and step-order, moves items between inboxes, broadcasts each phone its own slice + the TV its aggregate. Recipe fragments are dealt per-socket at start. The genuinely hard part is real-time handoff integrity under latency: two stations touching the same item, or a handoff arriving mid-cook — resolved with server-side per-item ownership locks and a ~150ms grace window, with optimistic UI on the acting phone only.

## v1 scope
- Exactly 3 players, 3 fixed stations
- ONE ticket, one ~4-step dish, 90-second burn timer
- Private per-station view + private recipe fragment, handoff taps
- Win = plate and send before burn; TV shows assemble/flame

## Out of scope
- Multiple/simultaneous tickets, a menu, scoring streaks
- 4+ players, movable chefs, dropped-plate cleanup
- Difficulty tuning, ingredient variety beyond the one dish

## Risks & unknowns
- 3-way real-time handoff may feel laggy on phone networks; grace window untested
- One dish may be too simple to force real shouting — may need a 6-step recipe
- Doneness gauge readability on small screens

## Done means
Three phones each show one station and one recipe fragment, the room verbally coordinates two handoffs, plates the dish before the 90s burn meter fills, and the TV shows the completed plate sent — with no phone ever displaying another station's controls or the full recipe.
