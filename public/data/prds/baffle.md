## Overview
Baffle is a cooperative timing game for 3–5 players in one room. The team shares a single 'noise ceiling' that must not overflow, yet each player is privately assigned sounds they MUST make on cue. The wicked catch: the only way to coordinate — talking — is itself noise that drains the shared budget and jams the mics. It's for groups who love Spaceteam-style overload but want silence, not shouting, to be the skill.

## Problem
Every co-op party game rewards the loudest, fastest talker. Baffle inverts it: the theme (reward silence, punish talking) becomes the core constraint, because the resource you're protecting is quiet itself. You have to build shared timing out of nothing but a bar on a TV.

## How it works
The host TV shows ONE shared 'noise ceiling' bar filling toward a red line, plus a single dot that lights when ANYONE in the room is currently making a verified sound. That's all the shared information — no names, no queues.

Each PHONE privately shows its own task queue: timed sound-orders like 'say RED (window: next 6s),' 'clap twice,' 'hum for 2s,' each with a shrinking deadline ring. Completing your sound — verified by YOUR phone's own mic — scores a team point and adds a chunk to the shared ceiling. But if two players sound at the SAME time, the mics catch crosstalk, both tasks fail, and the collision spikes the ceiling hard. So the room must perform one-at-a-time, self-organizing purely by watching the shared 'someone's sounding now' dot and the ceiling's rate of rise. Any attempt to talk it out ('you go first!') registers as unbudgeted noise, fills the ceiling, and muddies detection. Success is a room that looks like a séance and sounds like a metronome.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Each phone runs local mic detection (Web Audio `AnalyserNode` for claps/hums by energy envelope; on-device Web Speech for the one assigned word). Phones emit `{playerId, taskId, event:'soundStart'|'soundEnd'|'complete', t}`. Server data model: `Round { ceiling, ceilingMax, activeSounder: playerId|null, tasks: [{id, playerId, type, windowStart, windowEnd, done}] }`. Sync: server holds `activeSounder` as a lock; a `soundStart` that arrives while the lock is held → COLLISION for both. Genuinely hard part: collision detection across independent mics with network jitter — a clean sequential pass can look overlapping if `soundEnd` lags. Solved with a ~250ms guard window and server-side timestamp reconciliation, plus broadcasting the shared dot at ~15Hz so players SEE the coast clear.

## v1 scope
- 1 round, 60s, 3–4 players
- 3 sound types: say-a-word / clap / hum
- One shared ceiling + one 'someone's sounding' dot
- Win if team clears N tasks without overflow

## Out of scope
- Difficulty ramps, multiple rounds, scoring history
- Fancy sound classification (drums, whistles)
- Reconnect/late-join handling

## Risks & unknowns
- Cross-mic collision detection under jitter is the make-or-break
- Hum/clap detection thresholds vary by phone and room
- Players may find a talk-based cheat that outweighs the budget cost

## Done means
Four phones in one room; each shows a private timed sound-queue, the shared ceiling and dot update within ~200ms, two overlapping sounds are flagged as a collision that spikes the bar, and a clean one-at-a-time run of N tasks triggers the team-win screen — with zero spoken coordination.
