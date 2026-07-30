## Overview
Take the Watch is a four-player co-op escape. At any instant exactly one phone renders the live board, and that phone's owner is frozen in place while they hold it. Everyone else is mobile and blind, working from a snapshot of the board taken the last time *they* held the watch — a snapshot that fogs over as it ages. Four players, four different stale truths, one exit.

## Problem
Give one person the map and they become a permanent narrator; the other three become hands. Take the map away from them on a timer and something better happens — everyone has been the map-holder, everyone remembers a different moment of the board, and the group has to reconcile four out-of-date pictures out loud while the board keeps moving.

## How it works
8×8 board, one exit, and a **Sweeper** that walks a fixed 12-tile loop one tile every 4 seconds, freezing anyone it touches for 8 seconds.

- **Watch-holder's phone (private):** the live board, everything, updating. Their own token cannot move — inputs are refused.
- **Everyone else's phone (private):** their frozen snapshot from their last handoff, under a gray fog that grows to fully opaque over 25 seconds. Plus a d-pad and the list of teammates.
- **Host TV (public):** the exit, how many players have reached it, the shared watch battery, who holds the watch, and a red pulse when the Sweeper catches someone. Never the board.

**Battery:** the watch drains 1s/second while held and recharges at 0.5s/second in someone else's hands. 60 seconds of live viewing exist for the whole round, and a single hold caps at 20 seconds. The map *must* circulate — and it circulates through people who then go blind again carrying fresh knowledge.

**Handoff:** the holder taps a teammate to offer; they accept with one tap; transfer is instant. The moment you release, your screen freezes to the last server frame and starts fogging.

The endgame knot: the last player still stranded is the one who most needs the map, which means someone already safe on the exit has to take the watch and talk them out. Whoever holds the watch at the end is never the one who needs it.

Win: all four on the exit before the battery hits zero.

## Technical approach
One Durable Object per room. Authoritative state: board, sweeper phase, positions, `watchHolder`, `batteryMs`, `snapshots: {playerId → {frame, takenAtTick}}`. Views: `/watch` gets full live state at 10Hz, `/blind` gets only your own snapshot payload and your own frozen status, `/public` gets counts and battery. Snapshots are server-rendered state objects stamped at the handoff tick — never client screenshots — so the fog schedule is server-timed and identical for everyone.

Hard part: handoff races and the freeze invariant. Overlapping offers, or a handoff landing on the same tick as a Sweeper collision, must resolve deterministically, so the DO serializes every transfer. And immobility must be enforced server-side — dropping the holder's move inputs, not merely hiding the d-pad — or the honest players get punished by the impatient one. The unfixable leak is the OS screenshot; the answer is design, not code: the Sweeper moves, so a 40-second-old frame is actively misleading rather than merely stale.

## v1 scope
- 4 players, one hand-authored 8×8 board, one exit.
- One Sweeper, fixed loop, no variants.
- One round, 60s battery, then a win/lose card.
- Fog is a single linear gray overlay, 0→100% over 25s. No per-cell fog.
- Tap-to-offer, tap-to-accept, no cooldown, no decline UI.

## Out of scope
Multiple rounds, procgen, a second hazard, spectators, reconnect, probabilistic or per-cell fog, voice features, persistent scoring.

## Risks & unknowns
- Watch-hogging: is a 20s hold cap plus drain enough, or does it need forced rotation?
- 25s of fog may be too fast to be useful or too slow to bite.
- Do players actually consult their fogged snapshot, or just shout "where am I"? If the snapshot goes unread the entire conceit fails — this is the primary playtest question.
- Frozen-while-holding may read as a penalty rather than a role.

## Done means
Four phones in a room: every player holds the watch at least once, all four phones show visibly different fogged snapshots at the same instant, the holder's d-pad is refused by the server, and a round ends with the last stranded player being walked out by a teammate who took the watch while standing on the exit. The TV never renders a board.
