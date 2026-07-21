## Overview
Sixty Hertz is an anti-synchronization survival game for 3–5 players. Every phone is a private power generator feeding one shared grid; the host TV shows nothing but the grid's frequency needle. You win by keeping the needle in its safe band — which means the room must supply power CONTINUOUSLY yet never surge together.

## Problem
The tempting, cooperative move — everyone pushing power at once when the needle dips — is exactly the move that trips the breaker. It's a coverage problem inverted into an anti-coordination one: you need somebody feeding the grid at all times, but two feeds landing at the same moment is a collision that blacks everyone out. Party games rarely make "acting together" the failure state; this one does, literally.

## How it works
Each phone shows a big INJECT button and a PRIVATE capacity bar that recharges on its own timer. Tapping INJECT dumps your stored charge as a surge into the grid, then you're spent until you recharge. The host TV shows ONLY the shared frequency needle (target band ~60 Hz) and a steady demand curve draining it downward. If nobody injects, the needle sags → brownout (fail). If two players inject within a short window (~400 ms), the combined surge overloads → breaker trips → blackout (collision fail). You can never see anyone else's bar or recharge state, so you read the needle's wobble to sense when a gap needs filling — and hold your finger when you suspect someone else is about to go. Win = keep the needle in-band for 45 seconds.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object). Data model: `room { gridFreq, demand, generators: { id, charge, lastInjectTs } }`. Server tick ~20 Hz: demand drains `gridFreq`; each inject event adds an impulse; if two inject events fall within window W, trip. Server is authoritative for frequency and alarm state, broadcasting freq+alarm to everyone but each generator's charge only to its owner. The hard part is fairness and tuning: the collision window must be judged by server-receive time normalized against measured RTT (so a laggy tap doesn't wrongly collide), and the frequency physics must be tuned so the safe band is tense but genuinely holdable by three humans reading one needle.

## v1 scope
- 3 players, one 45-second survival round
- Fixed demand curve, uniform 5s full recharge
- Collision window ~400 ms, single frequency band
- Win = survive to the timer; brownout or trip = instant loss

## Out of scope
Multiple rounds, difficulty ramps, generator archetypes, scoring beyond win/lose, any visual grid map.

## Risks & unknowns
Tuning hell (the fun band is narrow); collision-window fairness under lag; the abstract needle may confuse; risk it devolves into luck rather than reading the room.

## Done means
Three phones each inject independently; two injects inside the window trip a visible blackout; too long with no injection sags to a brownout; holding the needle in-band for 45s fires a win; no phone ever sees another's charge bar.
