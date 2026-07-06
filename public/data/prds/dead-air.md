## Overview
Dead Air is a radio-net discipline party game for 3–6 players. The host TV is a single shared channel; every phone is a field radio holding private traffic that must be passed over that one channel before time runs out. The catch: only one person can transmit at a time.

## Problem
Voice party games collapse into everyone shouting simultaneously — the chaos is a bug they tolerate. Dead Air makes talking-over-each-other the explicit fail state, converting the room's natural cacophony into the actual puzzle: who talks, when, and how you hand off the floor by ear.

## How it works
The host TV shows the channel: a big VU needle of live activity, a running count of messages successfully logged, and a bleeding countdown. Each phone PRIVATELY shows a stack of message cards only that player can see (e.g. "PATROL 4, hold at the bridge"), a fat push-to-talk button, and that phone's own live mic meter.

To log a message: hold PTT and read the card aloud. The server logs it ONLY if exactly one phone is transmitting for the duration of the read. If two or more phones exceed the mic threshold at once → COLLISION: the host plays a squelch screech, both messages bounce back onto their owners' stacks. And if the channel sits silent too long → a dead-air penalty bleeds the timer faster. So players must negotiate the floor purely by voice — pausing, yielding, calling "go ahead" — to drain every private queue in time.

PRIVATE per phone: your card stack (its size and contents hidden from everyone), your mic meter, your PTT. SHARED on TV: the channel VU, the logged count, the timer, the collision screeches.

## Technical approach
Host browser tab + phone PWAs + an authoritative WebSocket server (PartyKit / a Durable Object, or Socket.IO over Tailscale Serve). Data model: Room { players[], channelState, loggedCount, timer, queues: per-player card stacks }. Each phone runs local WebAudio RMS on its mic and sends a lightweight { transmitting: bool, level } packet at ~10 Hz. The server keeps a sliding window: for each PTT read, if the transmitter count stays 1 for the read's duration → accept; if it ever hits ≥2 across overlapping reads → both collide.

The genuinely hard part is collision detection under network jitter AND mic bleed — a loud player leaks into a neighbor's mic. Mitigations: per-phone noise-floor calibration at start, gate level counting to only-while-PTT-held, and a short handoff debounce so brief overlaps don't false-trigger.

## v1 scope
- 3 players, one 90-second round
- Each phone gets a fixed queue of 3 cards (9 total)
- Server verifies single-transmitter only; verbatim reading is honor-system (no speech-to-text)
- One collision screech, one dead-air warning, win = drain all 9

## Out of scope
- STT verifying the actual words spoken
- Scoring, leaderboards, message priorities, jammer roles
- Reconnection, >1 round

## Risks & unknowns
- Mic bleed causing false collisions when players sit close
- Threshold calibration across wildly different phone mics
- PTT/network latency at the handoff moment
- Whether honor-system verbatim reading stays fun or invites mumbling to game it

## Done means
Three phones on the channel drain all nine private cards; a deliberate double-key reliably fires a collision + bounce on the host; a 5-second silence reliably triggers the dead-air warning; the round ends in a win the moment the 9th card logs.
