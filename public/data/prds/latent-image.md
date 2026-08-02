## Overview

A 3-4 player cooperative one-round game, ~4 minutes, for groups that enjoy inventing a protocol under pressure. Each phone holds a private clue rendered as a darkroom plate. Room noise fogs plates irreversibly. The room has to schedule quiet windows for people who cannot ask for them.

## Problem

Most silence games punish talking with points, which is abstract — players discount it. The itch: make noise destroy something the room can *watch* being destroyed, and make the need for silence privately asymmetric, so "everybody be quiet" is never the right instruction.

## How it works

The TV shows a lock with four empty slots. Each phone privately shows one **Plate** — a canvas-rendered clue (a symbol and a word) that must be read and then spoken aloud to fill slots. But every plate accumulates **fog** proportional to live room loudness above a floor, scaled by that player's private **fragility** coefficient (dealt in a 4× spread; you see yours, nobody else's). At 100% fog the plate is ruined for the round — that player is permanently mute-useful, and the room may not be able to finish.

The escape valve is the **Shutter**: your phone has one big button that closes your plate. Closed plates take no fog — but you cannot read yours while it is shut. Fog decays slowly, but only during genuine silence.

The emergent protocol, which the game never explains: everyone shutters, one player opens, the room goes dead quiet while they read, they shutter, and only then does anyone speak. The tension is that a fragile player needs a longer quiet window than a robust one, and asking for it costs them fog.

Private on each phone: the plate, its live fog %, your fragility, your shutter. Public on the TV: the lock, a room-noise bar, and **the number of plates currently open — a count with no names**. That count is the room's only legitimate shush signal, and it is anonymous by construction.

## Technical approach

Host tab + phone PWAs + Cloudflare Durable Object (or PartyKit) as the authority. Phones compute A-weighted RMS in an AudioWorklet at 20 Hz and stream a single byte per frame; no audio leaves the device.

The server takes the **median** across phones as room level — this rejects one bad mic, one pocketed phone, and one player breathing on their own capsule, which a mean or a max cannot. Fog integrates server-side at 10 Hz: `fog_i += k_i * max(0, dB_room - floor) * dt` when open. Clients interpolate toward the server value and render fog as progressive gaussian blur plus film grain over the plate canvas.

Data model: `Player{id, plateId, k, fog, open}`, `Room{lockSlots[4], dbHistory}`.

The hard part is perceived fairness of an irreversible destructive mechanic: a mic glitch that ruins a plate ends the game unjustly. Mitigations: 200 ms grace before fog starts, a hard cap on per-tick fog, and an on-screen cause line ("fogging: room at 68 dB") so blame is legible in real time.

## v1 scope

- 3 players, one 4-minute round, one hand-authored lock and three plates
- Fragility dealt from a fixed triple (0.5×, 1×, 2×)
- Shutter button, open-plate count on TV, room noise bar
- Win/lose screen showing each plate's final fog

## Out of scope

Multiple rounds, plate variety, ASR verification of spoken clues, reconnect-safe fog state, headphones.

## Risks & unknowns

Blur may read as "broken screen" rather than "you did this." Rooms with a loud HVAC baseline need the floor auto-calibrated from 3 seconds of pre-round silence. The protocol may be discovered in 30 seconds, making round two trivial.

## Done means

Three phones and a TV: plates visibly fog within 2 seconds of someone talking, shuttered plates provably do not, the TV's open-count updates in under 200 ms, and a test group finishes the lock at least once without being told the shutter protocol.
