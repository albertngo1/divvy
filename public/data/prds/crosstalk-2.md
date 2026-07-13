## Overview
Crosstalk is a 3-5 player concurrent-room game framed as a chaotic live panel show. The host TV is the broadcast feed; each phone is a private guest mic with a secret line to deliver. Everyone is desperate to talk, and that eagerness is the whole trap — the show only airs cleanly if you never step on each other.

## Problem
Every group has that dynamic where the instant there's a gap, two people jump in and both retreat. Crosstalk weaponizes it. The failure mode isn't silence, it's the human reflex to fill silence simultaneously. No turn order is given; coordinating your entrance with someone else's is precisely what blows the take.

## How it works
A single 45-second broadcast window. Each phone PRIVATELY shows one secret line the player must say out loud during the window — e.g. 'work the word *quarterly* into a sentence', 'compliment the weather'. To speak, you hold a big push-to-talk button on your phone; while held, your colored segment lights the host's on-air bar and your live mic feeds the broadcast for comedy.

The server watches who is holding PTT:
- Exactly one holder → clean air, that guest is 'on', and when they release, a quick self-tap confirms 'line delivered'.
- Two or more holders overlapping → CROSSTALK. The host feed garbles, a red collision flashes, and BOTH overlapping guests have their line marked undelivered again (they must re-attempt later).
- Too long with nobody holding → a 'DEAD AIR' meter climbs and, if it fills, the room loses.

Your phone shows only your secret line, your own mic level, and your PTT. The host TV shows the shared on-air bar, the dead-air meter, collision flashes, and a lit checkmark per guest as lines land — never who still has a line pending or when anyone intends to jump. The room wins if all lines are delivered before the window ends without the dead-air meter maxing.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve). Data model: `players: {id, color, secretLine, lineDelivered, pttHeld}`, `airState`, `deadAirMs`, `collisionCount`. Sync: phones emit `pttDown`/`pttUp`; the DO maintains an authoritative set of current holders and, whenever `|holders| >= 2`, fires a collision and resets those players' `lineDelivered`. Mic audio is a secondary WebRTC/opus stream mixed into the host purely for flavor — the authoritative collision signal is PTT state, so room mic-bleed never causes false positives. Hard part: sub-200ms PTT edge sync so a true simultaneous grab is judged fairly across phones with varying latency; timestamp PTT events client-side and reconcile in a short server window.

## v1 scope
- 3 players, one 45s window, one round
- One secret line per player from a fixed deck of ~20
- PTT-based collision + dead-air lose condition; mic mixing optional
- Host: on-air bar, dead-air meter, per-guest checkmarks

## Out of scope
- Automatic speech verification that the line was actually said
- Scoring, multiple rounds, judges, audience voting
- Full duplex voice quality / noise suppression

## Risks & unknowns
Honesty of the 'line delivered' self-tap is unverified in v1. Latency reconciliation for near-simultaneous grabs needs real-device testing.

## Done means
3 phones join, each privately gets a distinct line, overlapping PTT holds reliably trigger a visible garble-and-reset on the host, and delivering all three lines cleanly before the dead-air meter fills shows a win screen.
