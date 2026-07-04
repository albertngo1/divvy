## Overview

A per-phone reimagining of the tabletop game *Two Rooms and a Boom*. Players are randomly split into two "virtual rooms" by their phones — even if they're all physically in the same living room. Each room gets its own set of hidden roles and objectives. Between rounds, the two rooms may exchange exactly one short message — negotiated internally, transmitted server-side. Per-phone is the whole conceit: the phone *is* the room boundary, and no one outside your room sees your screen.

## Problem

Two Rooms and a Boom is a brilliant social deduction game — but it requires two physical rooms, a designated hostage-swap negotiator, timers, and a bunch of card management. A per-phone digital version could preserve the "hidden information across a wall" core mechanic while removing all the logistical friction. There's no existing digital adaptation that treats the phone itself as the wall between rooms.

## How it works

Room code join, 6-12 players. Server splits players into Room A and Room B, assigns each a hidden role (President, Bomber, Doctor, Engineer, Civilian, etc.). Each phone shows only that player's own role and their room membership. Within a room, players can freely talk face-to-face — since they're not looking at each other's phones, they must verbally negotiate what to reveal. Each round (there are 3), each room privately votes on ONE message to send to the other room (free-text, capped at 40 characters). Server delivers messages simultaneously at round end. After round 3, each room votes on who they think holds the key role in the OTHER room. Win conditions depend on role card matchups (President + Bomber = boom, etc.).

## Technical approach

PartyKit / Socket.IO. Room state = `{players: [{id, room, role, revealed_to}], round, messages: {A_to_B, B_to_A}, votes}`. Each phone gets a personalized snapshot with ONLY their own role visible plus their room membership. Message composition is a small in-room voting flow: any player types a draft, all room members thumbs-up/down, top vote sends. LLM Haiku optional for a "flavor text" wrapper around role reveals ("The President straightens their tie...") but not required for gameplay. No mic, no sensors.

## v1 scope

6-8 players, 3 rounds, fixed role set (President, Bomber, 4-6 Civilians), one message per round per room (40 chars), simple end-game vote on "who is the Bomber in the other room," win = correct guess OR President and Bomber end up in different rooms at the end (a role-swap mechanic can wait). No timers beyond a soft round clock.

## Out of scope

Full 15-role card set (Doctor, Engineer, Spy, Gambler, etc.), hostage-swap mechanic (physical role trading between rooms), timed rounds, spectator mode, LLM-generated role variants, more than 2 rooms, custom win conditions, replay/history.

## Risks & unknowns

The game depends heavily on players understanding hidden-role social deduction — new-player onboarding is the biggest lever, and *Two Rooms and a Boom* is notoriously tricky to teach. A 40-char message may be too tight — could be 140. The negotiation-within-a-room step (voting on what to send) could be tedious; a "team leader" role that just picks might be better. Whether physically-same-room "virtual rooms" feel real or feel silly is the core UX bet.

## Done means

Six friends sitting in one living room, split by phone into two "rooms," end up whispering intensely across the couch trying to figure out what to send the other side. At least one round ends in a hilariously misleading 40-character message. If the President and Bomber are in the same room and everyone yells "boom!" v1 shipped.
