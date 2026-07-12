## Overview
Baby Monitor is a 3-4 player asymmetric silence game (host TV + per-phone controllers). The room cooperatively keeps a sleeping baby asleep by staying quiet — but one hidden Gremlin secretly wants the baby to wake, and can push silent 'tickle' provocations to other players' phones to make them crack. For groups who like hidden-role tension without the werewolf ritual.

## Problem
Endurance 'don't laugh' games get stale because the pressure is undirected and cascades unfairly off whoever giggles loudest. Baby Monitor gives the temptation a hidden human author and makes each phone judge only its own owner, so breaking is personal, not contagious.

## How it works
The host TV shows a sleeping baby, a slowly spinning mobile, and a NOISE METER; a 60-second timer is the nap. Everyone must stay silent. Each PHONE privately shows the player's role. Nurses (majority) see only a 'stay quiet' screen plus their own live 'you-were-loud' warning. The single GREMLIN's phone secretly shows a TICKLE panel: three buttons that each push a private provocation to one *other* random phone — a startling image, a 'you must whisper the word BANANA in 5s' dare, or a fake 'system' countdown — timed to make that person react out loud. Crucially, every phone runs its OWN mic RMS envelope and attributes vocalizations only to its owner: your giggle spikes the meter and flashes YOUR phone red, regardless of who laughed nearby. Each detected vocalization bumps the shared meter. If the meter hits max, the baby wakes → Gremlin wins. If the nap timer runs out with the baby still asleep → Nurses win. Then one quick private accusation tap reveals the Gremlin.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room { napEndsAt, noise, players:[{id, role, micRms, warned}] }`; tickles are server-routed events `{fromGremlin, toPlayerId, type}`. Each phone posts smoothed `micRms` ~5x/sec; the server, not the phone, decides a 'vocalization' by comparing that phone's level against ITS OWN calibrated baseline plus a hysteresis gate, so cross-talk from a neighbor doesn't falsely convict. The hard part is owner attribution: all phones hear the same room, so at round start each phone captures a 3s quiet baseline, and the server only counts a spike as 'this owner talked' when that phone's excess RMS clearly leads the room (highest, fastest-rising) — otherwise it's ambient and ignored.

## v1 scope
- 3-4 players, one 60s nap, exactly one Gremlin
- Gremlin gets 3 tickle buttons; Nurses get a quiet screen + own red-flash
- Per-phone mic baseline + attribution gate
- Host: baby, noise meter, nap timer, wake/win screen, one accusation round

## Out of scope
- Multiple Gremlins, roles beyond two, scoring across rounds
- Rich tickle content library; a handful is enough
- Reconnection and spectator polish

## Risks & unknowns
- Owner attribution is the make-or-break; false convictions from a loud neighbor would feel cheap
- Tickles must reliably provoke without being readable as 'the Gremlin did that'
- Very quiet or very loud rooms need adaptive baselines

## Done means
Four phones join, one secretly gets the tickle panel, a tickle demonstrably lands on another phone and makes its owner blurt, that phone (and only it) flashes red and bumps the meter, and the round resolves to a correct wake/asleep outcome with the Gremlin revealed.
