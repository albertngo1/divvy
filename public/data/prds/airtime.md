## Overview
Airtime is a cooperative radio-discipline game for 3-4 players. The host TV is a single open channel; each player's phone holds a private queue of messages of varying priority that must all be transmitted before a shared deadline. Only one voice fits on the channel at a time. It's for groups who love Spaceteam's panic but want the specific, hilarious tension of a shared radio net — the etiquette of yielding, the pain of two people keying up at once.

## Problem
Party games rarely capture radio discipline: the shared net where everyone has something urgent and there is precisely one slot to say it. Spaceteam is undirected chaos; Airtime is chaos with turn-taking. The itch is the yield — 'go ahead… no, YOU go' — and the sting of two people transmitting at once and losing both.

## How it works
PRIVATE (each phone): your Traffic Queue — 3-5 message cards, each with text ('Reactor at 80%') and a priority tag (CRITICAL or ROUTINE), some with their own countdown. A big PUSH-TO-TALK button. A channel indicator: OPEN or BUSY (and who holds it).
SHARED (host TV): the live channel — who currently holds it, a waveform/mic meter, the global mission timer, and a scoreboard of CRITICALs transmitted vs. dropped. An overlap detector: if two players key up inside a short window, the TV flashes JAMMED and both transmissions fail.
LOOP: hold PTT (server grants only if OPEN), read your card aloud, release. Everyone else hears it and sees BUSY. You must verbally negotiate priority — 'hold, I've got a critical' — because CRITICALs left un-sent at the deadline lose the round, while ROUTINE can be sacrificed. Jams burn precious airtime. Win = every CRITICAL transmitted before the timer.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / one Durable Object per room, or Socket.IO over Tailscale Serve). Data model: Room {channelHolder, timer, jams}; Player {id, queue:[{id,text,priority,sent}]}. Channel arbitration: PTT-down sends a grant request; server atomically assigns the holder if free, else denies (phone buzzes 'busy'). Release frees it. Overlap: because the server serializes grants, near-simultaneous keys are resolved by arrival order plus a ~150ms guard — a second grant landing inside the guard marks JAM and rejects both. The genuinely hard part is making 'who got the channel' feel FAIR under variable phone latency: measure per-client RTT at join, normalize PTT timestamps against it, and tune the guard window so honest yields aren't punished as talk-overs.

## v1 scope
- 3 players, one 90-second round.
- Each phone: 3 cards (2 ROUTINE, 1 CRITICAL).
- PTT grant/deny + BUSY indicator + JAM flash on overlap.
- Win/lose purely on CRITICALs transmitted before the timer.
- No mic capture — PTT plus reading aloud is enough.

## Out of scope
Speech recognition or content verification, message scoring, extra roles, reconnection, multiple rounds, spectators.

## Risks & unknowns
- Without mic verification a player could skip reading — but it's cooperative, so social pressure covers it.
- Guard-window tuning: too tight feels like unfair jams, too loose lets talk-over slide.
- Fun leans on punchy card writing and priority pacing.

## Done means
Three phones join a room, each sees its own private queue; only one PTT can hold the channel at a time; a deliberate double-key produces a JAM on the TV; transmitting all CRITICALs before the timer shows WIN, otherwise LOSE.
