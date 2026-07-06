## Overview
Roll Call is a cooperative-competitive real-time voice scramble for 4–6 players: shared TV + everyone's phones. For groups who want the "wait — is that ME?" panic of a substitute teacher butchering the attendance sheet.

## Problem
Reaction party games are anonymous — everyone races the same buzzer. The itch: a summons where whether it's YOUR turn is *private* knowledge, so the room has to sort itself out loud, right now, and it's your own private state that tells you to speak up.

## How it works
Each phone privately holds a small secret inventory (e.g., you hold the CROWN and the ANCHOR; your neighbor also holds the CROWN — overlaps are deliberate). The host screen calls a summons: "Whoever holds the ANCHOR — sound off!" Your phone never buzzes; you must realize from your private inventory that it's you, shout your callsign aloud, and tap "Here." Exactly one match = success. But inventories overlap and summonses keep coming, so sometimes two people both think they're up (collision — they must verbally yield in a heartbeat) and sometimes the real holder doesn't notice (silence — timeout fail). The room's whole job is to keep the sound-offs clean and fast; voice is how you claim and yield the floor.

Private per phone: your secret inventory and a "Here" button. Shared host screen: the current summons, a health/streak bar, and collision/silence flashes — never who holds what.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit DO or Socket.IO/Tailscale). Data model: `Room { players[{id, inventory:Set}], activeSummons[{id, attribute, deadline}], health }`. The server deals overlapping inventories at start, emits a summons on a tick, and each phone receives only its own inventory. On "Here," the phone sends `{playerId, summonId, t}`; the server checks membership and counts claims within the window: one valid → advance; two+ → collision; zero by deadline → silence. Hard part: real-time adjudication of near-simultaneous claims under network jitter — the collision window must feel fair when two taps land 80ms apart over flaky phone Wi-Fi, so use server timestamps plus a small grace buffer, never client clocks.

## v1 scope
- 4 players, a single summons at a time (no overlap yet), one 60s round.
- Each phone holds 2 items from a 4-item pool; server guarantees ≥1 overlap.
- Host shows one summons, a 3-life health bar, timer, win/lose.

## Out of scope
- Overlapping concurrent summonses, relational summonses ("left of the crown"), scoring beyond lives, custom packs, reconnects, ASR.

## Risks & unknowns
- With one summons at a time, is it too easy? Overlap frequency is the tuning knob.
- Does the tap make voice vestigial? May need to require the spoken callsign, judged by the room.
- Collision-window fairness over Wi-Fi.

## Done means
4 phones each hold a private 2-item inventory; a summons on the TV is answered by the correct single player within the window (advancing the health bar), a forced double-claim shows a collision flash, and a timeout shows a silence flash — all adjudicated server-side.
