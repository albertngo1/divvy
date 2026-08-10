## Overview

**Edition of One** is a cooperative making-game for 3–5 players. The room collaboratively tunes a generative print. The catch: the finished image is never displayed anywhere until it is signed, and each player can only observe it through a private keyhole — a fixed 15% crop shown on their own phone. You describe what you see, argue about what to change, and eventually commit your signature to an artifact you have only ever seen a fifth of. Then the TV renders it full-bleed, once, and every phone gets the file.

For people who want a game night to leave something on the wall.

## Problem

Collaborative drawing games are either turn-taking (slow, one-phone-shaped) or free-for-all (mush). And party games end with a winner, not an object. The itch: make five people genuinely negotiate over an aesthetic they can't jointly perceive.

## How it works

One round, ~8 minutes.

**Each phone privately shows:** (1) one continuous parameter slider with a plain-language label — `DENSITY`, `WARMTH`, `TILT`, `NOISE`, `WEIGHT`; (2) a live 15% crop of the canvas at a fixed, randomly assigned location; (3) a SIGN button. Crucially, your crop is deliberately assigned *away* from the region your parameter most affects, so you are always tuning by other people's reports.

**The host screen shows:** nothing legible — a heavy 40px blur of the canvas plus a 5-bar color histogram, five anonymous "adjusting / still" lamps, and a signature counter (`2 / 5`). Enough to feel the room's activity, never enough to see the print.

Sliders are live and simultaneous; the server re-renders the seeded generative composition at 4fps and pushes each phone only its own crop. Talking is the whole game ("mine went muddy, whoever just moved, back off"). SIGN is irreversible. When the fifth signature lands, everything freezes, the TV renders the full 2000px image with all five names in the margin, and a QR delivers the PNG. If anyone quits before five signatures, no file exists.

## Technical approach

Host tab, phone PWAs, one PartyKit Durable Object per room.

**Data model:** `Canvas { seed, params: {playerId → float 0..1}, version }`; `Player { paramKey, cropRect, signed: bool }`. The DO is authoritative for `params` and monotonic `version`.

**Rendering:** the DO holds no canvas — the *host tab* renders the full composition offscreen each tick and slices five crops, encoding each as a ~12KB WebP pushed to its owner. Phones are pure displays; they never render the generator, so no phone can reconstruct the whole.

**Sync:** slider input is throttled to 10Hz per phone, last-write-wins per parameter (no conflicts — each player owns exactly one key). The hard part is latency under five concurrent live sliders: crop frames must land under ~250ms or the loop between "I moved" and "the crop changed" breaks and people stop believing they control anything. Mitigations: WebP quality 60, drop-frame-on-backpressure per socket, and an immediate local shimmer on the slider so the phone feels responsive while the true frame is in flight.

## v1 scope

- 3 players, 3 parameters, one hardcoded generator (flow field + palette ramp)
- Fixed crop assignment, no reroll
- SIGN is one tap, irreversible, no confirm dialog
- Reveal + QR download of a single PNG

## Out of scope

Undo, chat, multiple rounds, print-shop integration, player-chosen generators, saving to a gallery.

## Risks & unknowns

The generator must be *legible through a crop* — too abstract and nobody can describe anything; too literal and the crop gives the whole thing away. Signing may feel anticlimactic without stakes; may need a visible "first signer is the only one who can't change anything after" asymmetry. Five simultaneous sliders may just produce noise.

## Done means

Three people who have never seen the full canvas argue for six minutes, all sign, and each walks away with the same PNG on their phone — and at least one of them says it looks nothing like they expected.
