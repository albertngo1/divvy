## Overview
Slow Push is a 3-player cooperative crisis game lasting one three-minute round. The room is keeping one patient alive through a single-lumen IV line. Each player monitors a different vital sign that only their phone can see, holds a different set of single-use drugs, and shares one line that can safely carry one push every six seconds.

## Problem
Co-op medical panic games usually give everyone the same dashboard, so the game becomes reflexes. And most collision games let you dodge collisions by picking a different target. Here there is only one target — the line — so timing is the only axis, and the reason you mistime it is that you genuinely cannot see why your teammate thinks their push is urgent.

## How it works
**Host screen (shared):** the patient — a face that goes grey or flushed, a heartbeat tone whose roughness tracks overall badness — plus a single lamp: **LINE CLEAR**. The lamp goes dark the instant any drug enters the line and relights six seconds later. It never previews; you learn the window has opened only after it is too late.

**Each phone (private):** one live vital trace and nothing else. Player A sees blood pressure. Player B sees oxygen saturation. Player C sees rhythm. Below the trace: three syringes, single-use, with an effect table printed only on that phone — every drug helps one vital and hurts the other two, so no drug is knowable as "right" without hearing the other two traces described aloud.

**The push:** tap-and-hold a syringe for 1.5s to push. The drug's effect appears on the relevant trace after a randomized 8–12 second private delay, so you cannot confirm your own push worked. That delay is the engine of failure: you assume it didn't land, you reach for a second syringe, and you meet a teammate in the tubing.

**Collision:** two pushes inside six seconds precipitate. Both drugs are destroyed — permanently, they were single-use — the patient deteriorates on all three vitals, and the line locks for a punitive ten-second flush while everyone watches.

The room therefore has to run a spoken queue ("BP is tanking, I'm pushing on your mark") while three separate crises are peaking on three screens nobody else can read. Win: all three vitals in band simultaneously for 20 seconds before the clock ends.

## Technical approach
Host tab + phone PWAs + authoritative Socket.IO server over Tailscale Serve, one room object.

State: `{ vitals: {bp, spo2, rhythm} (0–100 each), lineBusyUntil: ts, drugs: {playerId: [{id, effects:{bp,spo2,rhythm}, used}]}, pending: [{drugId, landsAt}] }`. The server ticks vitals at 10Hz with a per-vital drift toward badness plus scripted crisis events; phones subscribe only to their own vital channel and their own drug list, so private state is enforced server-side, not by UI hiding.

Pushes carry RTT-corrected client timestamps (5-sample offset handshake at join) and are resolved in a 250ms sorted buffer. The genuinely hard part is that a collision must feel *fair*: the server needs to prove ordering, so the end-of-round debrief replays a timeline of every push with corrected timestamps and marks which pair collided and by how many milliseconds.

## v1 scope
- 3 players, one 3-minute round, 3 vitals, 3 drugs each, one scripted crisis sequence.
- Fixed 6s interaction window, fixed 10s penalty flush.
- TV: patient color, heartbeat tone, LINE CLEAR lamp, win/lose card, push timeline replay.
- Phone: one trace, three syringes, effect table.

## Out of scope
- 4+ players, drug restocking, multiple patients, difficulty tiers, voice detection, any real clinical accuracy.

## Risks & unknowns
- Medical framing may read as grim rather than farcical; a mild art-direction shift (veterinary, or a robot) is the fallback.
- The randomized effect delay may feel like noise rather than tension if the range is too wide.
- Three private traces may exceed what a room can verbalize, producing helpless flailing instead of triage; tune by slowing drift, not by revealing vitals.

## Done means
Three phones join; each sees only its own vital and drug list; a single push visibly moves the correct trace after its delay and darkens LINE CLEAR for 6s; two pushes inside the window destroy both drugs, worsen all three vitals, and produce a millisecond-accurate collision replay on the TV; holding all three vitals in band for 20 consecutive seconds ends the round in a win.
