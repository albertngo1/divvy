## Overview

A 90-second cooperative panic machine for 4-5 people in one room, in the Spaceteam lineage. Every player's phone holds an irrevocable queued action; every player's phone also shows a *different* player's countdown. Nobody holds both halves of any fact. The only wire between the halves is shouting.

## Problem

Spaceteam-likes make you shout, but the shouting is a lookup: I read a label, you find it. That's a race, not a negotiation. The itch here is *scheduling* — the specific comedy of two people discovering, one second too late, that they were both about to use the crane. Nothing in the party-game shelf makes the room manage a shared calendar at 1Hz with their mouths.

## How it works

The host screen shows four MACHINES (Crane, Kiln, Winch, Vent), a hull bar with 3 pips, and a round clock. It shows no timers and no names — it is deliberately almost useless, a scoreboard and nothing more.

Each phone privately shows two things:

1. **Your job**: "You will use the KILN." Plus one HOLD button, worth +6 seconds, usable once per round. That's it. No countdown. You cannot cancel, you cannot re-target.
2. **Your window**: a live countdown belonging to the player on your left — labeled with their name, e.g. "MAYA — 7… 6… 5…" — with no indication of which machine Maya is about to hit.

So Maya knows she's about to hit the Kiln; you know Maya has five seconds; and the person on *your* right is the only one who can tell you that you have nine. Coordination is a forced two-person merge, spoken, in public, while three other merges are happening over the top of it.

When a countdown hits zero the action fires. If two actions fire on the same machine within 2 seconds of each other, the hull loses a pip and the host screen flashes the machine name — the room learns *what* collided but must reconstruct *who* by talking. Firing cleanly refills your phone with a new job and a new countdown (8-14s), and re-points your window at a new neighbor, so the ring rotates and the room never settles into a stable pairing.

Holds are the only lever, they are scarce, and spending one shoves you into somebody else's slot — the classic "fixed it onto Dave" failure.

## Technical approach

Host browser tab + phone PWAs + PartyKit Durable Object as the authority. Room state: `{players:[{id,name,job,fireAt,holdUsed,watching}], machines:{name:[lastFireTs]}, hull, roundEndsAt}`.

The server owns all clocks. Phones never compute a countdown from local time; they render `fireAt - serverNow`, where `serverNow` is maintained by a lightweight NTP-ish offset handshake (four round trips at join, median offset, re-synced every 10s). Server ticks collision resolution at 20Hz and broadcasts a delta frame at 10Hz.

The genuinely hard part is that *the countdown displayed on my phone is the ground truth for someone else's fate*. A 400ms wifi hitch on my device makes me shout a wrong number, and the player is punished for my lag. So: countdowns must render from interpolated local clocks between frames (never freeze on the last frame), and any phone whose offset confidence degrades past ~250ms must visibly gray out its window rather than lie. A gray window is a legitimate game state — "my window's dead, someone read Maya for me."

## v1 scope

- One 90-second round, 4 players, fixed 4 machines
- Server-assigned jobs and countdowns; no difficulty curve
- One HOLD charge per player per round
- Ring rotates on each clean fire
- Host screen: hull pips, clock, collision flash. Nothing else
- Win = finish with ≥1 hull pip

## Out of scope

Scoring/leaderboards, more than one round, machine-specific rules, sound design, remote play, spectators, reconnect-mid-round, >5 players.

## Risks & unknowns

- The ring may be too legible: with 4 players the room may fall into a stable "I read you, you read me" rhythm. Rotation on fire is the mitigation; may need randomized re-pointing.
- 2-second collision window may be too forgiving (nothing ever breaks) or too tight (nothing ever works). Needs playtest tuning, probably per-machine.
- Reading a number aloud takes ~1s; if countdowns are too short the information is stale before it lands.

## Done means

Four phones on one wifi, one laptop on a TV. A round runs to completion with all four countdowns visibly agreeing within 200ms of the host's clock. A deliberate double-book on the Crane costs exactly one hull pip and flashes "CRANE" without naming anyone. Playtesters shout names and numbers unprompted, and at least one group finishes a round arguing about whose hold caused the last crash.
