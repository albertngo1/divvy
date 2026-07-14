## Overview
Dimmer is a 3-player cooperative room game built on the phone's most ignored sensor: ambient light, read via rear-camera luminance. The room's actual lamps, windows, and dark corners are the board. Each player gets a *conflicting* private lighting goal — some must find brightness, some must find shadow — and since bodies cast shadows and block lamps, hitting all goals at once is a choreography problem you solve with your feet.

## Problem
Everyone measures sound and motion; nobody plays with light as terrain. A living room is secretly a rich brightness landscape — pools of lamp glare, penumbra behind the couch, a dim hallway mouth. Give each phone a private target band and the room becomes a contour map only your body can climb. One passed-around phone can't hold three different lighting states in three places simultaneously, which makes per-phone sensing the whole point.

## How it works
Each player is privately assigned a target **band**: BRIGHT (high luma), DARK (low luma), or DUSK (a narrow mid band). The phone reads rear-camera average luminance ~10×/s and privately shows a single vertical meter — your live level, your target zone, and a fill ring that charges while you're in-band.

PRIVATE per phone: your band label, your live luma meter, your in-band charge ring. SHARED host TV: three anonymized lock pips and a 60 s clock — never the bands, never who is bright or dark.

The cruelty: goals conflict and interact physically. The DARK player needs someone to block the lamp; the BRIGHT player needs the path to the lamp kept clear; the DUSK player is threading a razor between them. So players cluster to cast a shadow for one teammate, then peel away so they don't rob another's light — all while nobody can see anyone else's target, so you narrate and experiment. All three must hold their band simultaneously for 3 s to win.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{code, phase, deadline}`, `Player{id, band, inBandSince}`. Each phone runs `getUserMedia`, downsamples frames to a canvas, computes mean luma (0.299R+0.587G+0.114B), and normalizes against a 3 s calibration sample taken at start ("aim at the ceiling") so device/exposure differences wash out. Phone emits `state{inBand:bool}` on transitions; server tracks a rolling all-three-in-band window and fires `win` at 3 s sustained.

Genuinely hard part: camera auto-exposure fights you — it re-normalizes brightness, flattening the very signal you want. Mitigations: lock exposure/gain where the API permits, define bands relative to the calibration baseline rather than absolute lux, and widen bands to survive AE drift. Cross-device luma consistency is the real unknown.

## v1 scope
- 3 players, one round, 60 s timer.
- Three fixed bands (BRIGHT/DARK/DUSK), assigned once.
- Per-phone luma meter + charge ring; host shows 3 pips + clock.
- One calibration step, one win/lose screen.

## Out of scope
- 4+ players, multiple rounds, competitive scoring.
- Front-camera/selfie mode, hue targets, moving light cues.
- Reconnect handling and spectators.

## Risks & unknowns
- Camera auto-exposure defeating the signal (core technical risk).
- Rooms too uniformly lit to offer a real gradient — may require a single lamp setup.
- Holding a steady camera reading while shuffling around bodies.

## Done means
Three phones in a room with one lamp on: calibration levels the devices, each player can find and hold their assigned band, and there's at least one round where the DARK player only locks because a teammate physically stepped in to cast a shadow — all three pips hold 3 s and the host fires the win screen.
