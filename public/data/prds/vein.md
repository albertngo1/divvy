## Overview
Vein is a 3–4 player race that turns each phone into a live magnetometer and the whole room into a prospecting field. Every player gets a *different* secret clue naming a big metal object somewhere in the room (the radiator, the fridge, the laptop, the filing cabinet). First to physically 'stake' their object by hovering their phone over it wins. For anyone who has watched a metal detector hobbyist and thought 'that but as a race.'

## Problem
The magnetometer is in every phone and almost never used as anything but a compass needle. Its raw field magnitude is a genuine metal detector — ferrous mass warps the local field by tens to hundreds of µT — yet no party game exploits it. The itch: a treasure hunt where the treasure map lives *in the physics of the room*, not on a screen.

## How it works
Each phone PRIVATELY shows: (1) a one-line clue for its own secret object, and (2) a Geiger-style intensity dial reading live |B| (magnetometer magnitude) relative to that phone's calibrated baseline — a needle and rising click-rate as the field deviates. Players roam and sweep. Bringing the phone within ~10cm of their target's ferrous mass spikes |B| well above baseline; holding above a personal 'strike' threshold for 2s stakes the claim.

The shared HOST SCREEN shows only: anonymized claim lights (four dim lamps that flare when someone stakes), a countdown, and a live 'peak strength' leaderboard by color — never anyone's clue, target, or reading. So rivals see momentum but can't steal your object.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Phones read the magnetometer via the Magnetometer / DeviceOrientation absolute-field API at ~20Hz, compute magnitude, and stream a smoothed value + timestamp. Data model: `Room{players[], targets{playerId:objectId}, phase}`; per-player `{baseline, strikeThreshold, peak, claimed}`. Server validates strikes (threshold exceeded for 2s of contiguous samples) and broadcasts anonymized lamp/leaderboard state.

The genuinely hard part is per-device normalization. Phones have wildly different hard-iron offsets and baseline earth-field readings, and rotating the phone changes the field *vector* — so we key everything off *magnitude* (rotation-invariant) and a mandatory 15s calibration wave at start that samples ambient min/max to set each phone's baseline and adaptive threshold (e.g. baseline + 4σ). Motion artifacts and the phone's own speaker magnet are rejected with a median filter.

## v1 scope
- One 90-second round, 3 players, 3 pre-seeded room objects.
- Fixed clue list; host operator confirms objects exist before start.
- Magnitude-only detection, single strike threshold, first-to-stake wins.

## Out of scope
- Auto-detecting/registering room objects.
- Multi-round scoring, teams, decoy objects.
- Non-ferrous or weak targets.

## Risks & unknowns
- Some phones throttle/lack the magnetometer API (permissions, iOS quirks).
- Small objects give weak signal; needs playtesting to size 'big enough.'
- Self-report false strikes near *any* metal — clue specificity is the only guard.

## Done means
Three phones calibrate, three players hunt distinct objects, each phone's dial visibly peaks over the correct object, and the first valid 2s hold flares that player's lamp and ends the round — with no phone ever having revealed another's target.
