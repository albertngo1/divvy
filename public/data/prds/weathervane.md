## Overview
Weathervane is a consensus-guessing party game for 3-6 people sitting in a rough circle. Each round a prompt appears ("Who'd survive a zombie outbreak?"), and every player privately turns their body to physically aim their phone at the person they think the *group* will most aim at. Points go to matching the plurality — a physical Herd Mentality where the aiming itself is the tension.

## Problem
Herd-mentality voting games are fun but flat: you tap a name and wait. The itch: make the vote a *body*. When you have to turn and point a real device across a real circle, everyone can half-see which way the room is leaning — but never confirm it, because a compass bearing is silent and private until reveal.

## How it works
Setup: a 20-second round-robin calibration. The host names each player in turn; everyone points at that person and locks, and the server triangulates each player's seat position from the collected bearings. This makes the room the board.

Each round the HOST shows the prompt only. Each phone PRIVATELY shows a compass rose and a big LOCK button; you rotate your whole body to aim, and only you see your live bearing and which seat it's resolving to. Nobody sees your target. When all lock (or a timer expires), the host explodes into a starburst — one arrow per seat — and lights the plurality target. You score if your arrow hit that target. The comedy is watching people fake-hesitate, over-rotate, or all swing toward the same victim at once.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Sensor: deviceorientation `alpha` (magnetometer heading). Data model: Player{seatAngle, heading, lockedTargetId}, Round{prompt, locks, plurality}. During play the phone streams heading; the server maps heading→nearest seat using the calibrated seat angles and only reveals `lockedTargetId` after all lock. Sync: headings at ~15Hz for the private rose; locks are committed events; reveal is one atomic host broadcast. The genuinely hard part is the bearing→player mapping: absolute compass heading plus each player's calibrated seat angle must resolve reliably despite indoor magnetic distortion and phones held at odd tilts — needs the round-robin triangulation plus a tilt-compensation step and a generous angular tolerance so adjacent seats don't cross-trigger.

## v1 scope
- 3-4 players in a circle
- Round-robin seat calibration
- One prompt, one simultaneous locked aim, one plurality reveal
- Compass rose + lock + host starburst

## Out of scope
- Scoring across many rounds, prompt packs
- Moving seats mid-game / re-calibration
- Teams, wagers, elimination

## Risks & unknowns
- Indoor magnetometer distortion may make adjacent seats ambiguous
- Tight circles = small angular gaps between targets
- Needs enough physical spacing to disambiguate; may cap players by room size

## Done means
Four people in a circle calibrate seats in one pass, each privately aims at a chosen person, and on reveal the host correctly shows each player's targeted seat and the true plurality — with adjacent-seat mis-resolves under ~10% in a normal living room.
