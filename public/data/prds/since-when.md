## Overview

A 4-player, 90-second cooperative shouting game for people who already love Spaceteam and want the failure mode to be *social* rather than *mechanical*. Everyone holds a private control panel. Instructions arrive on your phone for controls you almost never own. The wrinkle: ownership silently migrates mid-round, so the room's verbal map of "who has the Gorb" rots in real time and can only be repaired by saying it out loud.

## Problem

Spaceteam's difficulty curve is throughput — more instructions, less time. After three plays the room has learned the vocabulary and the game becomes typing speed. Nothing in it ever *invalidates knowledge the room already built*. The itch: a coordination game where the hard part is that what you correctly learned 20 seconds ago is now false, and the only repair channel is voice.

## How it works

Six control types exist (Gorb, Flange, Squelch, Mitre, Karn, Drip). Each is a toggle, a 3-position dial, or a slider. At any moment each control lives on exactly one phone.

**Private on each phone:** the 3–4 controls you currently own, live and interactive; plus one instruction card at a time ("Set the Flange to 2") which almost never refers to a control you own; plus a CONFIRM button.

**Shared host screen:** ship health, the run timer, the count of completed instructions, and a rolling ticker of *failed* actions ("Karn set to 3 — nobody asked for that"). It never shows ownership. Ownership exists only in the room's heads.

Every ~8 seconds the server moves one random control from one phone to another. The loser's control just vanishes from their screen. The gainer's just appears. No announcement, no host callout. Completion requires two people: the owner sets the value, and within 2 seconds the instruction-holder taps CONFIRM. So you cannot shout into the void — you need an answer back, which is what forces the re-inventory ("I've got the Flange now, say it again").

## Technical approach

Host browser tab + phone PWAs + one PartyKit Durable Object per room (or Socket.IO over Tailscale Serve for LAN play).

State: `controls[{id, type, label, value, ownerId, lease}]`, `instructions[{id, controlId, targetValue, holderId, issuedAt}]`, `players[{id, name, connected}]`.

Server is authoritative for ownership and value. Phones send `{setValue, controlId, lease}` intents; the server rejects any intent whose lease is stale and immediately pushes a `revoked` event so the phone greys the control out.

The genuinely hard part is migration racing interaction. A player's thumb is on the slider at the instant it reassigns. Fix: leases (monotonic int per control, bumped on every reassignment), optimistic local rendering with a 300 ms reconciliation window, and a hard rule that the reassignment tick never fires on a control touched in the last 800 ms — so the transfer feels arbitrary but never feels like a bug.

## v1 scope

- 4 players, exactly one 90-second round, no lobby customization
- 6 controls total, hardcoded labels, no procedural jargon generator
- One migration every 8 s, uniform random
- One instruction in flight per player
- Host screen: timer, completed count, fail ticker. Nothing else.

## Out of scope

Multiple rounds, difficulty ramp, sound design, spectator mode, reconnect handling, procedural label generation, scoring across sessions.

## Risks & unknowns

Migration may read as unfair rather than funny — mitigated by never migrating a just-touched control, and by making the gain visibly glow. Four players may be too few for ownership to get genuinely confusing; 5–6 might be the real floor. Confirm-within-2s may be too tight over cellular.

## Done means

Four phones on one room code complete a 90-second round; at least one control visibly changes hands mid-instruction; the host screen shows a nonzero completed count and at least one "nobody asked for that" fail; and in playtest someone shouts an instruction at a person who no longer owns the control.
