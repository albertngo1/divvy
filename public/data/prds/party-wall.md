## Overview
Party Wall is a real-time cooperative party game for 3–4 players sharing a TV and holding phones. Everyone is a tenant in one thin-walled apartment building trying to throw the loudest possible party — while never overlapping their music with an adjacent unit. It's for groups who like tense, wordless, everyone-wins-or-everyone-loses pressure.

## Problem
Most "stay in sync" party games reward matching. The anti-coordination itch — where being loud at the *same moment* as your neighbor is the disaster — is underserved. Party Wall makes silence and staggering the skill: you must all succeed individually without ever accidentally colliding.

## How it works
The building is a hidden adjacency graph (a line or small ring for v1). Each phone is dealt ONE thing the host never shows: your neighbor list — the apartment numbers whose walls touch yours. That's it. You do not know your neighbors' current state.

**Each phone shows PRIVATELY:** a big hold-to-BLAST button, your personal Party Bar (fills only while you're blasting; needs ~15s cumulative to hit 100%), and your list of adjacent apartment numbers.

**The shared host screen shows:** the building facade, a Complaint Meter, and each apartment's Party Bar as a public progress bar (so you can see WHO still needs time, but never who is loud right now).

While you hold BLAST you fill your bar. The catch: if at any instant two *adjacent* apartments are both blasting, the Complaint Meter climbs fast (distant units blasting together is fine — thick enough walls). No overlap → the meter decays. If the meter maxes out, cops arrive and EVERYONE is evicted — a shared loss. Win: every player fills their Party Bar before the 90s timer or an eviction.

Because you can't see neighbor state, the rising Complaint Meter is your only tell: it means a neighbor is loud *now* — so let go and wait. Play devolves into nervous pulsing, watching public bars to guess who's desperate, and gambling on quiet windows.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. **Data model:** `players[{id, neighbors:[ids], partyPct, blasting:bool}]`, `complaint:float`, `phase`. **Sync:** phones send `blast:true/false` edges; server ticks at 20Hz as the single source of truth — integrating each blaster's partyPct, scanning adjacency pairs for simultaneous-loud, and adjusting `complaint`. Server broadcasts only public state (partyPct per unit + complaint level); it never leaks who is blasting. **Genuinely hard part:** fairness under phone latency — a player who releases BLAST 150ms late shouldn't be blamed for an overlap they thought they'd avoided; the server timestamps edges against measured RTT and applies a short grace window before counting a collision.

## v1 scope
- 3 players, apartments in a line (2 is adjacent to both 1 and 3).
- One 90-second round, one win/lose screen.
- Hold-to-blast, one Party Bar each, one Complaint Meter with fixed rise/decay.
- Fixed graph; no lobby polish.

## Out of scope
- Larger/random graphs, rounds, scoring, cosmetics.
- Real audio output; the "music" is abstract.
- Reconnect handling beyond a rejoin.

## Risks & unknowns
- Tuning the rise/decay so a 3-player line is winnable but tense.
- Whether local-only neighbor knowledge is legible enough to feel fair, not random.
- Latency-grace could be exploited by spamming the button.

## Done means
Three phones join a hosted room; each sees only its own neighbors and bar; holding BLAST fills that bar and, when two adjacent phones hold simultaneously, the shared Complaint Meter visibly spikes; maxing it evicts everyone, and filling all three bars first shows a win — verified end-to-end on real phones.
